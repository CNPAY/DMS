import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    // 暂时使用固定的用户ID 1 进行测试
    const userId =  event.context.auth.userId
    
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
      whereCondition.costDate = { gte: startDate }
    }

    // 并发查询多项统计数据
    const [
      totalCosts,
      costStats,
      costsByType,
      monthlyTrend,
      domainWithCosts,
      upcomingRenewals
    ] = await Promise.all([
      // 总成本记录数
      prisma.domainCost.count({ where: whereCondition }),

      // 成本金额统计
      prisma.domainCost.aggregate({
        where: whereCondition,
        _sum: {
          amount: true
        },
        _avg: {
          amount: true
        },
        _max: {
          amount: true
        },
        _min: {
          amount: true
        }
      }),

      // 按成本类型统计
      prisma.domainCost.groupBy({
        by: ['costType'],
        where: whereCondition,
        _count: {
          id: true
        },
        _sum: {
          amount: true
        }
      }),

      // 月度成本趋势（最近12个月）
      prisma.domainCost.groupBy({
        by: ['costDate'],
        where: {
          ...whereCondition,
          costDate: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 11))
          }
        },
        _count: {
          id: true
        },
        _sum: {
          amount: true
        }
      }),

      // 有成本记录的域名统计
      prisma.domain.count({
        where: {
          userId,
          costs: {
            some: startDate ? { costDate: { gte: startDate } } : {}
          }
        }
      }),

      // 即将到期需要续费的域名
      prisma.domain.findMany({
        where: {
          userId,
          expiryDate: {
            gte: now,
            lte: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000) // 90天内
          }
        },
        include: {
          costs: {
            where: {
              costType: 'renewal'
            },
            orderBy: {
              costDate: 'desc'
            },
            take: 1
          }
        }
      })
    ])

    // 计算总持有成本（包括购买价格和所有成本）
    const domainsWithAllCosts = await prisma.domain.findMany({
      where: { userId },
      include: {
        costs: {
          where: startDate ? { costDate: { gte: startDate } } : {}
        }
      }
    })

    let totalHoldingCost = 0
    let totalPurchaseCost = 0
    let averageHoldingCostPerDomain = 0

    domainsWithAllCosts.forEach(domain => {
      const purchasePrice = Number(domain.purchasePrice || 0)
      const totalCosts = domain.costs.reduce((sum, cost) => sum + Number(cost.amount), 0)
      const holdingCost = purchasePrice + totalCosts
      
      totalHoldingCost += holdingCost
      totalPurchaseCost += purchasePrice
    })

    if (domainsWithAllCosts.length > 0) {
      averageHoldingCostPerDomain = totalHoldingCost / domainsWithAllCosts.length
    }

    // 处理月度趋势数据
    const monthlyTrendData = Array.from({ length: 12 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (11 - i))
      const monthKey = date.toISOString().slice(0, 7) // YYYY-MM格式
      
      const monthData = monthlyTrend.find(item => 
        new Date(item.costDate).toISOString().slice(0, 7) === monthKey
      )
      
      return {
        month: monthKey,
        count: monthData?._count.id || 0,
        amount: Number(monthData?._sum.amount || 0)
      }
    })

    // 计算续费预测成本
    let predictedRenewalCost = 0
    upcomingRenewals.forEach(domain => {
      if (domain.costs.length > 0) {
        const lastRenewalCost = Number(domain.costs[0].amount)
        predictedRenewalCost += lastRenewalCost
      } else {
        // 如果没有续费记录，使用平均续费成本估算
        predictedRenewalCost += 100 // 默认估算值
      }
    })

    // 处理成本类型统计
    const costTypeStats = costsByType.map(stat => {
      const typeNames: Record<string, string> = {
        'purchase': '购买',
        'renewal': '续费',
        'transfer': '转移',
        'privacy': '隐私保护',
        'dns': 'DNS服务',
        'ssl': 'SSL证书',
        'other': '其他'
      }
      
      return {
        type: stat.costType,
        typeName: typeNames[stat.costType] || stat.costType,
        count: stat._count.id,
        totalAmount: Number(stat._sum.amount || 0)
      }
    })

    return ResponseData.success({
      overview: {
        totalCosts,
        totalAmount: Number(costStats._sum.amount || 0),
        averageAmount: Number(costStats._avg.amount || 0),
        highestCost: Number(costStats._max.amount || 0),
        lowestCost: Number(costStats._min.amount || 0),
        totalHoldingCost: Math.round(totalHoldingCost * 100) / 100,
        totalPurchaseCost: Math.round(totalPurchaseCost * 100) / 100,
        averageHoldingCostPerDomain: Math.round(averageHoldingCostPerDomain * 100) / 100,
        domainsWithCosts: domainWithCosts,
        upcomingRenewalsCount: upcomingRenewals.length,
        predictedRenewalCost: Math.round(predictedRenewalCost * 100) / 100
      },
      costsByType: costTypeStats,
      monthlyTrend: monthlyTrendData,
      upcomingRenewals: upcomingRenewals.map(domain => ({
        id: domain.id,
        domainName: domain.domainName,
        expiryDate: domain.expiryDate,
        daysUntilExpiry: Math.ceil((new Date(domain.expiryDate!).getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
        lastRenewalCost: domain.costs.length > 0 ? Number(domain.costs[0].amount) : null
      })),
      timeRange
    }, '获取成本统计成功')

  } catch (error) {
    console.error('获取成本统计失败:', error)
    return ResponseData.error('获取成本统计失败')
  }
}) 