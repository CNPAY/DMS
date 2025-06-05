import Joi from 'joi'
import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

// 验证 schema
const updateStatusSchema = Joi.object({
  id: Joi.number().integer().required(),
  status: Joi.string().valid('new', 'contacted', 'negotiating', 'accepted', 'rejected', 'closed').required(),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // 验证请求数据
    const { error, value } = updateStatusSchema.validate(body)
    if (error) {
      return ResponseData.error(`数据验证失败: ${error.details[0].message}`, 400)
    }

    const { id, status } = value

    // 检查询盘是否存在
    const existingInquiry = await prisma.inquiry.findUnique({
      where: { id }
    })

    if (!existingInquiry) {
      return ResponseData.error('询盘不存在', 404)
    }

    // 更新询盘状态
    const updatedInquiry = await prisma.inquiry.update({
      where: { id },
      data: { status },
      include: {
        domain: {
          select: {
            id: true,
            domainName: true
          }
        },
        portfolio: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    return ResponseData.success(updatedInquiry, '询盘状态更新成功')
  } catch (error: any) {
    console.error('更新询盘状态失败:', error)
    return ResponseData.error(error.message || '更新询盘状态失败', 500)
  }
})