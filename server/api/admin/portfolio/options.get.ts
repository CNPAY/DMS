import { LAYOUT_TEMPLATES, COLOR_THEMES, SALES_STATUS_OPTIONS } from '~/utils/constants.js'

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
      orderBy: { name: 'asc' }
    });



    return {
      code: 200,
      message: 'success',
      data: {
        domains,
        categories,
        layoutTemplates: LAYOUT_TEMPLATES,
        colorThemes: COLOR_THEMES,
        salesStatusOptions: SALES_STATUS_OPTIONS
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