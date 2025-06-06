export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { portfolioId } = body;

    if (!portfolioId) {
      return {
        code: 400,
        message: '米表ID不能为空'
      };
    }

    // 检查米表是否存在
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: Number(portfolioId) }
    });

    if (!portfolio) {
      return {
        code: 404,
        message: '米表不存在'
      };
    }

    // 使用事务处理，确保数据一致性
    await prisma.$transaction(async (tx) => {
      // 首先将所有米表的默认状态设为false
      await tx.portfolio.updateMany({
        where: { 
          userId: 1 // TODO: 从会话中获取用户ID
        },
        data: { 
          isDefault: false 
        }
      });

      // 然后将指定的米表设为默认
      await tx.portfolio.update({
        where: { id: Number(portfolioId) },
        data: { 
          isDefault: true 
        }
      });
    });

    return {
      code: 200,
      message: `成功设置"${portfolio.name}"为默认米表`,
      data: {
        portfolioId: Number(portfolioId),
        portfolioName: portfolio.name
      }
    };

  } catch (error: any) {
    console.error('设置默认米表失败:', error);
    return {
      code: 500,
      message: '设置失败',
      error: error.message
    };
  }
}); 