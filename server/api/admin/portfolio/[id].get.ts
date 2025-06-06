// 获取米表详情接口
export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');
    
    if (!id || isNaN(Number(id))) {
      return {
        code: 400,
        message: '无效的米表ID'
      };
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { id: Number(id) },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        },
        domains: {
          include: {
            domain: {
              select: {
                id: true,
                domainName: true,
                purchasePrice: true,
                salesStatus: true,
                expiryDate: true,
                category: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          },
          orderBy: { displayOrder: 'asc' }
        },
        _count: {
          select: {
            domains: true,
            inquiries: true
          }
        }
      }
    });

    if (!portfolio) {
      return {
        code: 404,
        message: '米表不存在'
      };
    }

    // 获取直接关联的分类
    const categoryMaps = await prisma.$queryRaw`
      SELECT c.id, c.name 
      FROM portfolio_category_map pcm 
      JOIN domain_categories c ON pcm.category_id = c.id 
      WHERE pcm.portfolio_id = ${Number(id)}
    `;

    // 格式化数据
    const formattedPortfolio = {
      ...portfolio,
      domainCount: portfolio._count.domains,
      inquiryCount: portfolio._count.inquiries,
      domains: portfolio.domains.map(pd => ({
        ...pd.domain,
        displayPriceOverride: pd.displayPriceOverride,
        displayOrder: pd.displayOrder
      })),
      relatedCategories: categoryMaps
    };

    return {
      code: 200,
      message: 'success',
      data: formattedPortfolio
    };
  } catch (error) {
    console.error('获取米表详情失败:', error);
    return {
      code: 500,
      message: '服务器内部错误'
    };
  }
}); 