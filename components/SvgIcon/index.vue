<template>
  <div class="svg-icon">
  <!-- Element UI 图标 -->
  <el-icon 
    v-if="isElementIcon" 
    :class="['svg-icon', className]" 
    :style="{ fontSize: size, color: color }"
  >
    <component :is="elementIconComponent" />
  </el-icon>
  
  <!-- SVG 文件图标 -->
  <div 
    v-else
    :class="['svg-icon-wrapper', className]" 
    :style="{ width: size, height: size, color: color }"
    v-html="svgContent"
  />
</div>
</template>

<script setup lang="ts">
import { computed, watchEffect, resolveComponent } from 'vue'
import { useNuxtApp } from '#app'
import { ElIcon } from 'element-plus'
import * as ElementPlusIcons from '@element-plus/icons-vue'

interface Props {
  iconClass: string
  className?: string
  color?: string
  size?: string
  type?: 'svg' | 'element' | 'auto' // 图标类型
}

const props = withDefaults(defineProps<Props>(), {
  className: '',
  color: 'currentColor',
  size: '16px',
  type: 'auto'
})

// 获取 Nuxt 插件提供的方法
const { $getSvgIcon, $hasSvgIcon } = useNuxtApp()

// 判断是否为 Element UI 图标
const isElementIcon = computed(() => {
  if (props.type === 'svg') return false
  if (props.type === 'element') return true
  
  // auto 模式：优先检查是否为 SVG 文件，如果不是则尝试 Element UI 图标
  return props.type === 'auto' && !$hasSvgIcon(props.iconClass)
})

// Element UI 图标组件
const elementIconComponent = computed(() => {
  if (!isElementIcon.value) return null
  
  // 将 kebab-case 转换为 PascalCase
  const pascalCase = props.iconClass
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
  
  try {
    // 从 Element Plus 图标库中查找
    const iconComponent = (ElementPlusIcons as any)[pascalCase]
    if (iconComponent) {
      return iconComponent
    }
    
    // 尝试使用 resolveComponent 作为备选
    const component = resolveComponent(pascalCase, false)
    if (component && typeof component !== 'string') {
      return component
    }
    
    if (process.dev) {
      console.warn(`Element UI 图标 "${props.iconClass}" (${pascalCase}) 未找到`)
    }
    return null
  } catch (error) {
    if (process.dev) {
      console.warn(`Element UI 图标 "${props.iconClass}" 未找到:`, error)
    }
    return null
  }
})

// SVG 文件内容
const svgContent = computed(() => {
  if (isElementIcon.value) return ''
  
  const content = $getSvgIcon(props.iconClass)
  
  if (content) {
    // 处理完整的 SVG 元素，确保尺寸和颜色正确应用
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'image/svg+xml')
    const svgElement = doc.querySelector('svg')
    
    if (svgElement) {
      // 移除固定尺寸，让 CSS 控制
      svgElement.removeAttribute('width')
      svgElement.removeAttribute('height')
      
      // 确保有 viewBox，如果没有则使用默认值
      if (!svgElement.getAttribute('viewBox')) {
        svgElement.setAttribute('viewBox', '0 0 24 24')
      }
      
      // 确保 fill 和 stroke 使用 currentColor
      const elements = svgElement.querySelectorAll('path, circle, rect, polygon, line, polyline, ellipse')
      elements.forEach(element => {
        const currentFill = element.getAttribute('fill')
        if (currentFill && currentFill !== 'none' && currentFill !== 'transparent') {
          element.setAttribute('fill', 'currentColor')
        }
        
        const currentStroke = element.getAttribute('stroke')
        if (currentStroke && currentStroke !== 'none' && currentStroke !== 'transparent') {
          element.setAttribute('stroke', 'currentColor')
        }
      })
      
      return svgElement.outerHTML
    }
    
    return content
  }
  
  // 如果没有找到图标，返回一个问号图标
  return `<svg width="${props.size}" height="${props.size}" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C7.59,4 4,12A10,10 0 0,0 12,2Z" fill="currentColor"/>
  </svg>`
})

// 开发模式下的调试信息
if (process.dev) {
  watchEffect(() => {
    if (props.type === 'auto') {
      if (!$hasSvgIcon(props.iconClass) && !elementIconComponent.value) {
        console.warn(`图标 "${props.iconClass}" 既不是 SVG 文件也不是 Element UI 图标`)
      }
    } else if (props.type === 'svg' && !$hasSvgIcon(props.iconClass)) {
      console.warn(`SVG 图标 "${props.iconClass}" 未找到`)
    } else if (props.type === 'element' && !elementIconComponent.value) {
      console.warn(`Element UI 图标 "${props.iconClass}" 未找到`)
    }
  })
}
</script>

<style scoped>
.svg-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  fill: currentColor;
  overflow: hidden;
}

.svg-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.svg-icon-wrapper svg {
  width: 100%;
  height: 100%;
  fill: currentColor;
}
</style>
