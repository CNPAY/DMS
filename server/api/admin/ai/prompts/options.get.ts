import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    // 预定义的AI场景
    const scenes = [
      {
        code: 'domain_analysis',
        name: '域名分析',
        description: '分析域名的商业价值、可用性等'
      },
      {
        code: 'domain_tags_suggest',
        name: '域名标签建议',
        description: '为域名推荐合适的标签'
      },
      {
        code: 'domain_description_generate',
        name: '域名描述生成',
        description: '生成域名的营销描述'
      },
      {
        code: 'domain_price_suggest',
        name: '域名定价建议',
        description: '分析域名价值并建议售价'
      },
      {
        code: 'inquiry_analysis',
        name: '询盘分析',
        description: '分析客户询盘意图和价值'
      },
      {
        code: 'inquiry_reply_suggest',
        name: '询盘回复建议',
        description: '生成个性化的询盘回复建议'
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

    // 预定义的AI模型
    const models = [
      {
        value: 'auto',
        label: '自动选择',
        description: '系统根据场景自动选择最适合的模型'
      },
      {
        value: 'gpt-4',
        label: 'GPT-4',
        description: 'OpenAI GPT-4 模型，适合复杂分析'
      },
      {
        value: 'gpt-4-turbo',
        label: 'GPT-4 Turbo',
        description: 'OpenAI GPT-4 Turbo，性能更快'
      },
      {
        value: 'gpt-3.5-turbo',
        label: 'GPT-3.5 Turbo',
        description: 'OpenAI GPT-3.5 Turbo，成本较低'
      },
      {
        value: 'claude-3-opus',
        label: 'Claude-3 Opus',
        description: 'Anthropic Claude-3 Opus，文本分析优秀'
      },
      {
        value: 'claude-3-sonnet',
        label: 'Claude-3 Sonnet',
        description: 'Anthropic Claude-3 Sonnet，平衡性能'
      },
      {
        value: 'claude-3-haiku',
        label: 'Claude-3 Haiku',
        description: 'Anthropic Claude-3 Haiku，响应快速'
      },
      {
        value: 'gemini-pro',
        label: 'Gemini Pro',
        description: 'Google Gemini Pro，多模态能力'
      },
      {
        value: 'moonshot-v1-8k',
        label: 'Moonshot v1 8K',
        description: '月之暗面 Moonshot v1 8K'
      },
      {
        value: 'moonshot-v1-32k',
        label: 'Moonshot v1 32K',
        description: '月之暗面 Moonshot v1 32K'
      },
      {
        value: 'moonshot-v1-128k',
        label: 'Moonshot v1 128K',
        description: '月之暗面 Moonshot v1 128K'
      },
      {
        value: 'glm-4',
        label: 'GLM-4',
        description: '智谱AI GLM-4'
      },
      {
        value: 'glm-3-turbo',
        label: 'GLM-3 Turbo',
        description: '智谱AI GLM-3 Turbo'
      },
      {
        value: 'qwen-turbo',
        label: 'Qwen Turbo',
        description: '阿里云通义千问 Turbo'
      },
      {
        value: 'qwen-plus',
        label: 'Qwen Plus',
        description: '阿里云通义千问 Plus'
      },
      {
        value: 'qwen-max',
        label: 'Qwen Max',
        description: '阿里云通义千问 Max'
      }
    ]

    return ResponseData.success({
      scenes,
      models
    }, '获取AI场景和模型选项成功')

  } catch (error: any) {
    console.error('获取AI选项失败:', error)
    return ResponseData.error('获取AI选项失败', 500)
  }
}) 