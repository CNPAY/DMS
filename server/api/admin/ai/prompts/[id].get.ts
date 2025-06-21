import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(getRouterParam(event, 'id') as string)
    
    if (!id || isNaN(id)) {
      return ResponseData.error('无效的提示词ID', 400)
    }

    const userId =  event.context.auth.userId // 单用户系统，固定用户ID为1

    // 查询提示词详情
    const prompt = await prisma.aiPrompt.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!prompt) {
      return ResponseData.error('提示词不存在', 404)
    }

    // 处理返回数据
    const result = {
      id: prompt.id,
      sceneCode: prompt.sceneCode,
      sceneName: prompt.sceneName,
      systemPromptDefault: prompt.systemPromptDefault,
      userPromptCustom: prompt.userPromptCustom,
      modelPreference: prompt.modelPreference,
      hasCustomPrompt: !!prompt.userPromptCustom,
      currentPrompt: prompt.isActiveCustom && prompt.userPromptCustom ? prompt.userPromptCustom : prompt.systemPromptDefault,
      createdAt: prompt.createdAt,
      updatedAt: prompt.updatedAt
    }

    return ResponseData.success(result, '获取提示词详情成功')

  } catch (error: any) {
    console.error('获取AI提示词详情失败:', error)
    return ResponseData.error('获取AI提示词详情失败', 500)
  }
}) 