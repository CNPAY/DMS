import prisma from '~/server/utils/db'
import Joi from 'joi'
import { ResponseData } from '~/server/utils/response'

// 数据验证 schema
const deleteSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    'any.required': '注册商ID为必填项',
    'number.base': '注册商ID必须为数字'
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

    // 检查注册商是否存在
    const existingRegistrar = await prisma.registrar.findFirst({
      where: {
        id,
        userId: 1
      }
    })

    if (!existingRegistrar) {
      return ResponseData.error('注册商不存在', 404)
    }

    // 检查是否有域名使用此注册商
    const domainsCount = await prisma.domain.count({
      where: {
        registrarId: id
      }
    })

    if (domainsCount > 0) {
      return ResponseData.error(`无法删除注册商，还有 ${domainsCount} 个域名正在使用此注册商`, 409)
    }

    // 删除注册商
    await prisma.registrar.delete({
      where: { id }
    })

    return ResponseData.success(null, '注册商删除成功')
  } catch (error: any) {
    console.error('删除注册商失败:', error)
    return ResponseData.error('删除注册商失败', 500)
  }
}) 