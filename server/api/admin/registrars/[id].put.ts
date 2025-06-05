import prisma from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(getRouterParam(event, 'id') as string)
    const body = await readBody(event)
    const { name, websiteUrl, loginUrl, accountId, notes } = body

    // 数据验证
    if (!name) {
      throw createError({
        statusCode: 400,
        statusMessage: '注册商名称不能为空'
      })
    }

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

    // 检查名称是否与其他注册商冲突
    const nameConflict = await prisma.registrar.findFirst({
      where: {
        userId: 1,
        name: name,
        id: { not: id }
      }
    })

    if (nameConflict) {
      throw createError({
        statusCode: 400,
        statusMessage: '注册商名称已存在'
      })
    }

    // 更新注册商
    const registrar = await prisma.registrar.update({
      where: { id },
      data: {
        name,
        websiteUrl: websiteUrl || null,
        loginUrl: loginUrl || null,
        accountId: accountId || null,
        notes: notes || null
      }
    })

    return {
      success: true,
      message: '注册商更新成功',
      data: registrar
    }
  } catch (error: any) {
    console.error('更新注册商失败:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: '更新注册商失败'
    })
  }
}) 