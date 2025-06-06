import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { slug } = query

    if (!slug) {
      return ResponseData.error('缺少页面标识')
    }

    // 查询已发布的静态页面
    const staticPage = await prisma.staticPage.findFirst({
      where: {
        slug: slug as string,
        status: 'published' // 只返回已发布的页面
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        linkType: true,
        externalUrl: true,
        openInNewTab: true,
        metaTitle: true,
        metaDescription: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!staticPage) {
      return ResponseData.error('页面不存在')
    }

    return ResponseData.success(staticPage)
  } catch (error) {
    console.error('查询静态页面失败:', error)
    return ResponseData.error('查询静态页面失败')
  }
}) 