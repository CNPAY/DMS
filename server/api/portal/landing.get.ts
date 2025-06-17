import prisma from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    // 从数据库获取配置
    const setting = await (prisma.systemSetting as any).findUnique({
      where: {
        settingKey: 'landing_page_config'
      }
    })
    
    let config
    if (setting && setting.settingValue) {
      // 解析数据库中的JSON配置
      try {
        config = JSON.parse(setting.settingValue)
      } catch (parseError) {
        console.error('解析配置JSON失败:', parseError)
        config = null
      }
    }
    
    // 如果没有配置或解析失败，返回默认配置
    if (!config) {
      config = {
        theme: 'standard',
        backgroundType: 'solid',
        backgroundColor: 'dark',
        customBackgroundColor: '#1a1a1a',
        fontColor: 'auto',
        saleOptions: ['inquiry', 'makeOffer'],
        priceDisplay: 'hide',
        trafficChart: 'never',
        storePromotion: 'hide',
        contactEmail: '',
        contactPhone: '',
        companyName: '',
        customCSS: '',
        mainTitle: '',
        subTitle: '',
        footerTitle: '',
        copyrightTitle: ''
      }
    }
    
    return {
      code: 200,
      message: '获取配置成功',
      data: config
    }
  } catch (error) {
    console.error('获取配置失败:', error)
    return {
      code: 500,
      message: '获取配置失败: ' + (error instanceof Error ? error.message : '未知错误')
    }
  }
}) 