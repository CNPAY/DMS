import prisma from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(getRouterParam(event, 'id') as string)

    if (!id || isNaN(id)) {
      throw createError({
        statusCode: 400,
        statusMessage: '无效的注册商ID'
      })
    }

    // 获取注册商详情
    const registrar = await prisma.registrar.findFirst({
      where: {
        id,
        userId: 1
      }
    })

    if (!registrar) {
      throw createError({
        statusCode: 404,
        statusMessage: '注册商不存在'
      })
    }

    return {
      success: true,
      data: registrar
    }
  } catch (error: any) {
    console.error('获取注册商详情失败:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: '获取注册商详情失败'
    })
  }
}) 