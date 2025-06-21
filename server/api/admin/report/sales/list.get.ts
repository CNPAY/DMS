import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    // 暂时使用固定的用户ID 1 进行测试
    const userId =  event.context.auth.userId
    
    const query = getQuery(event)
    const page = Math.max(parseInt(query.page as string) || 1, 1)
    const limit = Math.min(parseInt(query.limit as string) || 20, 100)
    const offset = (page - 1) * limit

    // 构建查询条件
    const whereCondition: any = {
      domain: { userId }
    }

    // 按买家名称搜索
    if (query.buyerName) {
      whereCondition.buyerName = {
        contains: query.buyerName as string
      }
    }

    // 按域名搜索
    if (query.domainName) {
      whereCondition.domain = {
        ...whereCondition.domain,
        domainName: {
          contains: query.domainName as string
        }
      }
    }

    // 按销售日期范围过滤
    if (query.startDate || query.endDate) {
      whereCondition.saleDate = {}
      if (query.startDate) {
        whereCondition.saleDate.gte = new Date(query.startDate as string)
      }
      if (query.endDate) {
        whereCondition.saleDate.lte = new Date(query.endDate as string)
      }
    }

    // 按支付状态过滤
    if (query.paymentStatus) {
      whereCondition.paymentStatus = query.paymentStatus as string
    }

    // 按转移状态过滤
    if (query.transferStatus) {
      whereCondition.transferStatus = query.transferStatus as string
    }

    // 按价格范围过滤
    if (query.minPrice || query.maxPrice) {
      whereCondition.salePrice = {}
      if (query.minPrice) {
        whereCondition.salePrice.gte = parseFloat(query.minPrice as string)
      }
      if (query.maxPrice) {
        whereCondition.salePrice.lte = parseFloat(query.maxPrice as string)
      }
    }

    // 并发查询销售记录和总数
    const [sales, total] = await Promise.all([
      prisma.domainSale.findMany({
        where: whereCondition,
        include: {
          domain: {
            select: {
              id: true,
              domainName: true,
              purchasePrice: true,
              category: {
                select: { name: true }
              }
            }
          }
        },
        orderBy: { saleDate: 'desc' },
        skip: offset,
        take: limit
      }),

      prisma.domainSale.count({ where: whereCondition })
    ])

    // 计算每个销售记录的利润
    const salesWithProfit = sales.map(sale => {
      const purchasePrice = sale.domain.purchasePrice || 0
      const salePrice = sale.salePrice || 0
      const platformFee = sale.platformFee || 0
      const netProfit = Number(salePrice) - Number(purchasePrice) - Number(platformFee)
      const profitMargin = Number(purchasePrice) > 0 ? (netProfit / Number(purchasePrice) * 100) : 0

      return {
        ...sale,
        netProfit: Math.round(netProfit * 100) / 100,
        profitMargin: Math.round(profitMargin * 100) / 100
      }
    })

    return ResponseData.success({
      sales: salesWithProfit,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, '获取销售记录成功')

  } catch (error) {
    console.error('获取销售记录失败:', error)
    return ResponseData.error('获取销售记录失败')
  }
}) 