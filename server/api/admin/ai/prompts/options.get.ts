import { ResponseData } from '~/server/utils/response'
import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  try {
    // 1. 预设场景元数据
    const scenes = [
      {
        code: 'domain_description_generate',
        name: '域名描述生成',
        description: '生成域名的营销描述'
      },
      {
        code: 'domain_tags_suggest',
        name: '域名标签建议',
        description: '为域名推荐合适的标签'
      },
      {
        code: 'inquiry_analysis',
        name: '线索分析',
        description: '分析客户线索意图和价值'
      },
      {
        code: 'domain_price_suggest',
        name: '域名定价建议',
        description: '分析域名价值并建议售价'
      },
      {
        code: 'inquiry_reply_suggest',
        name: '线索回复建议',
        description: '生成个性化的线索回复建议'
      },
      {
        code: 'market_research',
        name: '市场研究',
        description: '分析域名相关的市场趋势'
      },
      {
        code: 'competitor_analysis',
        name: '竞品分析',
        description: '分析竞争对手的域名策略'
      },
      {
        code: 'seo_analysis',
        name: 'SEO分析',
        description: '分析域名的SEO潜力'
      },
      {
        code: 'brand_matching',
        name: '品牌匹配',
        description: '分析域名与品牌的匹配度'
      },
      {
        code: 'chatbot_assistant',
        name: 'ChatBot助手',
        description: '智能客服和咨询助手'
      },
      {
        code: 'content_generation',
        name: '内容生成',
        description: '生成着陆页和米表内容'
      }
    ]
    // 2. 读取txt内容作为systemPrompt
    const promptsDir = path.resolve('server/config/prompts')
    const scenesWithPrompt = scenes.map(scene => {
      const promptPath = path.join(promptsDir, `${scene.code}.txt`)
      let systemPrompt = ''
      if (fs.existsSync(promptPath)) {
        systemPrompt = fs.readFileSync(promptPath, 'utf-8')
      }
      return { ...scene, systemPrompt }
    })
    return ResponseData.success({ scenes: scenesWithPrompt }, '获取AI场景和系统提示词成功')
  } catch (error: any) {
    console.error('获取AI选项失败:', error)
    return ResponseData.error('获取AI选项失败', 500)
  }
}) 