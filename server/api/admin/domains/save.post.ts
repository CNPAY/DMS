import prisma from '~/server/utils/db'
import Joi from 'joi'
import { ResponseData } from '~/server/utils/response'

// 数据验证 schema
const domainSchema = Joi.object({
  id: Joi.number().integer().allow(null).optional(),
  domainName: Joi.string().min(1).max(255).required().messages({
    'string.empty': '域名不能为空',
    'string.max': '域名不能超过255个字符',
    'any.required': '域名为必填项'
  }),
  registrarId: Joi.number().integer().allow(null).optional(),
  creationDate: Joi.date().allow(null).optional(),
  expiryDate: Joi.date().allow(null).optional(),
  nameServers: Joi.string().max(2000).allow('', null).optional().messages({
    'string.max': '域名服务器不能超过2000个字符'
  }),
  purchasePrice: Joi.number().precision(2).min(0).allow(null).optional().messages({
    'number.min': '购买价格不能小于0'
  }),
  salesPrice: Joi.number().precision(2).min(0).allow(null).optional().messages({
    'number.min': '销售价格不能小于0'
  }),
  discount: Joi.number().precision(2).min(0).allow(null).optional().messages({
    'number.min': '折扣价格不能小于0'
  }),
  discountExpiry: Joi.date().allow(null).optional(),
  priceExpiry: Joi.date().allow(null).optional(),
  domainMeaning: Joi.string().max(100).allow('', null).optional().messages({
    'string.max': '域名含义不能超过100个字符'
  }),
  domainDescription: Joi.string().max(500).allow('', null).optional().messages({
    'string.max': '域名描述不能超过500个字符'
  }),
  holderInfo: Joi.string().max(2000).allow('', null).optional().messages({
    'string.max': '持有人信息不能超过2000个字符'
  }),
  notes: Joi.string().max(2000).allow('', null).optional().messages({
    'string.max': '备注不能超过2000个字符'
  }),
  domainStatus: Joi.number().integer().valid(1, 2, 3, 4).required().messages({
    'any.only': '域名状态值无效',
    'any.required': '域名状态为必填项'
  }),
  salesStatus: Joi.number().integer().valid(1, 2, 3, 4).required().messages({
    'any.only': '销售状态值无效',
    'any.required': '销售状态为必填项'
  }),
  categoryId: Joi.number().integer().allow(null).optional(),
  landingPageType: Joi.string().valid('redirect', 'template', 'custom').allow(null).optional(),
  landingPageContent: Joi.string().max(5000).allow('', null).optional().messages({
    'string.max': '着陆页内容不能超过5000个字符'
  }),
  clickBehavior: Joi.string().valid('landing', 'popup', 'external').allow(null).optional(),
  externalUrl: Joi.string().max(500).allow('', null).optional().when('clickBehavior', {
    is: 'external',
    then: Joi.string().required().messages({
      'any.required': '选择外部链接行为时，外部URL为必填项'
    })
  }).messages({
    'string.max': '外部URL不能超过500个字符'
  }),
  tagIds: Joi.array().items(Joi.number().integer()).optional(),
  seoTitle: Joi.string().max(255).allow('', null).optional().messages({
    'string.max': 'SEO标题不能超过255个字符'
  }),
  seoKeywords: Joi.string().max(500).allow('', null).optional().messages({
    'string.max': 'SEO关键词不能超过500个字符'
  }),
  seoDescription: Joi.string().max(500).allow('', null).optional().messages({
    'string.max': 'SEO描述不能超过500个字符'
  })
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // 数据验证
    const { error, value } = domainSchema.validate(body)
    if (error) {
      return ResponseData.error(error.details[0].message, 400)
    }

    const { tagIds, ...domainData } = value

    if (value.id) {
      // 编辑模式
      const id = value.id

      // 检查域名是否存在
      const existingDomain = await prisma.domain.findFirst({
        where: {
          id,
          userId: 1
        }
      })

      if (!existingDomain) {
        return ResponseData.error('域名不存在', 404)
      }

      // 检查域名名称是否与其他域名重名
      const duplicateDomain = await prisma.domain.findFirst({
        where: {
          userId: 1,
          domainName: value.domainName,
          id: { not: id }
        }
      })

      if (duplicateDomain) {
        return ResponseData.error('该域名已存在', 409)
      }

      // 验证关联数据是否存在
      if (value.registrarId) {
        const registrar = await prisma.registrar.findFirst({
          where: { id: value.registrarId, userId: 1 }
        })
        if (!registrar) {
          return ResponseData.error('指定的注册商不存在', 400)
        }
      }

      if (value.categoryId) {
        const category = await prisma.domainCategory.findFirst({
          where: { id: value.categoryId, userId: 1 }
        })
        if (!category) {
          return ResponseData.error('指定的分类不存在', 400)
        }
      }

      // 执行事务更新
      const result = await prisma.$transaction(async (tx) => {
        // 更新域名
        const domain = await tx.domain.update({
          where: { id },
          data: {
            domainName: domainData.domainName,
            registrarId: domainData.registrarId,
            creationDate: domainData.creationDate,
            expiryDate: domainData.expiryDate,
            nameServers: domainData.nameServers || null,
            purchasePrice: domainData.purchasePrice,
            holderInfo: domainData.holderInfo || null,
            notes: domainData.notes || null,
            domainStatus: domainData.domainStatus || 1,
            salesStatus: domainData.salesStatus || 1,
            categoryId: domainData.categoryId,
            landingPageType: domainData.landingPageType,
            landingPageContent: domainData.landingPageContent || null,
            salesPrice: domainData.salesPrice,
            discount: domainData.discount,
            discountExpiry: domainData.discountExpiry,
            priceExpiry: domainData.priceExpiry,
            domainMeaning: domainData.domainMeaning || null,
            domainDescription: domainData.domainDescription || null,
            clickBehavior: domainData.clickBehavior || 'popup',
            externalUrl: domainData.externalUrl || null,
            seoTitle: domainData.seoTitle || null,
            seoKeywords: domainData.seoKeywords || null,
            seoDescription: domainData.seoDescription || null
          }
        })

        // 更新标签关联
        if (tagIds !== undefined) {
          // 删除现有标签关联
          await tx.domainTagMap.deleteMany({
            where: { domainId: id }
          })

          // 添加新的标签关联
          if (tagIds.length > 0) {
            // 验证标签是否存在
            const validTags = await tx.domainTag.findMany({
              where: {
                id: { in: tagIds },
                userId: 1
              }
            })

            if (validTags.length !== tagIds.length) {
              throw new Error('部分标签不存在')
            }

            await tx.domainTagMap.createMany({
              data: tagIds.map((tagId: number) => ({
                domainId: id,
                tagId
              }))
            })
          }
        }

        return domain
      })

      return ResponseData.success(result, '域名更新成功')
    } else {
      // 新增模式

      // 检查域名名称是否已存在
      const existingDomain = await prisma.domain.findFirst({
        where: {
          userId: 1,
          domainName: value.domainName
        }
      })

      if (existingDomain) {
        return ResponseData.error('该域名已存在', 409)
      }

      // 验证关联数据是否存在
      if (value.registrarId) {
        const registrar = await prisma.registrar.findFirst({
          where: { id: value.registrarId, userId: 1 }
        })
        if (!registrar) {
          return ResponseData.error('指定的注册商不存在', 400)
        }
      }

      if (value.categoryId) {
        const category = await prisma.domainCategory.findFirst({
          where: { id: value.categoryId, userId: 1 }
        })
        if (!category) {
          return ResponseData.error('指定的分类不存在', 400)
        }
      }

      // 执行事务创建
      const result = await prisma.$transaction(async (tx) => {
        // 创建新域名
        const domain = await tx.domain.create({
          data: {
            userId: 1, // 单用户系统，固定为用户ID 1
            domainName: domainData.domainName,
            registrarId: domainData.registrarId,
            creationDate: domainData.creationDate,
            expiryDate: domainData.expiryDate,
            nameServers: domainData.nameServers || null,
            purchasePrice: domainData.purchasePrice,
            holderInfo: domainData.holderInfo || null,
            notes: domainData.notes || null,
            domainStatus: domainData.domainStatus || 1,
            salesStatus: domainData.salesStatus || 1,
            categoryId: domainData.categoryId,
            landingPageType: domainData.landingPageType,
            landingPageContent: domainData.landingPageContent || null,
            salesPrice: domainData.salesPrice,
            discount: domainData.discount,
            discountExpiry: domainData.discountExpiry,
            priceExpiry: domainData.priceExpiry,
            domainMeaning: domainData.domainMeaning || null,
            domainDescription: domainData.domainDescription || null,
            clickBehavior: domainData.clickBehavior || 'popup',
            externalUrl: domainData.externalUrl || null,
            seoTitle: domainData.seoTitle || null,
            seoKeywords: domainData.seoKeywords || null,
            seoDescription: domainData.seoDescription || null
          }
        })

        // 添加标签关联
        if (tagIds && tagIds.length > 0) {
          // 验证标签是否存在
          const validTags = await tx.domainTag.findMany({
            where: {
              id: { in: tagIds },
              userId: 1
            }
          })

          if (validTags.length !== tagIds.length) {
            throw new Error('部分标签不存在')
          }

          await tx.domainTagMap.createMany({
            data: tagIds.map((tagId: number) => ({
              domainId: domain.id,
              tagId
            }))
          })
        }

        return domain
      })

      return ResponseData.success(result, '域名创建成功')
    }
  } catch (error: any) {
    console.error('保存域名失败:', error)
    
    // 处理唯一约束违反错误
    if (error.code === 'P2002' && error.meta?.target?.includes('domain_name')) {
      return ResponseData.error('该域名已存在', 409)
    }
    
    return ResponseData.error(error.message || '保存域名失败', 500)
  }
}) 