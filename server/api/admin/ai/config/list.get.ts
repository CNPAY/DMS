import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { settingKey: 'ai_service_config' }
    })
    let config = null
    if (setting?.settingValue) {
      try {
        config = JSON.parse(setting.settingValue)
      } catch (e) {
        config = null
      }
    }
    return ResponseData.success({ config }, 'AI服务配置获取成功')
  } catch (error: any) {
    console.error('获取AI服务配置失败:', error)
    return ResponseData.error('获取AI服务配置失败', 500)
  }
})