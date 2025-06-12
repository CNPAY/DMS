import { ResponseData } from '~/server/utils/response'
import { useAI, getAIServiceConfig } from '~/server/utils/ai'

// TODO: 可扩展支持更多服务商
const SERVICE_MAP = {
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo']
  }
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { model: reqModel, prompt } = body
    const config = getAIServiceConfig()
    if (!config) return ResponseData.error('AI服务未配置', 400)
    let result = ''
    const openai = useAI()
    if (!openai) return ResponseData.error('OpenAI未配置或未启用', 400)
    const modelToUse = reqModel || config.model || config.models?.[0] || 'gpt-3.5-turbo'
    const completion = await openai.chat.completions.create({
      model: modelToUse,
      messages: [
        { role: 'user', content: prompt }
      ]
    })
    result = completion.choices?.[0]?.message?.content || ''
    return ResponseData.success({ result }, 'AI调用成功')
  } catch (error: any) {
    console.error('AI适配层调用失败:', error)
    return ResponseData.error('AI适配层调用失败: ' + (error?.message || '未知错误'))
  }
}) 