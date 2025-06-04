import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: '邮箱和密码不能为空'
    })
  }

  // 查找用户
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: '用户不存在或密码错误'
    })
  }

  // 验证密码
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
  if (!isPasswordValid) {
    throw createError({
      statusCode: 401,
      statusMessage: '用户不存在或密码错误'
    })
  }

  // 生成 JWT token
  const config = useRuntimeConfig()
  const token = jwt.sign(
    { 
      userId: user.id,
      email: user.email
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  )

  // 设置安全的 cookie
  setCookie(event, 'auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })

  // 返回用户信息（不包含密码）
  const { passwordHash: _, ...userWithoutPassword } = user

  return {
    success: true,
    message: '登录成功',
    user: userWithoutPassword,
    token
  }
}) 