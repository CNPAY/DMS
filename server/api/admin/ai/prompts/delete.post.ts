import Joi from 'joi'
import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

// 验证schema
const deletePromptSchema = Joi.object({
  ids: Joi.array().items(Joi.number().required()).min(1).required()
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // 验证请求数据
    const { error, value } = deletePromptSchema.validate(body)
    if (error) {
      return ResponseData.error(`数据验证失败: ${error.details[0].message}`, 400)
    }

    const { ids } = value
    const userId = 1 // 单用户系统，固定用户ID为1

    // 检查要删除的提示词是否都存在且属于当前用户
    const existingPrompts = await prisma.aiPrompt.findMany({
      where: {
        id: { in: ids },
        userId
      },
      select: { id: true, sceneName: true }
    })

    if (existingPrompts.length !== ids.length) {
      const existingIds = existingPrompts.map(p => p.id)
      const notFoundIds = ids.filter((id: number) => !existingIds.includes(id))
      return ResponseData.error(`提示词 ID ${notFoundIds.join(', ')} 不存在或无权限访问`, 404)
    }

    // 执行删除操作
    const deleteResult = await prisma.aiPrompt.deleteMany({
      where: {
        id: { in: ids },
        userId
      }
    })

    return ResponseData.success({
      deletedCount: deleteResult.count,
      deletedPrompts: existingPrompts.map(p => ({
        id: p.id,
        sceneName: p.sceneName
      }))
    }, `成功删除 ${deleteResult.count} 个提示词`)

  } catch (error: any) {
    console.error('删除AI提示词失败:', error)
    return ResponseData.error(error.message || '删除AI提示词失败', 500)
  }
}) 