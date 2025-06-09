import { ResponseData } from '~/server/utils/response'
import prisma from '~/server/utils/db'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // 验证必填字段
    if (!body.currentPassword || !body.newPassword) {
      return ResponseData.error('当前密码和新密码为必填项')
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: 1 }
    })

    if (!user) {
      return ResponseData.error('用户不存在')
    }

    // 验证当前密码
    const isPasswordValid = await bcrypt.compare(body.currentPassword, user.passwordHash)
    if (!isPasswordValid) {
      return ResponseData.error('当前密码不正确')
    }

    // 验证新密码格式
    if (body.newPassword.length < 6 || body.newPassword.length > 20) {
      return ResponseData.error('新密码长度必须在6-20个字符之间')
    }

    // 生成新密码的哈希值
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(body.newPassword, salt)

    // 更新密码
    await prisma.user.update({
      where: { id: 1 },
      data: { 
        passwordHash: hashedPassword,
        updatedAt: new Date()
      }
    })

    return ResponseData.success(null, '密码修改成功')
  } catch (error) {
    console.error('修改密码失败:', error)
    return ResponseData.error('修改密码失败')
  }
}) 