import prisma from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { name, websiteUrl, loginUrl, accountId, notes } = body

    // 数据验证
    if (!name) {
      throw createError({
        statusCode: 400,
        statusMessage: '注册商名称不能为空'
      })
    }

    // 检查注册商名称是否已存在
    const existingRegistrar = await prisma.registrar.findFirst({
      where: {
        userId: 1,
        name: name
      }
    })

    if (existingRegistrar) {
      throw createError({
        statusCode: 400,
        statusMessage: '注册商名称已存在'
      })
    }

    // 创建注册商
    const registrar = await prisma.registrar.create({
      data: {
        userId: 1, // 单用户系统，固定为用户ID 1
        name,
        websiteUrl: websiteUrl || null,
        loginUrl: loginUrl || null,
        accountId: accountId || null,
        notes: notes || null
      }
    })

    return {
      success: true,
      message: '注册商添加成功',
      data: registrar
    }
  } catch (error: any) {
    console.error('添加注册商失败:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: '添加注册商失败'
    })
  }
}) 