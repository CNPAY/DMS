import { ResponseData } from '~/server/utils/response'
import prisma from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { portfolioId, domains } = body

    if (!portfolioId || !Array.isArray(domains)) {
      return ResponseData.error('参数错误')
    }

    // 验证米表是否存在
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: {
        domains: {
          select: { domainId: true }
        }
      }
    })

    if (!portfolio) {
      return ResponseData.error('米表不存在')
    }

    // 批量更新域名的促销信息
    const updatePromises = domains.map(async (domain) => {
      return prisma.domain.update({
        where: { id: domain.id },
        data: {
          discount: domain.discount,
          discountExpiry: domain.discountExpiry ? new Date(domain.discountExpiry) : null
        }
      })
    })

    await Promise.all(updatePromises)

    return ResponseData.success(null, '更新成功')
  } catch (error) {
    console.error('更新促销信息失败:', error)
    return ResponseData.error('更新促销信息失败')
  }
}) 