import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const year = parseInt(query.year as string) || new Date().getFullYear()

    // 构建年份范围
    const startDate = new Date(`${year}-01-01`)
    const endDate = new Date(`${year}-12-31`)

    // 并行查询各项统计数据
    const [
      totalCosts,
      costsByType,
      costsByMonth,
      recentCosts,
      upcomingRenewals
    ] = await Promise.all([
      // 总成本统计
      prisma.domainCost.aggregate({
        where: {
          domain: { userId: 1 },
          costDate: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: { amount: true },
        _count: true
      }),

      // 按成本类型统计
      prisma.domainCost.groupBy({
        by: ['costType'],
        where: {
          domain: { userId: 1 },
          costDate: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: { amount: true },
        _count: true
      }),

      // 按月份统计
      prisma.$queryRaw`
        SELECT 
          MONTH(cost_date) as month,
          SUM(amount) as totalAmount,
          COUNT(*) as count
        FROM domain_costs dc
        INNER JOIN domains d ON dc.domain_id = d.id
        WHERE d.user_id = 1 
          AND dc.cost_date >= ${startDate}
          AND dc.cost_date <= ${endDate}
        GROUP BY MONTH(cost_date)
        ORDER BY month
      `,

      // 最近的成本记录
      prisma.domainCost.findMany({
        where: {
          domain: { userId: 1 }
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          domain: {
            select: {
              domainName: true
            }
          }
        }
      }),

      // 即将到期的域名（需要续费的）
      prisma.domain.findMany({
        where: {
          userId: 1,
          expiryDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90天内到期
          }
        },
        select: {
          id: true,
          domainName: true,
          expiryDate: true,
          costs: {
            where: {
              costType: 'renewal'
            },
            orderBy: { costDate: 'desc' },
            take: 1,
            select: {
              amount: true
            }
          }
        },
        orderBy: { expiryDate: 'asc' }
      })
    ])

    // 处理按成本类型的统计数据
    const costTypeLabels = {
      purchase: '购买',
      renewal: '续费',
      transfer: '转移',
      protection: '隐私保护',
      other: '其他'
    }

    const processedCostsByType = costsByType.map(item => ({
      type: item.costType,
      label: costTypeLabels[item.costType as keyof typeof costTypeLabels] || item.costType,
      amount: item._sum.amount || 0,
      count: item._count
    }))

    // 处理按月份的统计数据
    const processedCostsByMonth = Array.from({ length: 12 }, (_, index) => {
      const month = index + 1
      const monthData = (costsByMonth as any[]).find(item => item.month === month)
      return {
        month,
        label: `${month}月`,
        amount: monthData ? parseFloat(monthData.totalAmount) : 0,
        count: monthData ? monthData.count : 0
      }
    })

    return ResponseData.success({
      year,
      summary: {
        totalAmount: totalCosts._sum.amount || 0,
        totalCount: totalCosts._count,
        averageAmount: totalCosts._count > 0 ? Number(totalCosts._sum.amount || 0) / totalCosts._count : 0
      },
      costsByType: processedCostsByType,
      costsByMonth: processedCostsByMonth,
      recentCosts,
      upcomingRenewals
    }, '获取成本统计数据成功')
  } catch (error: any) {
    console.error('获取成本统计数据失败:', error)
    return ResponseData.error('获取成本统计数据失败', 500)
  }
}) 