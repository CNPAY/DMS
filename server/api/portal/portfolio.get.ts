import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { slug } = query

    // 根据是否有slug决定查询条件
    const whereCondition = slug 
      ? { slug }  // 有slug时按slug查询
      : { isDefault: true }  // 无slug时查询默认米表

    const defaultPortfolio = await prisma.portfolio.findFirst({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        slug: true,
        isDefault: true,
        layoutTemplate: true,
        colorTheme: true,
        enableGrouping: true,
        enableWaterfall: true,
        logoUrl: true,
        backgroundUrl: true,
        textTheme: true,
        backgroundOverlay: true,
        headerInfo: true,
        headerPages: true,
        headerRichText: true,
        footerInfo: true,
        footerPages: true,
        footerRichText: true,
        // SEO配置
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        ogTitle: true,
        ogDescription: true,
        ogImage: true,
        twitterCard: true,
        analyticsCode: true,
        showPrice: true,
        showDescription: true,
        showTags: true,
        enableSearchArea: true,
        createdAt: true,
        updatedAt: true,
        defaultClickBehavior: true,
      }
    })

    if (!defaultPortfolio) {
      return ResponseData.error('未找到默认米表')
    }

    // 解析headerPages/footerPages字段，批量查出静态页信息（只返回必要字段）
    let headerPagesData = [];
    let footerPagesData = [];
    try {
      const headerIds = defaultPortfolio.headerPages ? JSON.parse(defaultPortfolio.headerPages) : [];
      const footerIds = defaultPortfolio.footerPages ? JSON.parse(defaultPortfolio.footerPages) : [];
      if (Array.isArray(headerIds) && headerIds.length > 0) {
        headerPagesData = await prisma.staticPage.findMany({
          where: { id: { in: headerIds } },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            title: true,
            slug: true,
            linkType: true,
            externalUrl: true,
            openInNewTab: true
          }
        });
      }
      if (Array.isArray(footerIds) && footerIds.length > 0) {
        footerPagesData = await prisma.staticPage.findMany({
          where: { id: { in: footerIds } },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            title: true,
            slug: true,
            linkType: true,
            externalUrl: true,
            openInNewTab: true
          }
        });
      }
    } catch (e) {
      headerPagesData = [];
      footerPagesData = [];
    }

    return ResponseData.success({
      ...defaultPortfolio,
      headerPagesData,
      footerPagesData
    }, '获取米表成功')
  } catch (error) {
    console.error('获取米表失败:', error)
    return ResponseData.error('获取米表失败')
  }
}) 