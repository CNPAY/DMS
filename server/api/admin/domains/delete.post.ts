import prisma from '~/server/utils/db'
import Joi from 'joi'
import { ResponseData } from '~/server/utils/response'

// 数据验证 schema
const deleteSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    'any.required': '域名ID为必填项',
    'number.base': '域名ID必须为数字'
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

    // 检查是否有依赖数据
    const dependencies = await prisma.domain.findFirst({
      where: { id },
      include: {
        _count: {
          select: {
            costs: true,
            inquiries: true,
            portfolios: true
          }
        }
      }
    })

    if (dependencies) {
      const { costs, inquiries, portfolios } = dependencies._count
      const dependencyMessages: string[] = []
      
      if (costs > 0) {
        dependencyMessages.push(`${costs} 条成本记录`)
      }
      if (inquiries > 0) {
        dependencyMessages.push(`${inquiries} 条线索记录`)
      }
      if (portfolios > 0) {
        dependencyMessages.push(`${portfolios} 个米表关联`)
      }

      if (dependencyMessages.length > 0) {
        return ResponseData.error(
          `无法删除域名，还有 ${dependencyMessages.join('、')} 与此域名关联`, 
          409
        )
      }
    }

    // 执行事务删除
    await prisma.$transaction(async (tx) => {
      // 删除标签关联
      await tx.domainTagMap.deleteMany({
        where: { domainId: id }
      })

      // 删除域名
      await tx.domain.delete({
        where: { id }
      })
    })

    return ResponseData.success(null, '域名删除成功')
  } catch (error: any) {
    console.error('删除域名失败:', error)
    return ResponseData.error('删除域名失败', 500)
  }
}) 