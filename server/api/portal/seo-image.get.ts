import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  // 获取查询参数
  const { domain, description, price } = getQuery(event)
  
  if (!domain) {
    return ResponseData.error('缺少 domain 参数', 400)
  }
  
  try {
    // 创建HTML模板
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${domain} - 域名出售</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          width: 1200px;
          height: 630px;
          background: #f8fafc;
          font-family: 'PingFang SC', Arial, sans-serif;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: relative;
          overflow: hidden;
        }
        .background-circle-1 {
          position: absolute;
          top: -100px;
          left: -100px;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: rgba(64, 158, 255, 0.1);
          z-index: 1;
        }
        .background-circle-2 {
          position: absolute;
          bottom: -50px;
          right: -50px;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: rgba(255, 106, 0, 0.1);
          z-index: 1;
        }
        .content {
          z-index: 2;
          text-align: center;
          padding: 20px;
          max-width: 80%;
        }
        .domain-name {
          font-size: 72px;
          font-weight: bold;
          color: #222c3c;
          margin-bottom: 20px;
        }
        .domain-description {
          font-size: 32px;
          color: #409EFF;
          margin-bottom: 30px;
          max-width: 800px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .domain-price {
          font-size: 48px;
          font-weight: bold;
          color: #ff6a00;
        }
        .border {
          position: absolute;
          top: 10px;
          left: 10px;
          right: 10px;
          bottom: 10px;
          border: 10px solid #e0e7ff;
          z-index: 1;
        }
      </style>
    </head>
    <body>
      <div class="border"></div>
      <div class="background-circle-1"></div>
      <div class="background-circle-2"></div>
      <div class="content">
        <div class="domain-name">${domain}</div>
        ${description ? `<div class="domain-description">${description}</div>` : ''}
        ${price ? `<div class="domain-price">￥${price}</div>` : ''}
      </div>
    </body>
    </html>
    `;
    
    // 设置响应头
    setResponseHeaders(event, {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=86400' // 缓存一天
    })
    
    // 返回HTML
    return html
  } catch (error) {
    console.error('Error generating SEO image:', error)
    return ResponseData.error('生成图片失败', 500)
  }
}) 