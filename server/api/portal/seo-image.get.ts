import { ResponseData } from '~/server/utils/response'
import { createCanvas, registerFont, loadImage } from 'canvas'

export default defineEventHandler(async (event) => {
  // 获取查询参数
  const { domain, description, price, format = 'png' } = getQuery(event)
  
  if (!domain) {
    return ResponseData.error('缺少 domain 参数', 400)
  }
  
  try {
    // 创建画布
    const width = 1200
    const height = 630
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')
    
    // 设置背景色
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(0, 0, width, height)
    
    // 绘制边框
    ctx.strokeStyle = '#e0e7ff'
    ctx.lineWidth = 10
    ctx.strokeRect(10, 10, width - 20, height - 20)
    
    // 绘制背景圆形装饰
    ctx.fillStyle = 'rgba(64, 158, 255, 0.1)'
    ctx.beginPath()
    ctx.arc(-100, -100, 400, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.fillStyle = 'rgba(255, 106, 0, 0.1)'
    ctx.beginPath()
    ctx.arc(width + 50, height + 50, 300, 0, Math.PI * 2)
    ctx.fill()
    
    // 设置文本样式 - 域名
    ctx.font = 'bold 72px Arial, "PingFang SC"'
    ctx.fillStyle = '#222c3c'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(domain.toString(), width / 2, height / 2 - 50)
    
    // 如果有描述，则绘制描述
    if (description) {
      ctx.font = '32px Arial, "PingFang SC"'
      ctx.fillStyle = '#409EFF'
      
      // 简单的文本换行处理
      const maxWidth = 800
      const lineHeight = 40
      let descText = description.toString()
      
      // 如果描述过长，则截断并添加省略号
      if (ctx.measureText(descText).width > maxWidth) {
        // 计算合适的长度，然后截断
        let fitLength = 0
        let testWidth = 0
        for (let i = 0; i < descText.length; i++) {
          testWidth += ctx.measureText(descText[i]).width
          if (testWidth > maxWidth - ctx.measureText('...').width) {
            fitLength = i
            break
          }
        }
        descText = descText.substring(0, fitLength) + '...'
      }
      
      ctx.fillText(descText, width / 2, height / 2 + 20)
    }
    
    // 如果有价格，则绘制价格
    if (price) {
      ctx.font = 'bold 48px Arial, "PingFang SC"'
      ctx.fillStyle = '#ff6a00'
      ctx.fillText(`￥${price}`, width / 2, height / 2 + 100)
    }
    
    // 获取图片数据 - 修复类型问题
    const mimeType = format === 'jpeg' || format === 'jpg' ? 'image/jpeg' : 'image/png'
    // @ts-ignore - 解决Canvas类型定义问题
    const imageBuffer = canvas.toBuffer(mimeType)
    
    // 设置响应头
    setResponseHeaders(event, {
      'Content-Type': mimeType,
      'Cache-Control': 'public, max-age=86400' // 缓存一天
    })
    
    // 返回图片数据
    return imageBuffer
  } catch (error) {
    console.error('Error generating SEO image:', error)
    return ResponseData.error('生成图片失败', 500)
  }
}) 