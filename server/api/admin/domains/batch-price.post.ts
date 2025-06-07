import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { domainIds, salesPrice, discount, discountExpiry, priceExpiry, purchasePrice, skipEmpty } = body
    
    // TODO: 从session或token中获取用户ID
    const userId = 1 // 临时硬编码，实际应该从认证中获取
    
    if (!domainIds || !Array.isArray(domainIds) || domainIds.length === 0) {
      return ResponseData.error('请选择要操作的域名', 400)
    }

    // skipEmpty默认为true（向后兼容）
    const shouldSkipEmpty = skipEmpty !== false
    
    // 检查是否有任何字段被设置
    const hasAnyValue = (salesPrice !== null && salesPrice !== undefined) ||
                       (discount !== null && discount !== undefined) ||
                       (discountExpiry !== null && discountExpiry !== undefined) ||
                       (priceExpiry !== null && priceExpiry !== undefined) ||
                       (purchasePrice !== null && purchasePrice !== undefined);
    
    // 如果跳过空白字段模式且没有设置任何值，直接返回成功
    if (!hasAnyValue && shouldSkipEmpty) {
      return ResponseData.success({
        successCount: domainIds.length
      }, `已处理 ${domainIds.length} 个域名（未设置任何字段，跳过更新）`)
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
      // 构建更新数据对象
      const updateData: any = {
        updatedAt: new Date()
      }
      
      // 根据skipEmpty参数决定如何处理字段
      if (shouldSkipEmpty) {
        // 跳过空白字段模式：只更新有值的字段
        if (salesPrice !== null && salesPrice !== undefined) {
          updateData.salesPrice = salesPrice
        }
        
        if (discount !== null && discount !== undefined) {
          updateData.discount = discount
        }
        
        if (discountExpiry !== null && discountExpiry !== undefined) {
          updateData.discountExpiry = new Date(discountExpiry)
        }
        
        if (priceExpiry !== null && priceExpiry !== undefined) {
          updateData.priceExpiry = new Date(priceExpiry)
        }
        
        if (purchasePrice !== null && purchasePrice !== undefined) {
          updateData.purchasePrice = purchasePrice
        }
      } else {
        // 不跳过空白字段模式：所有字段都更新（包括置为null）
        updateData.salesPrice = salesPrice || null
        updateData.discount = discount || null
        updateData.discountExpiry = discountExpiry ? new Date(discountExpiry) : null
        updateData.priceExpiry = priceExpiry ? new Date(priceExpiry) : null
        updateData.purchasePrice = purchasePrice || null
      }

      // 只有当有字段需要更新时才执行更新
      if (Object.keys(updateData).length > 1) { // 大于1是因为updatedAt总是存在
        const priceResult = await tx.domain.updateMany({
          where: {
            id: { in: domainIds },
            userId: userId
          },
          data: updateData
        })
        successCount = priceResult.count
      }

      // 购买价格直接在domain表中更新，不需要在cost表中处理
    })

    return ResponseData.success({
      successCount: successCount
    }, `成功设置 ${successCount} 个域名的价格`)

  } catch (error: any) {
    console.error('批量设置价格失败:', error)
    return ResponseData.error('批量设置价格失败: ' + (error?.message || '未知错误'))
  }
}) 