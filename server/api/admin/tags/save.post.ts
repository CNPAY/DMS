import prisma from '~/server/utils/db'
import Joi from 'joi'
import { ResponseData } from '~/server/utils/response'

// 数据验证 schema
const tagSchema = Joi.object({
  id: Joi.number().integer().allow(null).optional(),
  name: Joi.string().min(1).max(50).required().messages({
    'string.empty': '标签名称不能为空',
    'string.max': '标签名称不能超过50个字符',
    'any.required': '标签名称为必填项'
  })
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // 数据验证
    const { error, value } = tagSchema.validate(body)
    if (error) {
      return ResponseData.error(error.details[0].message, 400)
    }

    // 获取用户信息（从认证中间件或 session）
    const userId = 1 // 临时硬编码，实际应从认证获取

    if (value.id) {
      // 编辑模式
      const id = value.id

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

      // 检查标签名称是否与其他标签重名
      const duplicateTag = await prisma.domainTag.findFirst({
        where: {
          userId,
          name: value.name,
          id: { not: id }
        }
      })

      if (duplicateTag) {
        return ResponseData.error('该标签名称已存在', 409)
      }

      // 更新标签
      const tag = await prisma.domainTag.update({
        where: { id },
        data: {
          name: value.name
        }
      })

      return ResponseData.success(tag, '域名标签更新成功')
    } else {
      // 新增模式
      
      // 检查标签名称是否已存在
      const existingTag = await prisma.domainTag.findFirst({
        where: {
          userId,
          name: value.name
        }
      })

      if (existingTag) {
        return ResponseData.error('该标签名称已存在', 409)
      }

      // 创建新标签
      const tag = await prisma.domainTag.create({
        data: {
          userId,
          name: value.name
        }
      })

      return ResponseData.success(tag, '域名标签创建成功')
    }
  } catch (error: any) {
    console.error('保存域名标签失败:', error)
    return ResponseData.error('保存域名标签失败', 500)
  }
}) 