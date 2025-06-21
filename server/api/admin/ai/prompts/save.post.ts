import Joi from 'joi'
import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

// 验证schema
const savePromptSchema = Joi.object({
  id: Joi.number().optional().allow(null),
  sceneCode: Joi.string().max(100).required(),
  sceneName: Joi.string().max(200).required(),
  systemPromptDefault: Joi.string().required(),
  userPromptCustom: Joi.string().allow('').optional(),
  modelPreference: Joi.string().max(100).optional().allow(''),
  enabled: Joi.boolean().optional()
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // 验证请求数据
    const { error, value } = savePromptSchema.validate(body)
    if (error) {
      return ResponseData.error(`数据验证失败: ${error.details[0].message}`, 400)
    }

    const { id, sceneCode, sceneName, systemPromptDefault, userPromptCustom, modelPreference, enabled } = value
    const userId =  event.context.auth.userId // 单用户系统，固定用户ID为1

    let savedPrompt

    if (id) {
      // 更新已有提示词
      // 检查是否存在
      const existingPrompt = await prisma.aiPrompt.findFirst({
        where: { id, userId }
      })

      if (!existingPrompt) {
        return ResponseData.error('提示词不存在', 404)
      }

      // 检查sceneCode是否重复（排除自己）
      const duplicatePrompt = await prisma.aiPrompt.findFirst({
        where: {
          userId,
          sceneCode,
          id: { not: id }
        }
      })

      if (duplicatePrompt) {
        return ResponseData.error('场景代码已存在', 409)
      }

      savedPrompt = await prisma.aiPrompt.update({
        where: { id },
        data: {
          sceneCode,
          sceneName,
          systemPromptDefault,
          userPromptCustom: userPromptCustom || null,
          modelPreference: modelPreference || null,
          enabled: typeof enabled === 'boolean' ? enabled : true
        }
      })
    } else {
      // 新增提示词
      // 检查sceneCode是否重复
      const existingPrompt = await prisma.aiPrompt.findFirst({
        where: { userId, sceneCode }
      })

      if (existingPrompt) {
        return ResponseData.error('场景代码已存在', 409)
      }

      savedPrompt = await prisma.aiPrompt.create({
        data: {
          userId,
          sceneCode,
          sceneName,
          systemPromptDefault,
          userPromptCustom: userPromptCustom || null,
          modelPreference: modelPreference || null,
          enabled: typeof enabled === 'boolean' ? enabled : true
        }
      })
    }

    // 返回保存后的数据
    const result = {
      id: savedPrompt.id,
      sceneCode: savedPrompt.sceneCode,
      sceneName: savedPrompt.sceneName,
      systemPromptDefault: savedPrompt.systemPromptDefault,
      userPromptCustom: savedPrompt.userPromptCustom,
      modelPreference: savedPrompt.modelPreference,
      hasCustomPrompt: !!savedPrompt.userPromptCustom,
      currentPrompt: savedPrompt.userPromptCustom ? savedPrompt.userPromptCustom : savedPrompt.systemPromptDefault,
      createdAt: savedPrompt.createdAt,
      updatedAt: savedPrompt.updatedAt
    }

    return ResponseData.success(result, `提示词${id ? '更新' : '创建'}成功`)

  } catch (error: any) {
    console.error('保存AI提示词失败:', error)
    
    // 处理唯一约束错误
    if (error.code === 'P2002') {
      return ResponseData.error('场景代码已存在，请使用不同的场景代码', 409)
    }
    
    return ResponseData.error(error.message || '保存AI提示词失败', 500)
  }
}) 