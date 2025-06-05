import prisma from '~/server/utils/db'
import Joi from 'joi'

// 数据验证 schema
const registrarUpdateSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.empty': '注册商名称不能为空',
    'string.max': '注册商名称不能超过100个字符',
    'any.required': '注册商名称为必填项'
  }),
  websiteUrl: Joi.string().uri().max(255).allow('').optional().messages({
    'string.uri': '网站地址格式不正确',
    'string.max': '网站地址不能超过255个字符'
  }),
  loginUrl: Joi.string().uri().max(255).allow('').optional().messages({
    'string.uri': '登录地址格式不正确',
    'string.max': '登录地址不能超过255个字符'
  }),
  accountId: Joi.string().max(100).allow('').optional().messages({
    'string.max': '账户ID不能超过100个字符'
  }),
  notes: Joi.string().max(1000).allow('').optional().messages({
    'string.max': '备注不能超过1000个字符'
  })
})

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(getRouterParam(event, 'id') as string)
    const body = await readBody(event)

    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        statusMessage: '无效的注册商ID'
      })
    }

    // 数据验证
    const { error, value } = registrarUpdateSchema.validate(body)
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.details[0].message
      })
    }

    // 检查注册商是否存在
    const existingRegistrar = await prisma.registrar.findUnique({
      where: { id }
    })

    if (!existingRegistrar) {
      throw createError({
        statusCode: 404,
        statusMessage: '注册商不存在'
      })
    }

    // 检查注册商名称是否与其他注册商重名
    const duplicateRegistrar = await prisma.registrar.findFirst({
      where: {
        userId: 1,
        name: value.name,
        id: { not: id }
      }
    })

    if (duplicateRegistrar) {
      throw createError({
        statusCode: 409,
        statusMessage: '注册商名称已存在'
      })
    }

    // 更新注册商
    const registrar = await prisma.registrar.update({
      where: { id },
      data: {
        name: value.name,
        websiteUrl: value.websiteUrl || null,
        loginUrl: value.loginUrl || null,
        accountId: value.accountId || null,
        notes: value.notes || null
      }
    })

    return {
      success: true,
      message: '注册商更新成功',
      data: registrar
    }
  } catch (error: any) {
    console.error('更新注册商失败:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: '更新注册商失败'
    })
  }
}) 