import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { slug } = query

    if (!slug) {
      return ResponseData.error('slug参数不能为空')
    }

    // 根据slug获取米表（由于有userId+slug的复合唯一约束，需要用findFirst）
    const portfolio = await prisma.portfolio.findFirst({
      where: {
        slug: slug as string
      },
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
        showPrice: true,
        showDescription: true,
        showTags: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!portfolio) {
      return ResponseData.error(`未找到米表: ${slug}`)
    }

    return ResponseData.success(portfolio, '获取米表成功')
  } catch (error) {
    console.error('获取米表失败:', error)
    return ResponseData.error('获取米表失败')
  }
}) 