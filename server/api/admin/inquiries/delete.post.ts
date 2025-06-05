import Joi from 'joi'
import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

// 验证 schema
const deleteSchema = Joi.object({
  ids: Joi.array().items(Joi.number().integer()).min(1).required(),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // 验证请求数据
    const { error, value } = deleteSchema.validate(body)
    if (error) {
      return ResponseData.error(`数据验证失败: ${error.details[0].message}`, 400)
    }

    const { ids } = value

    // 检查询盘是否存在
    const existingInquiries = await prisma.inquiry.findMany({
      where: { id: { in: ids } }
    })

    if (existingInquiries.length !== ids.length) {
      return ResponseData.error('部分询盘不存在', 404)
    }

    // 批量删除询盘
    await prisma.inquiry.deleteMany({
      where: { id: { in: ids } }
    })

    return ResponseData.success(null, `成功删除 ${ids.length} 条询盘记录`)
  } catch (error: any) {
    console.error('删除询盘失败:', error)
    return ResponseData.error(error.message || '删除询盘失败', 500)
  }
}) 