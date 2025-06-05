import prisma from '~/server/utils/db'
import Joi from 'joi'
import { ResponseData } from '~/server/utils/response'

// 数据验证 schema
const costSchema = Joi.object({
  id: Joi.number().integer().allow(null).optional(),
  domainId: Joi.number().integer().required().messages({
    'any.required': '域名为必填项',
    'number.base': '域名ID必须为数字'
  }),
  costDate: Joi.date().required().messages({
    'any.required': '成本日期为必填项',
    'date.base': '成本日期格式无效'
  }),
  amount: Joi.number().precision(2).min(0).required().messages({
    'any.required': '金额为必填项',
    'number.min': '金额不能小于0',
    'number.base': '金额必须为数字'
  }),
  costType: Joi.string().valid('purchase', 'renewal', 'transfer', 'protection', 'other').required().messages({
    'any.required': '成本类型为必填项',
    'any.only': '成本类型值无效'
  }),
  renewalYears: Joi.number().integer().min(1).max(10).allow(null).optional().messages({
    'number.min': '续费年数不能小于1年',
    'number.max': '续费年数不能超过10年',
    'number.base': '续费年数必须为整数'
  }),
  notes: Joi.string().max(2000).allow('').optional().messages({
    'string.max': '备注不能超过2000个字符'
  })
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // 数据验证
    const { error, value } = costSchema.validate(body)
    if (error) {
      return ResponseData.error(error.details[0].message, 400)
    }

    if (value.id) {
      // 编辑模式
      const id = value.id

      // 检查成本记录是否存在
      const existingCost = await prisma.domainCost.findFirst({
        where: {
          id,
          domain: {
            userId: 1
          }
        }
      })

      if (!existingCost) {
        return ResponseData.error('成本记录不存在', 404)
      }

      // 验证域名是否存在且属于当前用户
      const domain = await prisma.domain.findFirst({
        where: {
          id: value.domainId,
          userId: 1
        }
      })

      if (!domain) {
        return ResponseData.error('指定的域名不存在', 400)
      }

      // 更新成本记录
      const result = await prisma.domainCost.update({
        where: { id },
        data: {
          domainId: value.domainId,
          costDate: value.costDate,
          amount: value.amount,
          costType: value.costType,
          renewalYears: value.renewalYears,
          notes: value.notes || null
        },
        include: {
          domain: {
            select: {
              id: true,
              domainName: true
            }
          }
        }
      })

      return ResponseData.success(result, '成本记录更新成功')
    } else {
      // 新增模式

      // 验证域名是否存在且属于当前用户
      const domain = await prisma.domain.findFirst({
        where: {
          id: value.domainId,
          userId: 1
        }
      })

      if (!domain) {
        return ResponseData.error('指定的域名不存在', 400)
      }

      // 创建新成本记录
      const result = await prisma.domainCost.create({
        data: {
          domainId: value.domainId,
          costDate: value.costDate,
          amount: value.amount,
          costType: value.costType,
          renewalYears: value.renewalYears,
          notes: value.notes || null
        },
        include: {
          domain: {
            select: {
              id: true,
              domainName: true
            }
          }
        }
      })

      return ResponseData.success(result, '成本记录创建成功')
    }
  } catch (error: any) {
    console.error('保存成本记录失败:', error)
    return ResponseData.error(error.message || '保存成本记录失败', 500)
  }
}) 