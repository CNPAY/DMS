import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(getRouterParam(event, 'id'))

    if (!id || isNaN(id)) {
      return ResponseData.error('ID参数无效', 400)
    }

    // 查询静态页详情
    const staticPage = await prisma.staticPage.findFirst({
      where: {
        id,
        userId: 1 // 确保只能访问当前用户的静态页
      }
    })

    if (!staticPage) {
      return ResponseData.error('静态页不存在', 404)
    }

    return ResponseData.success(staticPage, '获取静态页详情成功')

  } catch (error: any) {
    console.error('获取静态页详情失败:', error)
    return ResponseData.error('获取静态页详情失败', 500)
  }
}) 