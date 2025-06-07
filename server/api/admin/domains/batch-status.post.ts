import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { domainIds, salesStatus } = body
    
    // TODO: 从session或token中获取用户ID
    const userId = 1 // 临时硬编码，实际应该从认证中获取
    
    if (!domainIds || !Array.isArray(domainIds) || domainIds.length === 0) {
      return ResponseData.error('请选择要操作的域名', 400)
    }

    if (!salesStatus) {
      return ResponseData.error('请选择销售状态', 400)
    }

    // 验证销售状态值
    const validStatuses = [1, 2, 3, 4] // 1-待售，2-已上架，3-已售出，4-暂停销售
    if (!validStatuses.includes(salesStatus)) {
      return ResponseData.error('无效的销售状态', 400)
    }

    // 验证域名是否属于当前用户
    const userDomains = await prisma.domain.findMany({
      where: {
        id: { in: domainIds },
        userId: userId
      },
      select: { id: true }
    })

    if (userDomains.length !== domainIds.length) {
      return ResponseData.error('包含不属于您的域名', 403)
    }

    // 执行批量更新
    const result = await prisma.domain.updateMany({
      where: {
        id: { in: domainIds },
        userId: userId
      },
      data: {
        salesStatus: salesStatus,
        updatedAt: new Date()
      }
    })

    return ResponseData.success({
      successCount: result.count
    }, `成功修改 ${result.count} 个域名的销售状态`)

  } catch (error: any) {
    console.error('批量修改销售状态失败:', error)
    return ResponseData.error('批量修改销售状态失败: ' + (error?.message || '未知错误'))
  }
}) 