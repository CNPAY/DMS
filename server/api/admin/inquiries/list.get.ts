import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    // 获取查询参数
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const search = query.search as string || ''
    const status = query.status as string || ''

    // 构建查询条件
    const where: any = {}

    // 搜索条件：访客姓名、邮箱、域名
    if (search) {
      where.OR = [
        { visitorName: { contains: search } },
        { visitorEmail: { contains: search } },
        { 
          domain: {
            domainName: { contains: search }
          }
        }
      ]
    }

    // 状态过滤
    if (status) {
      where.status = status
    }

    // 获取总数
    const total = await prisma.inquiry.count({ where })

    // 获取分页数据，包含关联的域名和米表信息
    const inquiries = await prisma.inquiry.findMany({
      where,
      include: {
        domain: {
          select: {
            id: true,
            domainName: true
          }
        },
        portfolio: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { submittedAt: 'desc' }
    })

    return ResponseData.success({
      inquiries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, '获取询盘列表成功')
  } catch (error: any) {
    console.error('获取询盘列表失败:', error)
    return ResponseData.error('获取询盘列表失败', 500)
  }
})