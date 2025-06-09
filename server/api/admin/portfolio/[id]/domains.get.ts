import { ResponseData } from '~/server/utils/response'
import prisma from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const portfolioId = parseInt(event.context.params?.id || '')

    if (!portfolioId) {
      return ResponseData.error('参数错误')
    }

    // 获取米表关联的域名
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: {
        domains: {
          include: {
            domain: {
              select: {
                id: true,
                domainName: true,
                salesPrice: true,
                discount: true,
                discountExpiry: true
              }
            }
          }
        },
        categories: {
          include: {
            category: {
              include: {
                domains: {
                  select: {
                    id: true,
                    domainName: true,
                    salesPrice: true,
                    discount: true,
                    discountExpiry: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!portfolio) {
      return ResponseData.error('米表不存在')
    }

    // 获取直接关联的域名
    const directDomains = portfolio.domains.map(item => ({
      id: item.domain.id,
      domainName: item.domain.domainName,
      salesPrice: item.domain.salesPrice,
      discount: item.domain.discount,
      discountExpiry: item.domain.discountExpiry
    }))

    // 获取通过分类关联的域名
    const categoryDomains = portfolio.categories.flatMap(
      categoryMap => categoryMap.category.domains
    )

    // 合并域名并去重
    const allDomains = [...directDomains, ...categoryDomains]
    const uniqueDomains = Array.from(
      new Map(allDomains.map(domain => [domain.id, domain])).values()
    )

    return ResponseData.success(uniqueDomains)
  } catch (error) {
    console.error('获取米表域名列表失败:', error)
    return ResponseData.error('获取米表域名列表失败')
  }
}) 