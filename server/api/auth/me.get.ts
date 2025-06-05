import jwt from 'jsonwebtoken'
import prisma from '~/server/utils/db'

interface JWTPayload {
  userId: number
  email: string
}

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth-token')

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: '未登录'
    })
  }

  // 验证 JWT token
  const config = useRuntimeConfig()
  let decoded: JWTPayload
  try {
    decoded = jwt.verify(token, config.jwtSecret) as JWTPayload
  } catch {
    throw createError({
      statusCode: 401,
      statusMessage: 'Token 无效'
    })
  }

  // 查找用户
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId }
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: '用户不存在'
    })
  }

  // 返回用户信息（不包含密码）
  const { passwordHash: _, ...userWithoutPassword } = user

  return {
    success: true,
    user: userWithoutPassword
  }
}) 