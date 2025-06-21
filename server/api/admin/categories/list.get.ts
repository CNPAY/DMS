import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const search = query.search as string || ''
    
    // 获取用户信息（从认证中间件或 session）
    const userId =  event.context.auth.userId // 临时硬编码，实际应从认证获取

    // 构建查询条件
    const where: any = {
      userId,
      ...(search && {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } }
        ]
      })
    }

    // 获取总数
    const total = await prisma.domainCategory.count({ where })

    // 获取分页数据
    const categories = await prisma.domainCategory.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        { sortOrder: 'asc' },  // 首先按排序字段升序排序
        { createdAt: 'desc' }  // 然后按创建时间降序排序
      ],
      include: {
        _count: {
          select: { domains: true }
        }
      }
    })

    return ResponseData.success({
      categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, '获取域名分类列表成功')
  } catch (error: any) {
    console.error('获取域名分类列表失败:', error)
    return ResponseData.error('获取域名分类列表失败', 500)
  }
}) 