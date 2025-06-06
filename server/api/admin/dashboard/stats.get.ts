import { ResponseData } from '~/server/utils/response'

import prisma from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    // 暂时使用固定的用户ID 1 进行测试
    const userId = 1

    // 并发查询基础统计数据
    const [
      totalDomains,
      totalPortfolios,
      pendingInquiries,
      totalValue
    ] = await Promise.all([
      // 总域名数量
      prisma.domain.count({
        where: { userId }
      }),

      // 米表数量（这里暂时返回分类数量作为占位）
      prisma.domainCategory.count({
        where: { userId }
      }),

      // 待处理线索数量
      prisma.inquiry.count({
        where: { 
          status: 'new'
        }
      }),

      // 总投资成本作为资产价值
      prisma.domainCost.aggregate({
        where: { 
          domain: { userId }
        },
        _sum: {
          amount: true
        }
      })
    ])

    return ResponseData.success({
      totalDomains,
      totalPortfolios,
      pendingInquiries,
      totalValue: totalValue._sum.amount || 0
    }, '获取统计数据成功')
  } catch (error) {
    console.error('获取快速统计数据失败:', error)
    return ResponseData.error('获取统计数据失败')
  }
})