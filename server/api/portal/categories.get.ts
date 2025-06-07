import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { portfolioId } = query

    if (!portfolioId) {
      return ResponseData.error('portfolioId参数不能为空')
    }

    // 获取米表关联的分类
    const portfolioCategoryMaps = await prisma.portfolioCategoryMap.findMany({
      where: {
        portfolioId: parseInt(portfolioId as string)
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
            sortOrder: true
          }
        }
      }
    })

    // 提取分类信息并按排序字段排序
    const categories = portfolioCategoryMaps
      .map(map => map.category)
      .sort((a, b) => {
        // 首先按sortOrder升序排序
        if (a.sortOrder !== b.sortOrder) {
          return a.sortOrder - b.sortOrder
        }
        // 如果sortOrder相同，按名称排序
        return a.name.localeCompare(b.name)
      })

    return ResponseData.success(categories, '获取米表分类成功')
  } catch (error) {
    console.error('获取米表分类失败:', error)
    return ResponseData.error('获取米表分类失败')
  }
}) 