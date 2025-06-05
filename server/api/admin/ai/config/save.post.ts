import Joi from 'joi'
import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

// 验证 schema
const saveConfigSchema = Joi.object({
  serviceKey: Joi.string().required(),
  apiKey: Joi.string().allow('').optional(),
  baseUrl: Joi.string().uri().optional(),
  enabled: Joi.boolean().default(false)
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // 验证请求数据
    const { error, value } = saveConfigSchema.validate(body)
    if (error) {
      return ResponseData.error(`数据验证失败: ${error.details[0].message}`, 400)
    }

    const { serviceKey, apiKey, baseUrl, enabled } = value
    const AI_CONFIG_PREFIX = 'ai_service_'
    const userId = 1 // 单用户系统，固定用户ID为1

    // 预定义服务列表（用于验证）
    const validServices = ['openai', 'claude', 'gemini', 'moonshot', 'zhipu', 'qwen']
    if (!validServices.includes(serviceKey)) {
      return ResponseData.error('不支持的AI服务类型', 400)
    }

    // 使用事务批量更新配置
    await prisma.$transaction(async (tx) => {
      const operations = []

      // API Key 配置
      if (apiKey !== undefined) {
        const apiKeySettingKey = `${AI_CONFIG_PREFIX}${serviceKey}_api_key`
        if (apiKey === '') {
          // 删除API Key
          operations.push(
            tx.systemSetting.deleteMany({
              where: { settingKey: apiKeySettingKey }
            })
          )
        } else {
          // 更新或创建API Key
          operations.push(
            tx.systemSetting.upsert({
              where: { settingKey: apiKeySettingKey },
              update: { 
                settingValue: apiKey,
                userId: userId
              },
              create: {
                settingKey: apiKeySettingKey,
                settingValue: apiKey,
                userId: userId
              }
            })
          )
        }
      }

      // Base URL 配置
      if (baseUrl !== undefined) {
        const baseUrlSettingKey = `${AI_CONFIG_PREFIX}${serviceKey}_base_url`
        operations.push(
          tx.systemSetting.upsert({
            where: { settingKey: baseUrlSettingKey },
            update: { 
              settingValue: baseUrl,
              userId: userId
            },
            create: {
              settingKey: baseUrlSettingKey,
              settingValue: baseUrl,
              userId: userId
            }
          })
        )
      }

      // 启用状态配置
      const enabledSettingKey = `${AI_CONFIG_PREFIX}${serviceKey}_enabled`
      operations.push(
        tx.systemSetting.upsert({
          where: { settingKey: enabledSettingKey },
          update: { 
            settingValue: enabled.toString(),
            userId: userId
          },
          create: {
            settingKey: enabledSettingKey,
            settingValue: enabled.toString(),
            userId: userId
          }
        })
      )

      // 执行所有操作
      await Promise.all(operations)
    })

    return ResponseData.success(null, `${serviceKey} AI服务配置保存成功`)

  } catch (error: any) {
    console.error('保存AI服务配置失败:', error)
    return ResponseData.error(error.message || '保存AI服务配置失败', 500)
  }
}) 