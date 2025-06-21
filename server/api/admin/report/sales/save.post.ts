import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    // 暂时使用固定的用户ID 1 进行测试
    const userId =  event.context.auth.userId
    
    const body = await readBody(event)
    
    // 验证必需字段
    if (!body.domainId || !body.salePrice || !body.saleDate) {
      return ResponseData.error('域名ID、售价和销售日期为必填项', 400)
    }

    // 验证域名是否属于当前用户
    const domain = await prisma.domain.findFirst({
      where: {
        id: parseInt(body.domainId),
        userId
      }
    })

    if (!domain) {
      return ResponseData.error('域名不存在或无权限操作', 404)
    }

    // 构建销售记录数据
    const saleData = {
      domainId: parseInt(body.domainId),
      buyerName: body.buyerName || null,
      buyerEmail: body.buyerEmail || null,
      buyerPhone: body.buyerPhone || null,
      buyerCompany: body.buyerCompany || null,
      salePrice: parseFloat(body.salePrice),
      saleCurrency: body.saleCurrency || 'CNY',
      saleDate: new Date(body.saleDate),
      paymentMethod: body.paymentMethod || null,
      paymentStatus: body.paymentStatus || 'pending',
      transferStatus: body.transferStatus || 'pending',
      platformFee: body.platformFee ? parseFloat(body.platformFee) : null,
      platformName: body.platformName || null,
      contractFile: body.contractFile || null,
      notes: body.notes || null
    }

    let saleRecord

    if (body.id) {
      // 更新现有记录
      saleRecord = await prisma.domainSale.update({
        where: { id: parseInt(body.id) },
        data: saleData,
        include: {
          domain: {
            select: {
              domainName: true,
              purchasePrice: true
            }
          }
        }
      })
    } else {
      // 创建新记录
      saleRecord = await prisma.domainSale.create({
        data: saleData,
        include: {
          domain: {
            select: {
              domainName: true,
              purchasePrice: true
            }
          }
        }
      })

      // 更新域名的销售状态
      await prisma.domain.update({
        where: { id: parseInt(body.domainId) },
        data: { salesStatus: 3 } // 3 表示已售出
      })
    }

    return ResponseData.success(saleRecord, body.id ? '更新销售记录成功' : '创建销售记录成功')

  } catch (error) {
    console.error('保存销售记录失败:', error)
    return ResponseData.error('保存销售记录失败')
  }
}) 