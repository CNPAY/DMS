// 获取米表选项数据接口
export default defineEventHandler(async (event) => {
  try {
    // 获取可用的域名列表
    const domains = await prisma.domain.findMany({
      where: {
        userId: 1, // TODO: 从会话中获取用户ID
        salesStatus: { in: [1, 2] } // 只显示待售和已上架的域名
      },
      select: {
        id: true,
        domainName: true,
        purchasePrice: true,
        salesStatus: true,
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { domainName: 'asc' }
    });

    // 获取域名分类
    const categories = await prisma.domainCategory.findMany({
      where: {
        userId: 1 // TODO: 从会话中获取用户ID
      },
      select: {
        id: true,
        name: true
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    // 布局模板选项
    const layoutTemplates = [
      { value: 'list', label: '列表布局' },
      { value: 'grid', label: '网格布局' },
      { value: 'table', label: '表格布局' },
      { value: 'card', label: '卡片布局' }
    ];

    // 颜色主题选项
    const colorThemes = [
      { value: 'default', label: '默认主题', color: '#409eff' },
      { value: 'dark', label: '深色主题', color: '#303133' },
      { value: 'blue', label: '蓝色主题', color: '#409eff' },
      { value: 'green', label: '绿色主题', color: '#67c23a' },
      { value: 'orange', label: '橙色主题', color: '#e6a23c' },
      { value: 'red', label: '红色主题', color: '#f56c6c' },
      { value: 'purple', label: '紫色主题', color: '#9c27b0' }
    ];

    // 域名状态选项
    const salesStatusOptions = [
      { value: 1, label: '待售' },
      { value: 2, label: '已上架' },
      { value: 3, label: '已售出' },
      { value: 4, label: '暂停销售' }
    ];

    return {
      code: 200,
      message: 'success',
      data: {
        domains,
        categories,
        layoutTemplates,
        colorThemes,
        salesStatusOptions
      }
    };
  } catch (error) {
    console.error('获取选项数据失败:', error);
    return {
      code: 500,
      message: '服务器内部错误'
    };
  }
}); 