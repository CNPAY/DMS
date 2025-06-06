// 米表删除接口
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return {
        code: 400,
        message: '请选择要删除的米表'
      };
    }

    // 检查是否有默认米表被删除
    const defaultPortfolios = await prisma.portfolio.findMany({
      where: {
        id: { in: ids.map(Number) },
        isDefault: true
      },
      select: { id: true, name: true }
    });

    if (defaultPortfolios.length > 0) {
      return {
        code: 400,
        message: `无法删除默认米表: ${defaultPortfolios.map(p => p.name).join(', ')}`
      };
    }

    // 检查米表是否被询盘使用
    const portfoliosWithInquiries = await prisma.portfolio.findMany({
      where: {
        id: { in: ids.map(Number) }
      },
      include: {
        _count: {
          select: { inquiries: true }
        }
      }
    });

    const hasInquiries = portfoliosWithInquiries.filter(p => p._count.inquiries > 0);
    if (hasInquiries.length > 0) {
      return {
        code: 400,
        message: `以下米表包含询盘记录，无法删除: ${hasInquiries.map(p => p.name).join(', ')}`
      };
    }

    // 执行删除操作（会级联删除关联的域名映射）
    const result = await prisma.portfolio.deleteMany({
      where: {
        id: { in: ids.map(Number) }
      }
    });

    return {
      code: 200,
      message: `成功删除 ${result.count} 个米表`,
      data: { deletedCount: result.count }
    };
  } catch (error) {
    console.error('米表删除失败:', error);
    return {
      code: 500,
      message: '服务器内部错误'
    };
  }
}); 