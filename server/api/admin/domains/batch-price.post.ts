import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { domainIds, price, costPrice } = body
    
    // TODO: 从session或token中获取用户ID
    const userId = 1 // 临时硬编码，实际应该从认证中获取
    
    if (!domainIds || !Array.isArray(domainIds) || domainIds.length === 0) {
      return ResponseData.error('请选择要操作的域名', 400)
    }

    if (!price && !costPrice) {
      return ResponseData.error('请至少设置一个价格', 400)
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

    let successCount = 0

    // 使用事务确保数据一致性
    await prisma.$transaction(async (tx) => {
      // 更新销售价格
      if (price !== null && price !== undefined) {
        const priceResult = await tx.domain.updateMany({
          where: {
            id: { in: domainIds },
            userId: userId
          },
          data: {
            landingPagePrice: price,
            updatedAt: new Date()
          }
        })
        successCount = priceResult.count
      }

      // 创建成本记录
      if (costPrice !== null && costPrice !== undefined) {
        const costRecords = domainIds.map(domainId => ({
          domainId: domainId,
          costDate: new Date(),
          amount: costPrice,
          costType: 'purchase',
          notes: '批量设置成本'
        }))

        await tx.domainCost.createMany({
          data: costRecords
        })
      }
    })

    return ResponseData.success({
      successCount: successCount
    }, `成功设置 ${successCount} 个域名的价格`)

  } catch (error: any) {
    console.error('批量设置价格失败:', error)
    return ResponseData.error('批量设置价格失败: ' + (error?.message || '未知错误'))
  }
}) 