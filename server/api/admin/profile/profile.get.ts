import { ResponseData } from '~/server/utils/response'
import prisma from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const userId =  event.context.auth.userId // 固定用户ID为1
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) {
      return ResponseData.error('用户不存在')
    }

    return ResponseData.success(user)
  } catch (error) {
    console.error('获取用户资料失败:', error)
    return ResponseData.error('获取用户资料失败')
  }
}) 