import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    // 暂时使用固定的用户ID 1 进行测试
    const userId = 1
    
    const query = getQuery(event)
    const page = Number(query.page) || 1
    const pageSize = Number(query.pageSize) || 20
    const skip = (page - 1) * pageSize

    // 搜索参数
    const domainName = query.domainName as string || ''
    const costType = query.costType as string || ''
    const startDate = query.startDate as string || ''
    const endDate = query.endDate as string || ''
    const minAmount = query.minAmount ? Number(query.minAmount) : undefined
    const maxAmount = query.maxAmount ? Number(query.maxAmount) : undefined

    // 构建查询条件
    const whereCondition: any = {
      domain: { userId }
    }

    // 域名名称筛选
    if (domainName) {
      whereCondition.domain.domainName = {
        contains: domainName
      }
    }

    // 成本类型筛选
    if (costType) {
      whereCondition.costType = costType
    }

    // 日期范围筛选
    if (startDate || endDate) {
      whereCondition.costDate = {}
      if (startDate) {
        whereCondition.costDate.gte = new Date(startDate)
      }
      if (endDate) {
        whereCondition.costDate.lte = new Date(endDate)
      }
    }

    // 金额范围筛选
    if (minAmount !== undefined || maxAmount !== undefined) {
      whereCondition.amount = {}
      if (minAmount !== undefined) {
        whereCondition.amount.gte = minAmount
      }
      if (maxAmount !== undefined) {
        whereCondition.amount.lte = maxAmount
      }
    }

    // 并发查询数据和总数
    const [costs, total] = await Promise.all([
      prisma.domainCost.findMany({
        where: whereCondition,
        include: {
          domain: {
            select: {
              id: true,
              domainName: true,
              registrar: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          costDate: 'desc'
        },
        skip,
        take: pageSize
      }),
      prisma.domainCost.count({ where: whereCondition })
    ])

    // 格式化数据
    const costTypeNames: Record<string, string> = {
      'purchase': '购买',
      'renewal': '续费',
      'transfer': '转移',
      'privacy': '隐私保护',
      'dns': 'DNS服务',
      'ssl': 'SSL证书',
      'other': '其他'
    }

    const formattedCosts = costs.map(cost => ({
      id: cost.id,
      domainId: cost.domainId,
      domainName: cost.domain.domainName,
      registrarName: cost.domain.registrar?.name || '未知',
      costDate: cost.costDate,
      amount: Number(cost.amount),
      costType: cost.costType,
      costTypeName: costTypeNames[cost.costType] || cost.costType,
      renewalYears: cost.renewalYears,
      notes: cost.notes,
      createdAt: cost.createdAt,
      updatedAt: cost.updatedAt
    }))

    return ResponseData.success({
      list: formattedCosts,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }, '获取成本列表成功')

  } catch (error) {
    console.error('获取成本列表失败:', error)
    return ResponseData.error('获取成本列表失败')
  }
}) 