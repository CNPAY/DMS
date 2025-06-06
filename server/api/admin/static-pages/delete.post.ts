import prisma from '~/server/utils/db'
import Joi from 'joi'
import { ResponseData } from '~/server/utils/response'

// 数据验证 schema
const deleteSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    'any.required': '静态页ID为必填项',
    'number.base': '静态页ID必须为数字'
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

    // 检查静态页是否存在
    const existingPage = await prisma.staticPage.findFirst({
      where: {
        id,
        userId: 1
      }
    })

    if (!existingPage) {
      return ResponseData.error('静态页不存在', 404)
    }

    // 删除静态页
    await prisma.staticPage.delete({
      where: { id }
    })

    return ResponseData.success(null, '静态页删除成功')
  } catch (error: any) {
    console.error('删除静态页失败:', error)
    return ResponseData.error('删除静态页失败', 500)
  }
}) 