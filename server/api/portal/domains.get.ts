import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { portfolioId } = query

    if (!portfolioId) {
      return ResponseData.error('portfolioId参数不能为空')
    }

    // 获取米表关联的分类
    const portfolioCategoryMaps = await prisma.portfolioCategoryMap.findMany({
      where: {
        portfolioId: parseInt(portfolioId as string)
      },
      select: {
        categoryId: true
      }
    })

    const categoryIds = portfolioCategoryMaps.map((map: any) => map.categoryId)

    // 获取分类下的域名（状态为已上架或待售）
    const domains = await prisma.domain.findMany({
      where: {
        categoryId: {
          in: categoryIds.length > 0 ? categoryIds : [-1] // 如果没有分类，返回空结果
        },
        salesStatus: {
          in: [1, 2] // 1: 待售, 2: 已上架
        }
      },
      include: {
        registrar: {
          select: {
            name: true
          }
        },
        category: {
          select: {
            name: true
          }
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: [
        { purchasePrice: 'desc' },
        { domainName: 'asc' }
      ]
    })

    // 格式化数据
    const formattedDomains = domains.map(domain => ({
      id: domain.id,
      name: domain.domainName,
      salePrice: domain.salesPrice,         // 销售价格（从 salesPrice 转换为前端使用的 salePrice）
      salePriceExpirationDate: domain.priceExpiry,  // 销售价格过期时间
      discountPrice: domain.discount,       // 折扣价格
      discountExpirationDate: domain.discountExpiry, // 折扣过期时间
      description: domain.notes,
      registrationDate: domain.creationDate,
      expirationDate: domain.expiryDate,    // 域名过期时间
      registrar: domain.registrar?.name,
      categoryId: domain.categoryId,
      category: domain.category?.name,
      clickBehavior: domain.clickBehavior,  // 点击行为
      externalUrl: domain.externalUrl,      // 外部链接URL
      tags: domain.tags.map((tagMap: any) => ({
        id: tagMap.tag.id,
        name: tagMap.tag.name
      })),
      createdAt: domain.createdAt
    }))

    return ResponseData.success(formattedDomains, '获取米表域名成功')
  } catch (error) {
    console.error('获取米表域名失败:', error)
    return ResponseData.error('获取米表域名失败')
  }
}) 