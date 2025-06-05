import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    // 获取查询参数
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const search = query.search as string || ''
    const monitoringLevel = query.monitoringLevel as string || ''
    const notifyOnChange = query.notifyOnChange as string

    // 构建查询条件
    const where: any = {
      userId: 1, // 单用户系统，固定为用户ID 1
    }

    // 搜索条件：域名名称
    if (search) {
      where.domainName = {
        contains: search,
      }
    }

    // 监控级别过滤
    if (monitoringLevel) {
      where.monitoringLevel = monitoringLevel
    }

    // 通知设置过滤
    if (notifyOnChange === 'true') {
      where.notifyOnChange = true
    } else if (notifyOnChange === 'false') {
      where.notifyOnChange = false
    }

    // 获取总数
    const total = await prisma.watchedDomain.count({ where })

    // 获取分页数据
    const watchedDomains = await prisma.watchedDomain.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    return ResponseData.success({
      watchedDomains,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, '获取关注域名列表成功')
  } catch (error: any) {
    console.error('获取关注域名列表失败:', error)
    return ResponseData.error('获取关注域名列表失败', 500)
  }
}) 