import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    // 暂时使用固定的用户ID 1 进行测试
    const userId = 1
    
    const query = getQuery(event)
    const timeRange = query.timeRange as string || 'all' // all, year, quarter, month
    
    // 计算时间范围
    let startDate: Date | undefined
    const now = new Date()
    
    switch (timeRange) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3
        startDate = new Date(now.getFullYear(), quarterStart, 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = undefined
    }

    // 构建基础查询条件
    const whereCondition: any = {
      domain: { userId }
    }
    
    if (startDate) {
      whereCondition.saleDate = { gte: startDate }
    }

    // 并发查询多项统计数据
    const [
      totalSales,
      salesStats,
      topSales,
      monthlyTrend,
      categoryStats,
      platformStats
    ] = await Promise.all([
      // 总销售数量
      prisma.domainSale.count({ where: whereCondition }),

      // 销售金额统计
      prisma.domainSale.aggregate({
        where: whereCondition,
        _sum: {
          salePrice: true,
          platformFee: true
        },
        _avg: {
          salePrice: true
        },
        _max: {
          salePrice: true
        },
        _min: {
          salePrice: true
        }
      }),

      // 最高成交记录
      prisma.domainSale.findMany({
        where: whereCondition,
        include: {
          domain: {
            select: {
              domainName: true,
              purchasePrice: true
            }
          }
        },
        orderBy: { salePrice: 'desc' },
        take: 10
      }),

      // 月度销售趋势（最近12个月）
      prisma.domainSale.groupBy({
        by: ['saleDate'],
        where: {
          ...whereCondition,
          saleDate: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 11))
          }
        },
        _count: {
          id: true
        },
        _sum: {
          salePrice: true
        }
      }),

      // 按分类统计
      prisma.domainSale.groupBy({
        by: ['domain'],
        where: whereCondition,
        _count: {
          id: true
        },
        _sum: {
          salePrice: true
        }
      }),

      // 按平台统计
      prisma.domainSale.groupBy({
        by: ['platformName'],
        where: {
          ...whereCondition,
          platformName: { not: null }
        },
        _count: {
          id: true
        },
        _sum: {
          salePrice: true,
          platformFee: true
        }
      })
    ])

    // 计算总利润
    const allSalesWithCosts = await prisma.domainSale.findMany({
      where: whereCondition,
      include: {
        domain: {
          select: {
            purchasePrice: true,
            costs: {
              select: {
                amount: true
              }
            }
          }
        }
      }
    })

    let totalProfit = 0
    let totalInvestment = 0
    
    allSalesWithCosts.forEach(sale => {
      const purchasePrice = Number(sale.domain.purchasePrice || 0)
      const totalCosts = sale.domain.costs.reduce((sum, cost) => sum + Number(cost.amount), 0)
      const salePrice = Number(sale.salePrice)
      const platformFee = Number(sale.platformFee || 0)
      
      const investment = purchasePrice + totalCosts
      const profit = salePrice - investment - platformFee
      
      totalProfit += profit
      totalInvestment += investment
    })

    // 处理月度趋势数据
    const monthlyTrendData = Array.from({ length: 12 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (11 - i))
      const monthKey = date.toISOString().slice(0, 7) // YYYY-MM格式
      
      const monthData = monthlyTrend.find(item => 
        new Date(item.saleDate).toISOString().slice(0, 7) === monthKey
      )
      
      return {
        month: monthKey,
        count: monthData?._count.id || 0,
        amount: Number(monthData?._sum.salePrice || 0)
      }
    })

    // 计算平均利润率
    const averageProfitMargin = totalInvestment > 0 ? (totalProfit / totalInvestment * 100) : 0

    return ResponseData.success({
      overview: {
        totalSales,
        totalRevenue: Number(salesStats._sum.salePrice || 0),
        totalPlatformFees: Number(salesStats._sum.platformFee || 0),
        totalProfit: Math.round(totalProfit * 100) / 100,
        averageSalePrice: Number(salesStats._avg.salePrice || 0),
        averageProfitMargin: Math.round(averageProfitMargin * 100) / 100,
        highestSale: Number(salesStats._max.salePrice || 0),
        lowestSale: Number(salesStats._min.salePrice || 0)
      },
      topSales: topSales.map(sale => ({
        ...sale,
        profit: Number(sale.salePrice) - Number(sale.domain.purchasePrice || 0) - Number(sale.platformFee || 0)
      })),
      monthlyTrend: monthlyTrendData,
      platformStats: platformStats.map(stat => ({
        platform: stat.platformName,
        count: stat._count.id,
        totalRevenue: Number(stat._sum.salePrice || 0),
        totalFees: Number(stat._sum.platformFee || 0)
      })),
      timeRange
    }, '获取销售统计成功')

  } catch (error) {
    console.error('获取销售统计失败:', error)
    return ResponseData.error('获取销售统计失败')
  }
}) 