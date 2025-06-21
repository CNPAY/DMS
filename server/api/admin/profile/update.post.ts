import { ResponseData } from '~/server/utils/response'
import prisma from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const userId =  event.context.auth.userId // 固定用户ID为1
    const body = await readBody(event)

    // 验证必填字段
    if (!body.username?.trim()) {
      return ResponseData.error('用户名不能为空')
    }
    if (!body.email?.trim()) {
      return ResponseData.error('邮箱不能为空')
    }
    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(body.email)) {
      return ResponseData.error('邮箱格式不正确')
    }

    // 检查用户名和邮箱是否已被其他用户使用
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: body.username },
          { email: body.email }
        ],
        NOT: {
          id: userId
        }
      }
    })

    if (existingUser) {
      if (existingUser.username === body.username) {
        return ResponseData.error('用户名已被使用')
      }
      if (existingUser.email === body.email) {
        return ResponseData.error('邮箱已被使用')
      }
    }

    // 更新用户资料
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username: body.username,
        email: body.email,
        realName: body.realName,
        nickname: body.nickname,
        phone: body.phone,
        avatar: body.avatar,
        bio: body.bio,
        company: body.company,
        position: body.position,
        location: body.location,
        website: body.website,
        
        // 联系方式
        wechat: body.wechat,
        qq: body.qq,
        telegram: body.telegram,
        whatsapp: body.whatsapp,
        skype: body.skype,
        twitter: body.twitter,
        
        // 偏好设置
        language: body.language,
        theme: body.theme,
        timezone: body.timezone,
        notification: body.notification,
        twoFactorEnabled: body.twoFactorEnabled
      },
      select: {
        id: true,
        username: true,
        email: true,
        realName: true,
        nickname: true,
        phone: true,
        avatar: true,
        bio: true,
        company: true,
        position: true,
        location: true,
        website: true,
        
        // 联系方式
        wechat: true,
        qq: true,
        telegram: true,
        whatsapp: true,
        skype: true,
        twitter: true,
        
        // 偏好设置
        language: true,
        theme: true,
        timezone: true,
        notification: true,
        twoFactorEnabled: true,
        
        createdAt: true,
        updatedAt: true
      }
    })

    return ResponseData.success(updatedUser)
  } catch (error) {
    console.error('更新用户资料失败:', error)
    return ResponseData.error('更新用户资料失败')
  }
}) 