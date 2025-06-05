import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    // 获取查询参数
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const search = query.search as string || ''
    const categoryId = query.categoryId ? parseInt(query.categoryId as string) : undefined
    const registrarId = query.registrarId ? parseInt(query.registrarId as string) : undefined
    const domainStatus = query.domainStatus ? parseInt(query.domainStatus as string) : undefined
    const salesStatus = query.salesStatus ? parseInt(query.salesStatus as string) : undefined

    // 构建查询条件
    const where = {
      userId: 1, // 单用户系统，固定为用户ID 1
      ...(search && {
        domainName: { contains: search }
      }),
      ...(categoryId && { categoryId }),
      ...(registrarId && { registrarId }),
      ...(domainStatus && { domainStatus }),
      ...(salesStatus && { salesStatus })
    }

    // 获取总数
    const total = await prisma.domain.count({ where })

    // 获取分页数据，包含关联数据
    const domains = await prisma.domain.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        registrar: {
          select: {
            id: true,
            name: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            costs: true,
            inquiries: true
          }
        }
      }
    })

    return ResponseData.success({
      domains,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, '获取域名列表成功')
  } catch (error: any) {
    console.error('获取域名列表失败:', error)
    return ResponseData.error('获取域名列表失败', 500)
  }
}) 