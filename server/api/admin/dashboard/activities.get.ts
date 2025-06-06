import prisma from '~/server/utils/db'


export default defineEventHandler(async (event) => {
  try {

    const query = getQuery(event)
    const limit = Math.min(parseInt(query.limit as string) || 10, 50)
    const user = { id: 1 }
    // 并发查询最近活动
    const [
      recentDomains,
      recentInquiries,
      recentCosts,
      expiringDomains
    ] = await Promise.all([
      // 最近添加的域名
      prisma.domain.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          domainName: true,
          createdAt: true,
          category: {
            select: { name: true }
          }
        }
      }),

      // 最近的线索
      prisma.inquiry.findMany({
        where: { 
          domain: { userId: user.id }
        },
        orderBy: { submittedAt: 'desc' },
        take: limit,
        select: {
          id: true,
          visitorName: true,
          visitorEmail: true,
          message: true,
          status: true,
          submittedAt: true
        }
      }),

      // 最近的成本记录
      prisma.domainCost.findMany({
        where: { 
          domain: { userId: user.id }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          amount: true,
          notes: true,
          costType: true,
          createdAt: true,
          domain: {
            select: {
              domainName: true
            }
          }
        }
      }),

      // 即将到期的域名（30天内）
      prisma.domain.findMany({
        where: {
          userId: user.id,
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

    // 合并活动并按时间排序
    const activities: any[] = []

    // 添加域名活动
    recentDomains.forEach(domain => {
      activities.push({
        id: `domain-${domain.id}`,
        type: 'domain_added',
        title: '新增域名',
        description: `添加了域名 ${domain.domainName}`,
        relatedItem: domain.domainName,
        category: domain.category?.name || '未分类',
        timestamp: domain.createdAt,
        icon: 'plus-circle',
        color: 'success'
      })
    })

    // 添加线索活动
    recentInquiries.forEach(inquiry => {
      activities.push({
        id: `inquiry-${inquiry.id}`,
        type: 'inquiry_received',
        title: '收到线索',
        description: `来自 ${inquiry.visitorName || '访客'} 的线索`,
        relatedItem: inquiry.visitorEmail,
        category: inquiry.status === 'new' ? '待处理' : '已处理',
        timestamp: inquiry.submittedAt,
        icon: 'message',
        color: inquiry.status === 'new' ? 'warning' : 'info'
      })
    })

    // 添加成本活动
    recentCosts.forEach(cost => {
      activities.push({
        id: `cost-${cost.id}`,
        type: 'cost_added',
        title: '新增成本',
        description: `为域名 ${cost.domain.domainName} 添加了${cost.notes || '成本记录'}`,
        relatedItem: `¥${cost.amount}`,
        category: cost.costType,
        timestamp: cost.createdAt,
        icon: 'money',
        color: 'primary'
      })
    })

    // 按时间倒序排列
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // 计算到期提醒
    const expiryAlerts = expiringDomains.map(domain => {
      const daysLeft = Math.ceil((new Date(domain.expiryDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return {
        id: `expiry-${domain.id}`,
        type: 'domain_expiring',
        title: '域名即将到期',
        description: `域名 ${domain.domainName} 将在 ${daysLeft} 天后到期`,
        relatedItem: domain.domainName,
        category: domain.category?.name || '未分类',
        timestamp: domain.expiryDate,
        daysLeft,
        icon: 'warning',
        color: daysLeft <= 7 ? 'danger' : 'warning'
      }
    })

    return {
      success: true,
      data: {
        activities: activities.slice(0, limit),
        expiryAlerts,
        summary: {
          totalActivities: activities.length,
          newDomains: recentDomains.length,
          newInquiries: recentInquiries.length,
          newCosts: recentCosts.length,
          expiringCount: expiringDomains.length
        }
      }
    }
  } catch (error) {
    console.error('获取最近活动失败:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '获取最近活动失败'
    })
  }
}) 