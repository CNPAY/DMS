import { PrismaClient } from '@prisma/client'
import { ResponseData } from '~/server/utils/response'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // 暂时使用固定的用户ID 1 进行测试
    const userId = 1

    // 并发查询各项统计数据
    const [
      totalDomains,
      pendingInquiries,
      watchedDomains,
      totalCost,
      recentInquiries,
      domainsByCategory,
      monthlyStats,
      expiringDomains
    ] = await Promise.all([
      // 总域名数量
      prisma.domain.count({
        where: { userId }
      }),

      // 待处理线索数量
      prisma.inquiry.count({
        where: { 
          status: 'new'
        }
      }),

      // 关注域名数量
      prisma.watchedDomain.count({
        where: { userId }
      }),

      // 总投资成本
      prisma.domainCost.aggregate({
        where: { 
          domain: { userId }
        },
        _sum: {
          amount: true
        }
      }),

      // 最近7天线索
      prisma.inquiry.findMany({
        where: {
          domain: { userId },
          submittedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { submittedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          visitorName: true,
          visitorEmail: true,
          message: true,
          status: true,
          submittedAt: true
        }
      }),

      // 域名分类统计
      prisma.domain.groupBy({
        by: ['categoryId'],
        where: { userId },
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 5
      }),

      // 最近30天统计（新增域名、线索数量）
      prisma.domain.groupBy({
        by: ['createdAt'],
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        _count: {
          id: true
        }
      }),

      // 即将到期域名（30天内）
      prisma.domain.findMany({
        where: {
          userId,
          expiryDate: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            gte: new Date()
          }
        },
        orderBy: { expiryDate: 'asc' },
        take: 10,
        select: {
          id: true,
          domainName: true,
          expiryDate: true,
          category: {
            select: { name: true }
          }
        }
      })
    ])

    // 获取分类名称
    const categoryIds = domainsByCategory.map(item => item.categoryId).filter(Boolean)
    const categories = await prisma.domainCategory.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true }
    })

    // 构建分类统计数据
    const categoryStats = domainsByCategory.map(item => ({
      categoryId: item.categoryId,
      categoryName: categories.find(cat => cat.id === item.categoryId)?.name || '未分类',
      count: item._count.id
    }))

    // 构建月度趋势数据（按天分组）
    const dailyStats = new Map()
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
      return date.toISOString().split('T')[0]
    })

    // 初始化每天的数据
    last30Days.forEach(date => {
      dailyStats.set(date, { newDomains: 0, inquiries: 0 })
    })

    // 填充域名数据
    monthlyStats.forEach(item => {
      const date = new Date(item.createdAt).toISOString().split('T')[0]
      if (dailyStats.has(date)) {
        dailyStats.get(date).newDomains = item._count.id
      }
    })

    // 查询最近30天线索数据
    const inquiryStats = await prisma.inquiry.groupBy({
      by: ['submittedAt'],
      where: {
        domain: { userId },
        submittedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      _count: {
        id: true
      }
    })

    // 填充线索数据
    inquiryStats.forEach(item => {
      const date = new Date(item.submittedAt).toISOString().split('T')[0]
      if (dailyStats.has(date)) {
        dailyStats.get(date).inquiries = item._count.id
      }
    })

    // 转换为数组格式
    const trendData = last30Days.map(date => ({
      date,
      newDomains: dailyStats.get(date)?.newDomains || 0,
      inquiries: dailyStats.get(date)?.inquiries || 0
    }))

    // 计算一些衍生指标
    const avgDomainCost = totalDomains > 0 ? (totalCost._sum.amount || 0) / totalDomains : 0
    const inquiryGrowth = recentInquiries.length
    const domainGrowth = trendData.slice(-7).reduce((sum, day) => sum + day.newDomains, 0)

    return ResponseData.success({
      // 核心指标
      overview: {
        totalDomains,
        totalValue: totalCost._sum.amount || 0,
        avgDomainCost: Math.round(avgDomainCost * 100) / 100,
        pendingInquiries,
        watchedDomains,
        expiringDomains: expiringDomains.length
      },
      
      // 增长指标
      growth: {
        domainGrowth, // 最近7天新增域名
        inquiryGrowth, // 最近7天新增线索
        weeklyGrowthRate: totalDomains > 0 ? Math.round((domainGrowth / totalDomains) * 10000) / 100 : 0
      },
      
      // 最近活动
      recentActivities: {
        inquiries: recentInquiries,
        expiringDomains
      },
      
      // 统计图表数据
      charts: {
        categoryStats,
        trendData: trendData.slice(-14) // 最近14天趋势
      }
    }, '获取仪表盘数据成功')
  } catch (error) {
    console.error('获取仪表盘数据失败:', error)
    return ResponseData.error('获取仪表盘数据失败')
  }
})