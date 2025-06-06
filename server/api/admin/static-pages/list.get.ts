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
    const where = {
      userId: 1, // 单用户系统，固定为用户ID 1
      ...(search && {
        OR: [
          { title: { contains: search } },
          { slug: { contains: search } },
          { content: { contains: search } }
        ]
      }),
      ...(status && { status })
    }

    // 获取总数
    const total = await prisma.staticPage.count({ where })

    // 获取分页数据
    const staticPages = await prisma.staticPage.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        linkType: true,
        externalUrl: true,
        openInNewTab: true,
        status: true,
        sortOrder: true,
        metaTitle: true,
        metaDescription: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return ResponseData.success({
      staticPages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, '获取静态页列表成功')
  } catch (error: any) {
    console.error('获取静态页列表失败:', error)
    return ResponseData.error('获取静态页列表失败', 500)
  }
}) 