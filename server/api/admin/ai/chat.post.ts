import { ResponseData } from '~/server/utils/response'
import { useAI, getAIServiceConfig } from '~/server/utils/ai'
import prisma from '~/server/utils/db'
import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { sceneCode, messages = [], extra = {}, model: reqModel } = body
    if (!sceneCode) return ResponseData.error('缺少sceneCode', 400)
    if (!Array.isArray(messages) || messages.length === 0) return ResponseData.error('messages不能为空', 400)
    // 1. 查找系统/自定义提示词
    let systemPrompt = ''
    let userPrompt = ''
    let usedSceneCode = sceneCode || 'default'
    // 1.1 系统默认
    const promptPath = path.resolve('server/config/prompts', `${usedSceneCode}.txt`)
    if (fs.existsSync(promptPath)) {
      systemPrompt = fs.readFileSync(promptPath, 'utf-8')
    }
    // 1.2 用户自定义（仅在有 sceneCode 时查找）
    if (sceneCode) {
      const dbPrompt = await prisma.aiPrompt.findFirst({ where: { sceneCode } })
      if (dbPrompt && dbPrompt.userPromptCustom) {
        userPrompt = dbPrompt.userPromptCustom
      }
    }
    // 2. 拼接 system 消息
    const promptTpl = userPrompt || systemPrompt
    if (!promptTpl) return ResponseData.error('未配置该场景的提示词', 400)
    // 结构化变量注入（如域名）
    let infoArr = []
    if (extra.domainName) infoArr.push(`域名：${extra.domainName}`)
    if (extra.domainRegDate) infoArr.push(`注册时间：${extra.domainRegDate}`)
    if (extra.domainRegPrice) infoArr.push(`注册价格：${extra.domainRegPrice}`)
    const infoStr = infoArr.length ? `\n\n${infoArr.join('，')}` : ''
    // system 消息放在最前
    const chatMessages = [
      { role: 'system', content: promptTpl + infoStr },
      ...messages.filter(m => m.role === 'user')
    ]
    // 3. 调用AI
    const config = getAIServiceConfig()
    if (!config) return ResponseData.error('AI服务未配置', 400)
    let result = ''
    const openai = useAI()
    if (!openai) return ResponseData.error('OpenAI未配置或未启用', 400)
    const modelToUse = reqModel || config.model || config.models?.[0] || 'gpt-3.5-turbo'
    const completion = await openai.chat.completions.create({
      model: modelToUse,
      messages: chatMessages
    })
    result = completion.choices?.[0]?.message?.content || ''
    return ResponseData.success({ content: result }, 'AI生成成功')
  } catch (error: any) {
    console.error('AI多轮对话失败:', error)
    return ResponseData.error('AI多轮对话失败: ' + (error?.message || '未知错误'))
  }
}) 