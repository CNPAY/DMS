import prisma from '~/server/utils/db'
import Joi from 'joi'
import { ResponseData } from '~/server/utils/response'

// 数据验证 schema
const deleteSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    'any.required': '分类ID为必填项',
    'number.base': '分类ID必须为数字'
  })
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // 数据验证
    const { error, value } = deleteSchema.validate(body)
    if (error) {
      return ResponseData.error(error.details[0].message, 400)
    }

    const id = value.id

    // 获取用户信息（从认证中间件或 session）
    const userId =  event.context.auth.userId // 临时硬编码，实际应从认证获取

    // 检查分类是否存在
    const existingCategory = await prisma.domainCategory.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!existingCategory) {
      return ResponseData.error('域名分类不存在', 404)
    }

    // 检查是否有域名在使用此分类
    const domainCount = await prisma.domain.count({
      where: {
        categoryId: id
      }
    })

    if (domainCount > 0) {
      return ResponseData.error(`该分类正在被 ${domainCount} 个域名使用，无法删除`, 409)
    }

    // 删除分类
    await prisma.domainCategory.delete({
      where: { id }
    })

    return ResponseData.success(null, '域名分类删除成功')
  } catch (error: any) {
    console.error('删除域名分类失败:', error)
    return ResponseData.error('删除域名分类失败', 500)
  }
}) 