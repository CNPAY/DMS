import prisma from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // 配置数据
    const config = {
      theme: body.theme || 'standard',
      backgroundType: body.backgroundType || 'solid',
      backgroundColor: body.backgroundColor || 'dark',
      customBackgroundColor: body.customBackgroundColor || '#1a1a1a',
      fontColor: body.fontColor || 'auto',
      saleOptions: body.saleOptions || ['inquiry', 'makeOffer'],
      priceDisplay: body.priceDisplay || 'hide',
      trafficChart: body.trafficChart || 'never',
      storePromotion: body.storePromotion || 'hide',
      contactEmail: body.contactEmail || '',
      contactPhone: body.contactPhone || '',
      companyName: body.companyName || '',
      customCSS: body.customCSS || '',
      mainTitle: body.mainTitle || '',
      subTitle: body.subTitle || '',
      footerTitle: body.footerTitle || '',
      copyrightTitle: body.copyrightTitle || '',
      updatedAt: new Date().toISOString()
    }
    
    // 将配置转换为JSON字符串保存到数据库
    const configValue = JSON.stringify(config)
    const settingKey = 'landing_page_config'
    const userId =  event.context.auth.userId // 单用户系统，固定用户ID为1
    
    // 使用Prisma保存配置 (使用类型断言来避免类型检查问题)
    await (prisma.systemSetting as any).upsert({
      where: { 
        settingKey: settingKey 
      },
      update: { 
        settingValue: configValue,
        userId: userId
      },
      create: { 
        settingKey: settingKey,
        settingValue: configValue,
        userId: userId
      }
    })
    
    console.log('着陆页配置已保存到数据库:', config)
    
    return {
      code: 200,
      message: '配置保存成功',
      data: config
    }
  } catch (error) {
    console.error('保存配置失败:', error)
    return {
      code: 500,
      message: '保存配置失败: ' + (error instanceof Error ? error.message : '未知错误')
    }
  }
}) 