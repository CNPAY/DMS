import { ResponseData } from '~/server/utils/response'
import { useAI, getAIServiceConfig } from '~/server/utils/ai'
import prisma from '~/server/utils/db'
import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { sceneCode, input = {}, model: reqModel } = body
    if (!sceneCode) return ResponseData.error('缺少sceneCode', 400)
    // 1. 查找系统/自定义提示词
    let systemPrompt = ''
    let userPrompt = ''
    // 1.1 系统默认
    const promptPath = path.resolve('server/config/prompts', `${sceneCode}.txt`)
    if (fs.existsSync(promptPath)) {
      systemPrompt = fs.readFileSync(promptPath, 'utf-8')
    }
    // 1.2 用户自定义
    const dbPrompt = await prisma.aiPrompt.findFirst({ where: { sceneCode } })
    if (dbPrompt && dbPrompt.enabled !== false && dbPrompt.userPromptCustom) {
      userPrompt = dbPrompt.userPromptCustom
    }
    // 2. 拼接最终 prompt
    const promptTpl = userPrompt || systemPrompt
    if (!promptTpl) return ResponseData.error('未配置该场景的提示词', 400)
    // 拼接域名信息
    let infoArr = []
    if (input.domainName) infoArr.push(`域名：${input.domainName}`)
    if (input.domainRegDate) infoArr.push(`注册时间：${input.domainRegDate}`)
    if (input.domainRegPrice) infoArr.push(`注册价格：${input.domainRegPrice}`)
    const infoStr = infoArr.length ? `\n\n${infoArr.join('，')}` : ''
    const prompt = promptTpl + infoStr
    // 3. 调用AI
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
    
    return ResponseData.success({ content: result }, 'AI生成成功')
  } catch (error: any) {
    console.error('AI适配层生成失败:', error)
    return ResponseData.error('AI适配层生成失败: ' + (error?.message || '未知错误'))
  }
}) 