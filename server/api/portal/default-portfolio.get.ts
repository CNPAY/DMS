import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    // 获取默认米表
    const defaultPortfolio = await prisma.portfolio.findFirst({
      where: {
        isDefault: true
      },
      select: {
        id: true,
        name: true,
        slug: true,
        layoutTemplate: true,
        colorTheme: true,
        headerInfo: true,
        headerPages: true,
        headerRichText: true,
        footerInfo: true,
        footerPages: true,
        footerRichText: true,
        showPrice: true,
        showDescription: true,
        showTags: true,
        createdAt: true
      }
    })

    if (!defaultPortfolio) {
      return ResponseData.error('未找到默认米表')
    }

    return ResponseData.success(defaultPortfolio, '获取默认米表成功')
  } catch (error) {
    console.error('获取默认米表失败:', error)
    return ResponseData.error('获取默认米表失败')
  }
}) 