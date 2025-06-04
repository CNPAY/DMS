export default defineEventHandler(async (event) => {
  // 清除认证 cookie
  setCookie(event, 'auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0 // 立即过期
  })

  return {
    success: true,
    message: '登出成功'
  }
}) 