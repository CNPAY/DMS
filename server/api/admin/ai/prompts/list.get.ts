import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const pageSize = parseInt(query.pageSize as string) || 10
    const search = query.search as string || ''
    const sceneCode = query.sceneCode as string || ''
    
    const userId = 1 // 单用户系统，固定用户ID为1

    // 构建查询条件
    const where: any = {
      userId: userId
    }

    // 搜索条件
    if (search) {
      where.OR = [
        { sceneName: { contains: search } },
        { sceneCode: { contains: search } }
      ]
    }

    // 场景代码过滤
    if (sceneCode) {
      where.sceneCode = sceneCode
    }

    // 获取总数
    const total = await prisma.aiPrompt.count({ where })

    // 获取分页数据
    const prompts = await prisma.aiPrompt.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { updatedAt: 'desc' }
    })

    // 处理数据
    const promptList = prompts.map(prompt => ({
      id: prompt.id,
      sceneCode: prompt.sceneCode,
      sceneName: prompt.sceneName,
      systemPromptDefault: prompt.systemPromptDefault,
      userPromptCustom: prompt.userPromptCustom,
      isActiveCustom: prompt.isActiveCustom,
      modelPreference: prompt.modelPreference,
      hasCustomPrompt: !!prompt.userPromptCustom,
      currentPrompt: prompt.isActiveCustom && prompt.userPromptCustom ? prompt.userPromptCustom : prompt.systemPromptDefault,
      createdAt: prompt.createdAt,
      updatedAt: prompt.updatedAt
    }))

    return ResponseData.success({
      list: promptList,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    }, '获取AI提示词列表成功')

  } catch (error: any) {
    console.error('获取AI提示词列表失败:', error)
    return ResponseData.error('获取AI提示词列表失败', 500)
  }
}) 