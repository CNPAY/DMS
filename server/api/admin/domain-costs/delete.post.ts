import prisma from '~/server/utils/db'
import Joi from 'joi'
import { ResponseData } from '~/server/utils/response'

// 数据验证 schema
const deleteSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    'any.required': '成本记录ID为必填项',
    'number.base': '成本记录ID必须为数字'
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

    // 检查成本记录是否存在且属于当前用户
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

    // 删除成本记录
    await prisma.domainCost.delete({
      where: { id }
    })

    return ResponseData.success(null, '成本记录删除成功')
  } catch (error: any) {
    console.error('删除成本记录失败:', error)
    return ResponseData.error('删除成本记录失败', 500)
  }
}) 