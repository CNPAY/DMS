import prisma from '~/server/utils/db'
import Joi from 'joi'
import { ResponseData } from '~/server/utils/response'

// 数据验证 schema
const deleteSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    'any.required': '标签ID为必填项',
    'number.base': '标签ID必须为数字'
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
    const userId = 1 // 临时硬编码，实际应从认证获取

    // 检查标签是否存在
    const existingTag = await prisma.domainTag.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!existingTag) {
      return ResponseData.error('域名标签不存在', 404)
    }

    // 检查是否有域名在使用此标签
    const domainCount = await prisma.domainTagMap.count({
      where: {
        tagId: id
      }
    })

    if (domainCount > 0) {
      return ResponseData.error(`该标签正在被 ${domainCount} 个域名使用，无法删除`, 409)
    }

    // 删除标签
    await prisma.domainTag.delete({
      where: { id }
    })

    return ResponseData.success(null, '域名标签删除成功')
  } catch (error: any) {
    console.error('删除域名标签失败:', error)
    return ResponseData.error('删除域名标签失败', 500)
  }
}) 