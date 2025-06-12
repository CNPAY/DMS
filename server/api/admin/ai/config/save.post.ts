import Joi from 'joi'
import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

// 验证 schema
const saveConfigSchema = Joi.object({
  serviceKey: Joi.string().required(),
  apiKey: Joi.string().allow('').optional(),
  baseUrl: Joi.string().uri().optional(),
  models: Joi.array().items(Joi.string()).optional(),
  model: Joi.string().optional(),
  description: Joi.string().optional(),
  serviceName: Joi.string().optional(),
  testing: Joi.boolean().optional()
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    // 验证请求数据
    const { error, value } = saveConfigSchema.validate(body)
    if (error) {
      return ResponseData.error(`数据验证失败: ${error.details[0].message}`, 400)
    }
    // 只存一条主用AI服务商配置
    await prisma.systemSetting.upsert({
      where: { settingKey: 'ai_service_config' },
      update: { settingValue: JSON.stringify(value) },
      create: { settingKey: 'ai_service_config', settingValue: JSON.stringify(value) }
    })
    return ResponseData.success(null, 'AI服务配置保存成功')
  } catch (error: any) {
    console.error('保存AI服务配置失败:', error)
    return ResponseData.error(error.message || '保存AI服务配置失败', 500)
  }
}) 