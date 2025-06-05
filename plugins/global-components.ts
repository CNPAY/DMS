import SvgIcon from '~/components/SvgIcon/index.vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

export default defineNuxtPlugin((nuxtApp) => {
  // 注册自定义 SvgIcon 组件 (统一使用 svg-icon)
  if (!nuxtApp.vueApp.component('svg-icon')) {
    nuxtApp.vueApp.component('svg-icon', SvgIcon)
  }
  
  // 检查是否已经注册过 Element Plus 图标
  if (!nuxtApp.vueApp.component('User')) {
    // 注册所有 Element Plus 图标
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
      nuxtApp.vueApp.component(key, component)
    }
    console.log('Element Plus 图标注册完成')
  }
  
  console.log('全局组件注册完成: svg-icon + Element Plus 图标')
}) 