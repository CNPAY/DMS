import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const search = query.search as string || ''
    
    // 获取用户信息（从认证中间件或 session）
    const userId = 1 // 临时硬编码，实际应从认证获取

    // 构建查询条件
    const where: any = {
      userId,
      ...(search && {
        name: { contains: search }
      })
    }

    // 获取总数
    const total = await prisma.domainTag.count({ where })

    // 获取分页数据
    const tags = await prisma.domainTag.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { domains: true }
        }
      }
    })

    return ResponseData.success({
      tags,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, '获取域名标签列表成功')
  } catch (error: any) {
    console.error('获取域名标签列表失败:', error)
    return ResponseData.error('获取域名标签列表失败', 500)
  }
}) 