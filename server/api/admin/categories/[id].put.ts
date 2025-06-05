import prisma from '~/server/utils/db'
import Joi from 'joi'
import { ResponseData } from '~/server/utils/response'

// 数据验证 schema
const categoryUpdateSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.empty': '分类名称不能为空',
    'string.max': '分类名称不能超过100个字符',
    'any.required': '分类名称为必填项'
  }),
  description: Joi.string().max(1000).allow('').optional().messages({
    'string.max': '分类描述不能超过1000个字符'
  })
})

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(getRouterParam(event, 'id') as string)
    const body = await readBody(event)
    
    if (isNaN(id)) {
      return ResponseData.error('无效的分类ID', 400)
    }

    // 数据验证
    const { error, value } = categoryUpdateSchema.validate(body)
    if (error) {
      return ResponseData.error(error.details[0].message, 400)
    }

    // 获取用户信息（从认证中间件或 session）
    const userId = 1 // 临时硬编码，实际应从认证获取

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

    // 检查分类名称是否与其他分类重名
    const duplicateCategory = await prisma.domainCategory.findFirst({
      where: {
        userId,
        name: value.name,
        id: { not: id }
      }
    })

    if (duplicateCategory) {
      return ResponseData.error('该分类名称已存在', 409)
    }

    // 更新分类
    const category = await prisma.domainCategory.update({
      where: { id },
      data: {
        name: value.name,
        description: value.description || null
      }
    })

    return ResponseData.success(category, '域名分类更新成功')
  } catch (error: any) {
    console.error('更新域名分类失败:', error)
    return ResponseData.error('更新域名分类失败', 500)
  }
}) 