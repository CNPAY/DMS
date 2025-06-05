import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(getRouterParam(event, 'id') as string)
    
    if (isNaN(id)) {
      return ResponseData.error('无效的分类ID', 400)
    }

    // 获取用户信息（从认证中间件或 session）
    const userId = 1 // 临时硬编码，实际应从认证获取

    const category = await prisma.domainCategory.findFirst({
      where: {
        id,
        userId
      },
      include: {
        _count: {
          select: { domains: true }
        }
      }
    })

    if (!category) {
      return ResponseData.error('域名分类不存在', 404)
    }

    return ResponseData.success(category, '获取域名分类详情成功')
  } catch (error: any) {
    console.error('获取域名分类详情失败:', error)
    return ResponseData.error('获取域名分类详情失败', 500)
  }
}) 