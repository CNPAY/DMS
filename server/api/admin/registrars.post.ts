import prisma from '~/server/utils/db'
import Joi from 'joi'
import { ResponseData } from '~/server/utils/response'

// 数据验证 schema
const registrarSchema = Joi.object({
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
    const body = await readBody(event)

    // 数据验证
    const { error, value } = registrarSchema.validate(body)
    if (error) {
      return ResponseData.error(error.details[0].message, 400)
    }

    // 检查注册商名称是否已存在
    const existingRegistrar = await prisma.registrar.findFirst({
      where: {
        userId: 1,
        name: value.name
      }
    })

    if (existingRegistrar) {
      return ResponseData.error('注册商名称已存在', 409)
    }

    // 创建注册商
    const registrar = await prisma.registrar.create({
      data: {
        userId: 1, // 单用户系统，固定为用户ID 1
        name: value.name,
        websiteUrl: value.websiteUrl || null,
        loginUrl: value.loginUrl || null,
        accountId: value.accountId || null,
        notes: value.notes || null
      }
    })

    return ResponseData.success(registrar, '注册商添加成功')
  } catch (error: any) {
    console.error('添加注册商失败:', error)
    return ResponseData.error('添加注册商失败', 500)
  }
}) 