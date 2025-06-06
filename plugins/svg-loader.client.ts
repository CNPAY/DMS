export default defineNuxtPlugin(async () => {
  // SVG 图标缓存
  const svgCache = new Map<string, string>()
  
  // 动态导入所有 SVG 文件
  const loadSvgIcons = async () => {
    try {
      console.log('开始加载 SVG 图标...')
      
      // 使用 Vite 的 glob 导入功能
      const svgModules = import.meta.glob('~/assets/icons/svg/*.svg', { 
        as: 'raw',
        eager: true 
      })
      
      // console.log('找到的 SVG 模块:', Object.keys(svgModules))
      // console.log('SVG 模块数量:', Object.keys(svgModules).length)
      
      // 处理每个 SVG 文件
      for (const [path, content] of Object.entries(svgModules)) {
        // console.log('处理文件:', path, '内容类型:', typeof content)
        
        // 从路径中提取文件名
        const fileName = path.split('/').pop()?.replace('.svg', '') || ''
        // console.log('提取的文件名:', fileName)
        
        if (fileName && typeof content === 'string') {
          try {
            // 处理 SVG 内容
            const parser = new DOMParser()
            const svgDoc = parser.parseFromString(content, 'image/svg+xml')
            const svgElement = svgDoc.querySelector('svg')
            
            if (svgElement) {
              // 获取原始的宽高和 viewBox
              const originalWidth = svgElement.getAttribute('width')
              const originalHeight = svgElement.getAttribute('height')
              const originalViewBox = svgElement.getAttribute('viewBox')
              
              // console.log(`${fileName} 原始尺寸: width=${originalWidth}, height=${originalHeight}, viewBox=${originalViewBox}`)
              
              // 移除固定的宽高属性
              svgElement.removeAttribute('width')
              svgElement.removeAttribute('height')
              
              // 处理 viewBox
              let viewBox = originalViewBox
              if (!viewBox && originalWidth && originalHeight) {
                // 如果没有 viewBox 但有宽高，创建一个 viewBox
                const width = parseFloat(originalWidth.replace(/[^\d.]/g, '')) || 24
                const height = parseFloat(originalHeight.replace(/[^\d.]/g, '')) || 24
                viewBox = `0 0 ${width} ${height}`
                // console.log(`${fileName} 创建 viewBox: ${viewBox}`)
              } else if (!viewBox) {
                // 如果都没有，使用默认的 24x24
                viewBox = '0 0 24 24'
                // console.log(`${fileName} 使用默认 viewBox: ${viewBox}`)
              }
              
              svgElement.setAttribute('viewBox', viewBox)
              
              // 设置 fill="currentColor" 以支持动态颜色
              const paths = svgElement.querySelectorAll('path, circle, rect, polygon, line, polyline, ellipse')
              paths.forEach(element => {
                // 只有当元素没有 fill 属性或者 fill 不是 'none' 时才设置
                const currentFill = element.getAttribute('fill')
                if (!currentFill || (currentFill !== 'none' && currentFill !== 'transparent')) {
                  element.setAttribute('fill', 'currentColor')
                }
                
                // 同样处理 stroke
                const currentStroke = element.getAttribute('stroke')
                if (currentStroke && currentStroke !== 'none' && currentStroke !== 'transparent') {
                  element.setAttribute('stroke', 'currentColor')
                }
              })
              
              // 获取处理后的完整 SVG 内容（包含 viewBox）
              const processedSvg = svgElement.outerHTML
              svgCache.set(fileName, processedSvg)
              
              // console.log(`✅ 成功加载 SVG 图标: ${fileName}, viewBox: ${viewBox}`)
            } else {
              // console.error(`❌ 无法解析 SVG 文件: ${fileName}`)
            }
          } catch (parseError) {
            // console.error(`❌ 解析 SVG 文件出错 ${fileName}:`, parseError)
          }
        } else {
          // console.warn(`⚠️ 跳过文件: ${path}, 文件名: ${fileName}, 内容类型: ${typeof content}`)
        }
      }
      
      console.log('✅ SVG 图标加载完成，总数:', svgCache.size)
      console.log('已加载的图标:', Array.from(svgCache.keys()))
    } catch (error) {
      console.error('❌ 加载 SVG 图标时出错:', error)
    }
  }
  
  // 加载 SVG 图标
  await loadSvgIcons()
  
  // 提供全局访问方法
  return {
    provide: {
      getSvgIcon: (name: string) => {
        const icon = svgCache.get(name)
        if (!icon) {
          console.warn(`⚠️ 未找到 SVG 图标: ${name}`)
        }
        return icon || null
      },
      getAllSvgIcons: () => Array.from(svgCache.keys()),
      hasSvgIcon: (name: string) => svgCache.has(name),
      getSvgCacheSize: () => svgCache.size
    }
  }
}) 