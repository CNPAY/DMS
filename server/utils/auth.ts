import jwt from 'jsonwebtoken'
import prisma from './db'

interface JWTPayload {
  userId: number
  email: string
}

export async function verifyUserSession(event: any) {
  const token = getCookie(event, 'auth-token')

  if (!token) {
    return null
  }

  // 验证 JWT token
  const config = useRuntimeConfig()
  let decoded: JWTPayload
  try {
    decoded = jwt.verify(token, config.jwtSecret) as JWTPayload
  } catch {
    return null
  }

  // 查找用户
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId }
  })

  return user
} 