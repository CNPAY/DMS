import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    // 获取查询参数
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const search = query.search as string || ''
    const domainMeaning = query.domainMeaning as string || ''
    const categoryId = query.categoryId ? parseInt(query.categoryId as string) : undefined
    const registrarId = query.registrarId ? parseInt(query.registrarId as string) : undefined
    const domainStatus = query.domainStatus ? parseInt(query.domainStatus as string) : undefined
    const salesStatus = query.salesStatus ? parseInt(query.salesStatus as string) : undefined
    
    // 标签筛选
    const tagIds = query.tagIds ? (query.tagIds as string).split(',').map(id => parseInt(id)) : []
    
    // 价格范围筛选
    const purchasePriceMin = query.purchasePriceMin ? parseFloat(query.purchasePriceMin as string) : undefined
    const purchasePriceMax = query.purchasePriceMax ? parseFloat(query.purchasePriceMax as string) : undefined
    const salesPriceMin = query.salesPriceMin ? parseFloat(query.salesPriceMin as string) : undefined
    const salesPriceMax = query.salesPriceMax ? parseFloat(query.salesPriceMax as string) : undefined
    const discountMin = query.discountMin ? parseFloat(query.discountMin as string) : undefined
    const discountMax = query.discountMax ? parseFloat(query.discountMax as string) : undefined
    
    // 时间范围筛选
    const creationDateStart = query.creationDateStart as string
    const creationDateEnd = query.creationDateEnd as string
    const expiryDateStart = query.expiryDateStart as string
    const expiryDateEnd = query.expiryDateEnd as string

    // 构建基础查询条件
    const where: any = {
      userId: 1, // 单用户系统，固定为用户ID 1
    }

    // 域名名称搜索
    if (search) {
      where.domainName = { contains: search }
    }

    // 域名含义搜索
    if (domainMeaning) {
      where.domainMeaning = { contains: domainMeaning }
    }

    // 基础筛选条件
    if (categoryId) where.categoryId = categoryId
    if (registrarId) where.registrarId = registrarId
    if (domainStatus) where.domainStatus = domainStatus
    if (salesStatus) where.salesStatus = salesStatus

    // 价格范围筛选
    if (purchasePriceMin !== undefined || purchasePriceMax !== undefined) {
      where.purchasePrice = {}
      if (purchasePriceMin !== undefined) where.purchasePrice.gte = purchasePriceMin
      if (purchasePriceMax !== undefined) where.purchasePrice.lte = purchasePriceMax
    }

    if (salesPriceMin !== undefined || salesPriceMax !== undefined) {
      where.salesPrice = {}
      if (salesPriceMin !== undefined) where.salesPrice.gte = salesPriceMin
      if (salesPriceMax !== undefined) where.salesPrice.lte = salesPriceMax
    }

    if (discountMin !== undefined || discountMax !== undefined) {
      where.discount = {}
      if (discountMin !== undefined) where.discount.gte = discountMin
      if (discountMax !== undefined) where.discount.lte = discountMax
    }

    // 时间范围筛选
    if (creationDateStart || creationDateEnd) {
      where.creationDate = {}
      if (creationDateStart) where.creationDate.gte = new Date(creationDateStart)
      if (creationDateEnd) {
        const endDate = new Date(creationDateEnd)
        endDate.setHours(23, 59, 59, 999) // 设置为当天结束时间
        where.creationDate.lte = endDate
      }
    }

    if (expiryDateStart || expiryDateEnd) {
      where.expiryDate = {}
      if (expiryDateStart) where.expiryDate.gte = new Date(expiryDateStart)
      if (expiryDateEnd) {
        const endDate = new Date(expiryDateEnd)
        endDate.setHours(23, 59, 59, 999) // 设置为当天结束时间
        where.expiryDate.lte = endDate
      }
    }

    // 标签筛选
    if (tagIds.length > 0) {
      where.tags = {
        some: {
          tagId: { in: tagIds }
        }
      }
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