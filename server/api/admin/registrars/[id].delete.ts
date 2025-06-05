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

    // 检查注册商是否存在
    const existingRegistrar = await prisma.registrar.findFirst({
      where: {
        id,
        userId: 1
      }
    })

    if (!existingRegistrar) {
      throw createError({
        statusCode: 404,
        statusMessage: '注册商不存在'
      })
    }

    // 检查是否有域名使用此注册商
    const domainsCount = await prisma.domain.count({
      where: {
        registrarId: id
      }
    })

    if (domainsCount > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `无法删除注册商，还有 ${domainsCount} 个域名正在使用此注册商`
      })
    }

    // 删除注册商
    await prisma.registrar.delete({
      where: { id }
    })

    return {
      success: true,
      message: '注册商删除成功'
    }
  } catch (error: any) {
    console.error('删除注册商失败:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: '删除注册商失败'
    })
  }
}) 