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

    // 检查分类是否存在
    const existingCategory = await prisma.domainCategory.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!existingCategory) {
      return ResponseData.error('域名分类不存在', 404)
    }

    // 检查是否有域名在使用此分类
    const domainCount = await prisma.domain.count({
      where: {
        categoryId: id
      }
    })

    if (domainCount > 0) {
      return ResponseData.error(`该分类正在被 ${domainCount} 个域名使用，无法删除`, 409)
    }

    // 删除分类
    await prisma.domainCategory.delete({
      where: { id }
    })

    return ResponseData.success(null, '域名分类删除成功')
  } catch (error: any) {
    console.error('删除域名分类失败:', error)
    return ResponseData.error('删除域名分类失败', 500)
  }
}) 