// 米表列表查询接口
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { 
      page = 1, 
      pageSize = 20, 
      keyword = '', 
      status = '', 
      sort = 'createdAt',
      order = 'desc'
    } = query;

    // 构建查询条件
    const where: any = {};
    
    // 关键词搜索（米表名称、slug、描述）
    if (keyword) {
      where.OR = [
        { name: { contains: String(keyword), mode: 'insensitive' } },
        { slug: { contains: String(keyword), mode: 'insensitive' } },
        { headerInfo: { contains: String(keyword), mode: 'insensitive' } }
      ];
    }

    // 排序设置
    const orderBy: any = {};
    orderBy[String(sort)] = String(order);

    // 查询数据
    const [total, portfolios] = await Promise.all([
      prisma.portfolio.count({ where }),
      prisma.portfolio.findMany({
        where,
        orderBy,
        skip: (Number(page) - 1) * Number(pageSize),
        take: Number(pageSize),
        include: {
          user: {
            select: {
              id: true,
              username: true
            }
          },
          _count: {
            select: {
              inquiries: true
            }
          }
        }
      })
    ]);

    // 格式化数据，并计算关联的域名数量
    const formattedPortfolios = await Promise.all(portfolios.map(async (portfolio) => {
      // 获取关联的分类
      const categoryMaps = await prisma.$queryRaw`
        SELECT c.id, c.name 
        FROM portfolio_category_map pcm 
        JOIN domain_categories c ON pcm.category_id = c.id 
        WHERE pcm.portfolio_id = ${portfolio.id}
      `;

      // 计算关联分类下的域名数量
      let domainCount = 0;
      if (Array.isArray(categoryMaps) && categoryMaps.length > 0) {
        const categoryIds = categoryMaps.map((cat: any) => cat.id);
        const domains = await prisma.domain.count({
          where: {
            categoryId: { in: categoryIds },
            userId: 1 // TODO: 从会话中获取用户ID
          }
        });
        domainCount = domains;
      }

      return {
        ...portfolio,
        domainCount: domainCount,
        inquiryCount: portfolio._count.inquiries,
        relatedCategories: categoryMaps
      };
    }));

    return {
      code: 200,
      message: 'success',
      data: {
        list: formattedPortfolios,
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total / Number(pageSize))
      }
    };
  } catch (error) {
    console.error('米表列表查询失败:', error);
    return {
      code: 500,
      message: '服务器内部错误'
    };
  }
}); 