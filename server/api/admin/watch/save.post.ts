import Joi from 'joi'
import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

// 验证 schema
const watchedDomainSchema = Joi.object({
  id: Joi.number().integer().optional(),
  domainName: Joi.string().required().max(255).custom((value, helpers) => {
    // 简单的域名格式验证
    const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/
    if (!domainPattern.test(value)) {
      return helpers.error('string.pattern.base', { message: '域名格式不正确' })
    }
    return value.toLowerCase()
  }),
  monitoringLevel: Joi.string().max(50).allow('', null).optional(),
  notes: Joi.string().allow('', null).optional(),
  notifyOnChange: Joi.boolean().default(true),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // 验证请求数据
    const { error, value } = watchedDomainSchema.validate(body, { stripUnknown: true })
    if (error) {
      return ResponseData.error(`数据验证失败: ${error.details[0].message}`, 400)
    }

    const { id, domainName, monitoringLevel, notes, notifyOnChange } = value

    if (id) {
      // 编辑操作
      const existingDomain = await prisma.watchedDomain.findFirst({
        where: {
          id,
          userId: 1
        }
      })

      if (!existingDomain) {
        return ResponseData.error('关注域名不存在', 404)
      }

      // 检查域名名称是否与其他记录重复
      const duplicateDomain = await prisma.watchedDomain.findFirst({
        where: {
          userId: 1,
          domainName,
          id: { not: id }
        }
      })

      if (duplicateDomain) {
        return ResponseData.error('该域名已在关注列表中', 409)
      }

      // 更新关注域名
      const updatedDomain = await prisma.watchedDomain.update({
        where: { id },
        data: {
          domainName,
          monitoringLevel: monitoringLevel || null,
          notes: notes || null,
          notifyOnChange,
        }
      })

      return ResponseData.success(updatedDomain, '关注域名更新成功')
    } else {
      // 新增操作
      // 检查域名是否已存在
      const existingDomain = await prisma.watchedDomain.findFirst({
        where: {
          userId: 1,
          domainName
        }
      })

      if (existingDomain) {
        return ResponseData.error('该域名已在关注列表中', 409)
      }

      // 创建新关注域名
      const newDomain = await prisma.watchedDomain.create({
        data: {
          userId: 1,
          domainName,
          monitoringLevel: monitoringLevel || null,
          notes: notes || null,
          notifyOnChange,
        }
      })

      return ResponseData.success(newDomain, '关注域名添加成功')
    }
  } catch (error: any) {
    console.error('保存关注域名失败:', error)

    // 处理数据库唯一约束错误
    if (error.code === 'P2002') {
      return ResponseData.error('该域名已在关注列表中', 409)
    }

    return ResponseData.error(error.message || '保存关注域名失败', 500)
  }
}) 