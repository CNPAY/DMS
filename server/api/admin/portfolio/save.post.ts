import prisma from '~/server/utils/db'

// 米表保存接口
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const {
      id,
      name,
      slug,
      isDefault = false,
      layoutTemplate = 'list',
      colorTheme = 'moonlight',
      logoUrl,
      backgroundUrl,
      headerInfo,
      headerPages,
      headerRichText,
      footerInfo,
      footerPages,
      footerRichText,
      showPrice = true,
      showDescription = false,
      showTags = false
    } = body;

    // 验证必填字段
    if (!name || !slug) {
      return {
        code: 400,
        message: '米表名称和URL标识符不能为空'
      };
    }

    // 如果设置为默认米表，先取消其他默认米表
    if (isDefault) {
      await prisma.portfolio.updateMany({
        where: {
          userId: 1, // TODO: 从会话中获取用户ID
          isDefault: true,
          ...(id ? { id: { not: id } } : {})
        },
        data: {
          isDefault: false
        }
      });
    }

    let portfolio;
    
    if (id) {
      // 更新现有米表
      portfolio = await prisma.portfolio.update({
        where: { id: Number(id) },
        data: {
          name,
          slug,
          isDefault,
          layoutTemplate,
          colorTheme,
          logoUrl,
          backgroundUrl,
          headerInfo,
          headerPages: headerPages ? JSON.stringify(headerPages) : null,
          headerRichText,
          footerInfo,
          footerPages: footerPages ? JSON.stringify(footerPages) : null,
          footerRichText,
          showPrice,
          showDescription,
          showTags
        }
      });
    } else {
      // 创建新米表
      portfolio = await prisma.portfolio.create({
        data: {
          userId: 1, // TODO: 从会话中获取用户ID
          name,
          slug,
          isDefault,
          layoutTemplate,
          colorTheme,
          logoUrl,
          backgroundUrl,
          headerInfo,
          headerPages: headerPages ? JSON.stringify(headerPages) : null,
          headerRichText,
          footerInfo,
          footerPages: footerPages ? JSON.stringify(footerPages) : null,
          footerRichText,
          showPrice,
          showDescription,
          showTags
        }
      });
    }

    // 注意：域名关联功能已移到独立的 associate 接口处理

    return {
      code: 200,
      message: id ? '米表更新成功' : '米表创建成功',
      data: portfolio
    };
  } catch (error: any) {
    console.error('米表保存失败:', error);
    
    // 处理唯一约束错误
    if (error.code === 'P2002') {
      return {
        code: 400,
        message: 'URL标识符已存在，请使用其他标识符'
      };
    }
    
    return {
      code: 500,
      message: '服务器内部错误'
    };
  }
}); 