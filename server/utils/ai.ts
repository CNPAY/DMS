import OpenAI from 'openai'
// 预留：import Anthropic from 'anthropic' 等其他SDK
import prisma from '~/server/utils/db'

export type AIServiceKey = 'openai' | 'claude' | 'gemini' | 'moonshot' | 'zhipu' | 'qwen' | 'deepseek'

export interface AIServiceConfig {
  serviceKey: AIServiceKey
  apiKey: string
  baseUrl: string
  models?: string[]
  serviceName?: string
  description?: string
  model?: string
}

let aiServiceConfig: AIServiceConfig | null = null
let openaiInstance: OpenAI | null = null

export async function loadAIServiceConfig() {
  const setting = await prisma.systemSetting.findUnique({ where: { settingKey: 'ai_service_config' } })
  if (setting?.settingValue) {
    try {
      aiServiceConfig = JSON.parse(setting.settingValue)
      if (aiServiceConfig?.baseUrl && aiServiceConfig.apiKey) {
        openaiInstance = new OpenAI({ apiKey: aiServiceConfig.apiKey, baseURL: aiServiceConfig.baseUrl })
      } else {
        openaiInstance = null
      }
    } catch {
      aiServiceConfig = null
      openaiInstance = null
    }
  } else {
    aiServiceConfig = null
    openaiInstance = null
  }
}

export function getAIServiceConfig(): AIServiceConfig | null {
  return aiServiceConfig
}

export function useAI(): OpenAI | null {
  return openaiInstance
}

export async function refreshAIServiceConfig() {
  await loadAIServiceConfig()
}

// 启动时自动加载
loadAIServiceConfig() 