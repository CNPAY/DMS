import prisma from '~/server/utils/db'
import Joi from 'joi'
import { ResponseData } from '~/server/utils/response'

// 数据验证 schema
const staticPageSchema = Joi.object({
  id: Joi.number().integer().allow(null).optional(),
  title: Joi.string().min(1).max(255).required().messages({
    'string.empty': '页面标题不能为空',
    'string.max': '页面标题不能超过255个字符',
    'any.required': '页面标题为必填项'
  }),
  slug: Joi.string().when('linkType', {
    is: 'internal',
    then: Joi.string().min(1).max(255).pattern(/^[a-z0-9-]+$/).required().messages({
      'string.empty': 'URL别名不能为空',
      'string.max': 'URL别名不能超过255个字符',
      'string.pattern.base': 'URL别名只能包含小写字母、数字和连字符',
      'any.required': 'URL别名为必填项'
    }),
    otherwise: Joi.string().allow('', null).optional()
  }),
  linkType: Joi.string().valid('internal', 'external').default('internal').messages({
    'any.only': '链接类型只能为内部页面或外部链接'
  }),
  content: Joi.string().when('linkType', {
    is: 'internal',
    then: Joi.string().min(1).required().messages({
      'string.empty': '页面内容不能为空',
      'any.required': '页面内容为必填项'
    }),
    otherwise: Joi.string().allow('', null).optional()
  }),
  externalUrl: Joi.string().when('linkType', {
    is: 'external',
    then: Joi.string().pattern(/^https?:\/\/.+/).required().messages({
      'string.empty': '外部链接URL不能为空',
      'string.pattern.base': '请输入有效的URL格式（必须以http://或https://开头）',
      'any.required': '外部链接URL为必填项'
    }),
    otherwise: Joi.string().allow('', null).optional()
  }),
  openInNewTab: Joi.boolean().default(false),
  metaTitle: Joi.string().when('linkType', {
    is: 'internal',
    then: Joi.string().max(255).allow('').optional().messages({
      'string.max': 'SEO标题不能超过255个字符'
    }),
    otherwise: Joi.string().allow('', null).optional()
  }),
  metaDescription: Joi.string().when('linkType', {
    is: 'internal', 
    then: Joi.string().max(500).allow('').optional().messages({
      'string.max': 'SEO描述不能超过500个字符'
    }),
    otherwise: Joi.string().allow('', null).optional()
  }),
  status: Joi.string().valid('draft', 'published').default('published').messages({
    'any.only': '状态只能为草稿或已发布'
  }),
  sortOrder: Joi.number().integer().min(0).default(0).messages({
    'number.base': '排序必须为数字',
    'number.min': '排序不能小于0'
  })
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // 数据验证
    const { error, value } = staticPageSchema.validate(body)
    if (error) {
      return ResponseData.error(error.details[0].message, 400)
    }

    if (value.id) {
      // 编辑模式
      const id = value.id

      // 检查静态页是否存在
      const existingPage = await prisma.staticPage.findUnique({
        where: { id }
      })

      if (!existingPage) {
        return ResponseData.error('静态页不存在', 404)
      }

      // 只有内部页面需要检查URL别名重复
      if (value.linkType === 'internal') {
        const duplicatePage = await prisma.staticPage.findFirst({
          where: {
            userId: 1,
            slug: value.slug,
            id: { not: id }
          }
        })

        if (duplicatePage) {
          return ResponseData.error('URL别名已存在', 409)
        }
      }

      // 更新静态页
      const updateData = {
        title: value.title,
        content: value.content || null,
        linkType: value.linkType,
        externalUrl: value.externalUrl || null,
        openInNewTab: value.openInNewTab,
        metaTitle: value.metaTitle || null,
        metaDescription: value.metaDescription || null,
        status: value.status,
        sortOrder: value.sortOrder
      }

      // 只有内部页面才设置slug
      if (value.linkType === 'internal') {
        updateData.slug = value.slug
      }

      const staticPage = await prisma.staticPage.update({
        where: { id },
        data: updateData
      })

      return ResponseData.success(staticPage, '静态页更新成功')
    } else {
      // 新增模式

      // 只有内部页面需要检查URL别名重复
      if (value.linkType === 'internal') {
        const existingPage = await prisma.staticPage.findFirst({
          where: {
            userId: 1,
            slug: value.slug
          }
        })

        if (existingPage) {
          return ResponseData.error('URL别名已存在', 409)
        }
      }

      // 创建静态页
      const createData: any = {
        userId: 1, // 单用户系统，固定为用户ID 1
        title: value.title,
        content: value.content || null,
        linkType: value.linkType,
        externalUrl: value.externalUrl || null,
        openInNewTab: value.openInNewTab,
        metaTitle: value.metaTitle || null,
        metaDescription: value.metaDescription || null,
        status: value.status,
        sortOrder: value.sortOrder
      }

      // 只有内部页面才设置slug，外部链接不需要slug
      if (value.linkType === 'internal') {
        createData.slug = value.slug
      } else {
        createData.slug = null  // 外部链接不使用slug
      }

      const staticPage = await prisma.staticPage.create({
        data: createData
      })

      return ResponseData.success(staticPage, '静态页添加成功')
    }
  } catch (error: any) {
    console.error('保存静态页失败:', error)
    return ResponseData.error('保存静态页失败', 500)
  }
}) 