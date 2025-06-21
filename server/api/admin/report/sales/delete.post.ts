import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    // 暂时使用固定的用户ID 1 进行测试
    const userId =  event.context.auth.userId
    
    const body = await readBody(event)
    const { id, ids } = body

    // 单个删除
    if (id) {
      // 验证销售记录是否存在且属于当前用户
      const sale = await prisma.domainSale.findFirst({
        where: {
          id: parseInt(id),
          domain: { userId }
        }
      })

      if (!sale) {
        return ResponseData.error('销售记录不存在或无权限操作')
      }

      await prisma.domainSale.delete({
        where: { id: parseInt(id) }
      })

      return ResponseData.success(null, '删除成功')
    }

    // 批量删除
    if (ids && Array.isArray(ids) && ids.length > 0) {
      // 验证所有销售记录是否属于当前用户
      const existingSales = await prisma.domainSale.findMany({
        where: {
          id: { in: ids.map((id: any) => parseInt(id)) },
          domain: { userId }
        }
      })

      if (existingSales.length !== ids.length) {
        return ResponseData.error('部分记录不存在或无权限操作')
      }

      const deleteResult = await prisma.domainSale.deleteMany({
        where: {
          id: { in: ids.map((id: any) => parseInt(id)) }
        }
      })

      return ResponseData.success({
        deletedCount: deleteResult.count
      }, `成功删除 ${deleteResult.count} 条销售记录`)
    }

    return ResponseData.error('请提供要删除的记录ID')

  } catch (error) {
    console.error('删除销售记录失败:', error)
    return ResponseData.error('删除销售记录失败')
  }
}) 