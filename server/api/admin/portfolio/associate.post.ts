
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    const {
      portfolioId,
      categories = []
    } = body

    if (!portfolioId) {
      return {
        code: 400,
        message: '米表ID不能为空'
      }
    }

    if (!categories || categories.length === 0) {
      return {
        code: 400,
        message: '请选择要关联的分类'
      }
    }

    // 检查米表是否存在
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: Number(portfolioId) }
    })

    if (!portfolio) {
      return {
        code: 404,
        message: '米表不存在'
      }
    }

    // 检查分类是否存在
    const categoryCount = await prisma.domainCategory.count({
      where: {
        id: { in: categories.map(Number) },
        userId: 1 // TODO: 从会话中获取用户ID
      }
    })

    if (categoryCount !== categories.length) {
      return {
        code: 400,
        message: '部分分类不存在'
      }
    }

    // 删除现有的分类关联
    await prisma.portfolioCategoryMap.deleteMany({
      where: { portfolioId: Number(portfolioId) }
    })

    // 创建新的分类关联
    const categoryMaps = categories.map((categoryId: any) => ({
      portfolioId: Number(portfolioId),
      categoryId: Number(categoryId)
    }))

    await prisma.portfolioCategoryMap.createMany({
      data: categoryMaps
    })

    // 统计关联的域名数量（用于显示）
    const domainCount = await prisma.domain.count({
      where: {
        categoryId: { in: categories.map(Number) },
        userId: 1 // TODO: 从会话中获取用户ID
      }
    })

    return {
      code: 200,
      message: `成功关联 ${categories.length} 个分类，包含 ${domainCount} 个域名`,
      data: {
        portfolioId: Number(portfolioId),
        categoryCount: categories.length,
        domainCount: domainCount
      }
    }

  } catch (error: any) {
    console.error('关联米表域名失败:', error)
    return {
      code: 500,
      message: '关联失败',
      error: error.message
    }
  } finally {
    await prisma.$disconnect()
  }
}) 