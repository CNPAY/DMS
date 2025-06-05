import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    // AI服务配置的key前缀
    const AI_CONFIG_PREFIX = 'ai_service_'
    
    // 获取所有AI相关的系统配置
    const aiConfigs = await prisma.systemSetting.findMany({
      where: {
        settingKey: {
          startsWith: AI_CONFIG_PREFIX
        }
      },
      orderBy: {
        settingKey: 'asc'
      }
    })

    // 预定义的AI服务列表
    const predefinedServices = [
      {
        key: 'openai',
        name: 'OpenAI',
        description: 'OpenAI GPT-4, GPT-3.5-turbo 等模型',
        baseUrl: 'https://api.openai.com/v1',
        models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo']
      },
      {
        key: 'claude',
        name: 'Anthropic Claude',
        description: 'Claude-3, Claude-2 等模型',
        baseUrl: 'https://api.anthropic.com',
        models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku']
      },
      {
        key: 'gemini',
        name: 'Google Gemini',
        description: 'Gemini Pro, Gemini Pro Vision 等模型',
        baseUrl: 'https://generativelanguage.googleapis.com/v1',
        models: ['gemini-pro', 'gemini-pro-vision']
      },
      {
        key: 'moonshot',
        name: 'Moonshot (月之暗面)',
        description: 'Moonshot v1 系列模型',
        baseUrl: 'https://api.moonshot.cn/v1',
        models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k']
      },
      {
        key: 'zhipu',
        name: '智谱AI (GLM)',
        description: 'ChatGLM 系列模型',
        baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
        models: ['glm-4', 'glm-3-turbo']
      },
      {
        key: 'qwen',
        name: '通义千问 (Qwen)',
        description: '阿里云通义千问系列模型',
        baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        models: ['qwen-turbo', 'qwen-plus', 'qwen-max']
      }
    ]

    // 构建配置数据，合并预定义服务和用户配置
    const configList = predefinedServices.map(service => {
      const apiKeyConfig = aiConfigs.find(config => 
        config.settingKey === `${AI_CONFIG_PREFIX}${service.key}_api_key`
      )
      const baseUrlConfig = aiConfigs.find(config => 
        config.settingKey === `${AI_CONFIG_PREFIX}${service.key}_base_url`
      )
      const enabledConfig = aiConfigs.find(config => 
        config.settingKey === `${AI_CONFIG_PREFIX}${service.key}_enabled`
      )

      return {
        serviceKey: service.key,
        serviceName: service.name,
        description: service.description,
        defaultBaseUrl: service.baseUrl,
        baseUrl: baseUrlConfig?.settingValue || service.baseUrl,
        apiKey: apiKeyConfig?.settingValue || '',
        enabled: enabledConfig?.settingValue === 'true',
        models: service.models,
        hasApiKey: !!apiKeyConfig?.settingValue,
        lastUpdated: apiKeyConfig?.userId ? 
          Math.max(
            apiKeyConfig ? new Date(apiKeyConfig.settingKey).getTime() : 0,
            baseUrlConfig ? new Date(baseUrlConfig.settingKey).getTime() : 0,
            enabledConfig ? new Date(enabledConfig.settingKey).getTime() : 0
          ) : null
      }
    })

    return ResponseData.success({
      configs: configList,
      total: configList.length
    }, 'AI服务配置列表获取成功')

  } catch (error: any) {
    console.error('获取AI服务配置失败:', error)
    return ResponseData.error('获取AI服务配置失败', 500)
  }
})