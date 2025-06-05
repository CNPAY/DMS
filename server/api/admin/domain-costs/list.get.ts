import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    // 获取查询参数
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const domainId = query.domainId ? parseInt(query.domainId as string) : undefined
    const costType = query.costType as string || ''
    const startDate = query.startDate as string || ''
    const endDate = query.endDate as string || ''

    // 构建查询条件
    const where: any = {
      domain: {
        userId: 1 // 单用户系统，固定为用户ID 1
      }
    }

    // 添加筛选条件
    if (domainId) {
      where.domainId = domainId
    }

    if (costType) {
      where.costType = costType
    }

    if (startDate && endDate) {
      where.costDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } else if (startDate) {
      where.costDate = {
        gte: new Date(startDate)
      }
    } else if (endDate) {
      where.costDate = {
        lte: new Date(endDate)
      }
    }

    // 获取总数
    const total = await prisma.domainCost.count({ where })

    // 获取分页数据，包含关联的域名信息
    const costs = await prisma.domainCost.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { costDate: 'desc' },
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
      }
    })

    return ResponseData.success({
      costs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, '获取域名成本列表成功')
  } catch (error: any) {
    console.error('获取域名成本列表失败:', error)
    return ResponseData.error('获取域名成本列表失败', 500)
  }
}) 