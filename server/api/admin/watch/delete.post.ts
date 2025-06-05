import Joi from 'joi'
import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

// 验证 schema
const deleteSchema = Joi.object({
  id: Joi.number().integer().required(),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // 验证请求数据
    const { error, value } = deleteSchema.validate(body)
    if (error) {
      return ResponseData.error(`数据验证失败: ${error.details[0].message}`, 400)
    }

    const { id } = value

    // 检查关注域名是否存在
    const existingDomain = await prisma.watchedDomain.findFirst({
      where: {
        id,
        userId: 1
      }
    })

    if (!existingDomain) {
      return ResponseData.error('关注域名不存在', 404)
    }

    // 删除关注域名
    await prisma.watchedDomain.delete({
      where: { id }
    })

    return ResponseData.success(null, '关注域名删除成功')
  } catch (error: any) {
    console.error('删除关注域名失败:', error)
    return ResponseData.error(error.message || '删除关注域名失败', 500)
  }
}) 