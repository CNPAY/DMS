// composables/useUILibrary.ts
// 智能 UI 库加载管理

import type { Component } from 'vue'

// 已加载的库缓存
const loadedLibraries = new Set<string>()

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