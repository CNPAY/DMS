import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(getRouterParam(event, 'id') as string)

    if (!id || isNaN(id)) {
      return ResponseData.error('无效的ID参数', 400)
    }

    // 查询关注域名
    const watchedDomain = await prisma.watchedDomain.findFirst({
      where: {
        id,
        userId: 1
      }
    })

    if (!watchedDomain) {
      return ResponseData.error('关注域名不存在', 404)
    }

    return ResponseData.success(watchedDomain, '获取关注域名详情成功')
  } catch (error: any) {
    console.error('获取关注域名详情失败:', error)
    return ResponseData.error(error.message || '获取关注域名详情失败', 500)
  }
})