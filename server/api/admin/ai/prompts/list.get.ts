import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'
import fs from 'fs'
import path from 'path'
import { getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const search = query.search as string || ''
    const userId = 1 // 单用户系统，固定用户ID为1

    // 1. 读取系统预设场景及 systemPrompt
    const systemScenes = [
      { code: 'domain_description_generate', name: '域名描述生成', description: '生成域名的营销描述' },
      { code: 'domain_tags_suggest', name: '域名标签建议', description: '为域名推荐合适的标签' },
      { code: 'inquiry_analysis', name: '线索分析', description: '分析客户线索意图和价值' },
      { code: 'domain_analysis', name: '域名分析', description: '分析域名的商业价值、可用性等' },
      { code: 'domain_price_suggest', name: '域名定价建议', description: '分析域名价值并建议售价' },
      { code: 'inquiry_reply_suggest', name: '线索回复建议', description: '生成个性化的线索回复建议' },
      { code: 'market_research', name: '市场研究', description: '分析域名相关的市场趋势' },
      { code: 'competitor_analysis', name: '竞品分析', description: '分析竞争对手的域名策略' },
      { code: 'seo_analysis', name: 'SEO分析', description: '分析域名的SEO潜力' },
      { code: 'brand_matching', name: '品牌匹配', description: '分析域名与品牌的匹配度' },
      { code: 'chatbot_assistant', name: 'ChatBot助手', description: '智能客服和咨询助手' },
      { code: 'content_generation', name: '内容生成', description: '生成着陆页和米表内容' }
    ]
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