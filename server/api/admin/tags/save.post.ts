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
        // 直接返回已存在标签id和name
        return ResponseData.success({ id: duplicateTag.id, name: duplicateTag.name }, '标签已存在，直接返回')
      }

      // 更新标签
      const tag = await prisma.domainTag.update({
        where: { id },
        data: {
          name: value.name
        }
      })

      return ResponseData.success({ id: tag.id, name: tag.name }, '域名标签更新成功')
    } else {
      // 支持批量标签
      const names = value.name.split(',').map((n: string) => n.trim()).filter((n: string) => n)
      if (names.length > 1) {
        // 批量模式
        const tagResults = []
        for (const name of names) {
          // 检查标签名称是否已存在
          const existingTag = await prisma.domainTag.findFirst({
            where: {
              userId,
              name
            }
          })
          if (existingTag) {
            tagResults.push({ id: existingTag.id, name: existingTag.name })
            continue
          }
          // 创建新标签
          const tag = await prisma.domainTag.create({
            data: {
              userId,
              name
            }
          })
          tagResults.push({ id: tag.id, name: tag.name })
        }
        return ResponseData.success(tagResults, '批量标签处理成功')
      }
      // 新增/查找模式
      // 检查标签名称是否已存在
      const existingTag = await prisma.domainTag.findFirst({
        where: {
          userId,
          name: value.name
        }
      })

      if (existingTag) {
        // 直接返回已存在标签id和name
        return ResponseData.success({ id: existingTag.id, name: existingTag.name }, '标签已存在，直接返回')
      }

      // 创建新标签
      const tag = await prisma.domainTag.create({
        data: {
          userId,
          name: value.name
        }
      })

      return ResponseData.success({ id: tag.id, name: tag.name }, '域名标签创建成功')
    }
  } catch (error: any) {
    console.error('保存域名标签失败:', error)
    return ResponseData.error('保存域名标签失败', 500)
  }
}) 