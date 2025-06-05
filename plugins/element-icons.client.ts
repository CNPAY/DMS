import * as ElementPlusIconsVue from '@element-plus/icons-vue'

export default defineNuxtPlugin((nuxtApp) => {
  // 注册所有 Element Plus 图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    nuxtApp.vueApp.component(key, component)
  }
  
  console.log('Element Plus 图标注册完成')
}) 