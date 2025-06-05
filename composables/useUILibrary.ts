// composables/useUILibrary.ts
// 智能 UI 库加载管理

import type { Component } from 'vue'

// 已加载的库缓存
const loadedLibraries = new Set<string>()

// 动态应用自定义主题
const applyCustomTheme = async () => {
  // 动态导入主题变量
  const themeVars = await import('~/assets/styles/variables.module.scss')
  
  // 动态创建样式标签应用主题
  const styleId = 'element-plus-custom-theme'
  let styleElement = document.getElementById(styleId)
  
  if (!styleElement) {
    styleElement = document.createElement('style')
    styleElement.id = styleId
    styleElement.setAttribute('type', 'text/css')
    // 插入到head的最后，确保优先级最高
    document.head.appendChild(styleElement)
  }
  
  console.log('Applying custom theme with primary color:', themeVars.default.primaryColor)
  
  // 应用自定义主题CSS变量 - 使用最高优先级
  styleElement.innerHTML = `
    :root {
      --el-color-primary: ${themeVars.default.primaryColor} !important;
      --el-color-primary-light-3: #4080ff !important;
      --el-color-primary-light-5: #73a0ff !important;
      --el-color-primary-light-7: #a6c1ff !important;
      --el-color-primary-light-8: #c6d9ff !important;
      --el-color-primary-light-9: #e5f0ff !important;
      --el-color-primary-dark-2: #0d4bcc !important;
      --el-color-success: ${themeVars.default.successColor} !important;
      --el-color-warning: ${themeVars.default.warningColor} !important;
      --el-color-danger: ${themeVars.default.dangerColor} !important;
      --el-color-info: ${themeVars.default.infoColor} !important;
    }
  `
}

export const useUILibrary = () => {
  const nuxtApp = useNuxtApp()
  const route = useRoute()
  
  // 检查 Element Plus 是否已加载
  const isElementPlusLoaded = (): boolean => {
    return loadedLibraries.has('element-plus')
  }
  
  // 动态加载 Element Plus
  const loadElementPlus = async (): Promise<boolean> => {
    if (isElementPlusLoaded()) {
      return true
    }
    
    try {
      console.log('Loading Element Plus for admin panel...')
      
      // 并行加载库和样式
      const [elementPlus] = await Promise.all([
        import('element-plus'),
        import('element-plus/dist/index.css')
      ])
      
      // 注册 Element Plus
      nuxtApp.vueApp.use(elementPlus.default)
      
      // 加载管理后台样式
      await import('~/assets/styles/admin.scss')
      
      // 等待下一个事件循环，确保Element Plus样式完全加载
      await nextTick()
      
      // 动态注入自定义主题变量
      await applyCustomTheme()
      
      console.log('🎨 Custom theme applied successfully')
      
      // 注册图标
      try {
        const icons = await import('@element-plus/icons-vue')
        for (const [key, component] of Object.entries(icons)) {
          nuxtApp.vueApp.component(key, component as Component)
        }
      } catch (error) {
        console.warn('Failed to load Element Plus icons:', error)
      }
      
      loadedLibraries.add('element-plus')
      console.log('✅ Element Plus loaded successfully')
      return true
    } catch (error) {
      console.error('❌ Failed to load Element Plus:', error)
      return false
    }
  }
  
  // 根据当前路由智能加载
  const autoLoadForCurrentRoute = async (): Promise<boolean> => {
    const currentPath = route.path
    
    // 只在管理后台路由加载 Element Plus
    if (currentPath.startsWith('/admin')) {
      return await loadElementPlus()
    }
    
    return true // 公开门户不需要加载额外库
  }
  
  // 检查当前路由是否需要 Element Plus
  const needsElementPlus = (): boolean => {
    return route.path.startsWith('/admin')
  }
  
  return {
    isElementPlusLoaded,
    loadElementPlus,
    autoLoadForCurrentRoute,
    needsElementPlus
  }
} 