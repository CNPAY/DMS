import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(getRouterParam(event, 'id') as string)

    if (!id || isNaN(id)) {
      return ResponseData.error('无效的ID参数', 400)
    }

    // 查询线索详情，包含关联信息
    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: {
        domain: {
          select: {
            id: true,
            domainName: true,
            purchasePrice: true,
            landingPagePrice: true
          }
        },
        portfolio: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    if (!inquiry) {
      return ResponseData.error('线索不存在', 404)
    }

    return ResponseData.success(inquiry, '获取线索详情成功')
  } catch (error: any) {
    console.error('获取线索详情失败:', error)
    return ResponseData.error(error.message || '获取线索详情失败', 500)
  }
}) 