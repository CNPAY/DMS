import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'
import fs from 'fs'
import path from 'path'
import { getQuery } from 'h3'
import { systemScenes } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const search = query.search as string || ''
    const userId = 1 // 单用户系统，固定用户ID为1

    
    const systemCodes = systemScenes.map(s => s.code)
    const promptsDir = path.resolve('server/config/prompts')
    const systemPromptMap: Record<string, string> = {}
    systemScenes.forEach(scene => {
      const promptPath = path.join(promptsDir, `${scene.code}.txt`)
      let systemPrompt = ''
      if (fs.existsSync(promptPath)) {
        systemPrompt = fs.readFileSync(promptPath, 'utf-8')
      }
      systemPromptMap[scene.code] = systemPrompt
    })

    // 2. 查询数据库所有提示词
    const dbPrompts = await prisma.aiPrompt.findMany({ where: { userId } })

    // 3. 合并逻辑
    let mergedList = systemScenes.map(scene => {
      const dbPrompt = dbPrompts.find(p => p.sceneCode === scene.code)
      const custom = false
      let enabled = true
      let canToggle = false
      let userPromptCustom = ''
      let extend = ''
      let createdAt = null
      let updatedAt = null
      if (dbPrompt) {
        enabled = dbPrompt.enabled !== false
        canToggle = true
        userPromptCustom = dbPrompt.userPromptCustom || ''
        createdAt = dbPrompt.createdAt
        updatedAt = dbPrompt.updatedAt
        if (enabled && userPromptCustom) {
          extend = userPromptCustom
        }
      }
      return {
        id: dbPrompt?.id || null,
        sceneCode: scene.code,
        sceneName: scene.name,
        description: scene.description,
        systemPromptDefault: systemPromptMap[scene.code] || '',
        userPromptCustom,
        enabled,
        custom,
        extend,
        canToggle,
        createdAt,
        updatedAt
      }
    })
    // 非系统场景
    dbPrompts.forEach(dbPrompt => {
      if (!systemCodes.includes(dbPrompt.sceneCode)) {
        const enabled = dbPrompt.enabled !== false
        const custom = true
        const canToggle = true
        const extend = ''
        mergedList.push({
          id: dbPrompt.id,
          sceneCode: dbPrompt.sceneCode,
          sceneName: dbPrompt.sceneName,
          description: '',
          systemPromptDefault: '',
          userPromptCustom: dbPrompt.userPromptCustom || '',
          enabled,
          custom,
          extend,
          canToggle,
          createdAt: dbPrompt.createdAt,
          updatedAt: dbPrompt.updatedAt
        })
      }
    })
    // 搜索过滤
    if (search) {
      mergedList = mergedList.filter(item =>
        (item.sceneName && item.sceneName.includes(search)) ||
        (item.sceneCode && item.sceneCode.includes(search))
      )
    }
    // 不分页，全部返回
    const total = mergedList.length
    return ResponseData.success({
      list: mergedList,
      total
    }, '获取AI提示词列表成功')
  } catch (error: any) {
    console.error('获取AI提示词列表失败:', error)
    return ResponseData.error('获取AI提示词列表失败', 500)
  }
}) 