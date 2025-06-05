import prisma from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    // 获取查询参数
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const search = query.search as string || ''

    // 构建查询条件
    const where = {
      userId: 1, // 单用户系统，固定为用户ID 1
      ...(search && {
        OR: [
          { name: { contains: search } },
          { websiteUrl: { contains: search } }
        ]
      })
    }

    // 获取总数
    const total = await prisma.registrar.count({ where })

    // 获取分页数据
    const registrars = await prisma.registrar.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    return {
      success: true,
      data: registrars,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    console.error('获取注册商列表失败:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '获取注册商列表失败'
    })
  }
}) 