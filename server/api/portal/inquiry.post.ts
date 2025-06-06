import prisma from '~/server/utils/db'
import Joi from 'joi'

// 验证规则
const inquirySchema = Joi.object({
  domainId: Joi.number().integer().positive().required(),
  visitorName: Joi.string().max(100).required(),
  visitorEmail: Joi.string().email().max(255).required(),
  visitorPhone: Joi.string().max(50).optional().allow(''),
  offerPrice: Joi.number().positive().optional().allow(null),
  message: Joi.string().required()
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // 验证数据
    const { error, value } = inquirySchema.validate(body)
    if (error) {
      return {
        success: false,
        message: `数据验证失败: ${error.details[0].message}`,
        data: null
      }
    }

    // 获取客户端IP和User-Agent
    const clientIP = getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || '未知'
    const userAgent = getHeader(event, 'user-agent') || '未知'

    // 验证域名是否存在
    const domain = await prisma.domain.findUnique({
      where: { id: value.domainId },
      select: { 
        id: true, 
        domainName: true,
        salesStatus: true 
      }
    })

    if (!domain) {
      return {
        success: false,
        message: '域名不存在',
        data: null
      }
    }

    // 检查域名销售状态
    if (domain.salesStatus !== 1 && domain.salesStatus !== 2) {
      return {
        success: false,
        message: '该域名暂不对外销售',
        data: null
      }
    }

    // 创建线索记录
    const inquiry = await prisma.inquiry.create({
      data: {
        domainId: value.domainId,
        visitorName: value.visitorName,
        visitorEmail: value.visitorEmail,
        visitorPhone: value.visitorPhone || null,
        offerPrice: value.offerPrice || null,
        message: value.message,
        status: 'new',
        ipAddress: clientIP,
        userAgent: userAgent
      }
    })

    return {
      success: true,
      message: '线索提交成功',
      data: {
        inquiryId: inquiry.id,
        domainName: domain.domainName
      }
    }
  } catch (error) {
    console.error('提交线索失败:', error)
    return {
      success: false,
      message: '系统错误，请稍后重试',
      data: null
    }
  }
}) 