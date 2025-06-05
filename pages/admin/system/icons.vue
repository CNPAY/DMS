<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">SVG 图标系统测试</h1>
    
    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-4">调试信息</h2>
      <div class="bg-gray-100 p-4 rounded">
        <p><strong>SVG 缓存大小:</strong> {{ cacheSize }}</p>
        <p><strong>可用 SVG 图标数量:</strong> {{ availableIcons.length }}</p>
        <p><strong>插件方法可用:</strong> {{ pluginMethodsAvailable }}</p>
      </div>
    </div>

    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-4">Element UI 图标测试</h2>
      <div class="flex flex-wrap gap-4">
        <div v-for="icon in elementIcons" :key="icon" class="flex flex-col items-center p-4 border rounded">
          <svg-icon :icon-class="icon" size="32px" type="element" class="mb-2" />
          <span class="text-sm">{{ icon }}</span>
        </div>
      </div>
    </div>

    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-4">SVG 文件图标测试</h2>
      <div class="flex flex-wrap gap-4" v-if="availableIcons.length > 0">
        <div v-for="icon in availableIcons" :key="icon" class="flex flex-col items-center p-4 border rounded">
          <svg-icon :icon-class="icon" size="32px" type="svg" class="mb-2" />
          <span class="text-sm">{{ icon }}</span>
        </div>
      </div>
      <div v-if="availableIcons.length > 12" class="mt-4 text-sm text-gray-500">
        显示前 12 个 SVG 图标，总共 {{ availableIcons.length }} 个
      </div>
      <div v-if="availableIcons.length === 0" class="text-red-500">
        没有找到 SVG 文件，请检查控制台日志
      </div>
    </div>

    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-4">自动模式测试 (优先 SVG，回退到 Element UI)</h2>
      <div class="flex flex-wrap gap-4">
        <div v-for="icon in mixedIcons" :key="icon" class="flex flex-col items-center p-4 border rounded">
          <svg-icon :icon-class="icon" size="32px" type="auto" class="mb-2" />
          <span class="text-sm">{{ icon }}</span>
        </div>
      </div>
    </div>

    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-4">尺寸对比测试</h2>
      <div class="flex items-center gap-4 mb-4">
        <span class="text-sm w-20">Element UI:</span>
        <svg-icon icon-class="user" size="16px" type="element" />
        <svg-icon icon-class="user" size="24px" type="element" />
        <svg-icon icon-class="user" size="32px" type="element" />
        <svg-icon icon-class="user" size="48px" type="element" />
      </div>
      <div class="flex items-center gap-4" v-if="availableIcons.includes('user')">
        <span class="text-sm w-20">SVG 文件:</span>
        <svg-icon icon-class="user" size="16px" type="svg" />
        <svg-icon icon-class="user" size="24px" type="svg" />
        <svg-icon icon-class="user" size="32px" type="svg" />
        <svg-icon icon-class="user" size="48px" type="svg" />
      </div>
    </div>

    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-4">颜色测试</h2>
      <div class="flex items-center gap-4 mb-4">
        <span class="text-sm w-20">Element UI:</span>
        <svg-icon icon-class="star" size="32px" type="element" color="red" />
        <svg-icon icon-class="star" size="32px" type="element" color="blue" />
        <svg-icon icon-class="star" size="32px" type="element" color="green" />
        <svg-icon icon-class="star" size="32px" type="element" color="#ff6b35" />
      </div>
      <div class="flex items-center gap-4" v-if="availableIcons.includes('star')">
        <span class="text-sm w-20">SVG 文件:</span>
        <svg-icon icon-class="star" size="32px" type="svg" color="red" />
        <svg-icon icon-class="star" size="32px" type="svg" color="blue" />
        <svg-icon icon-class="star" size="32px" type="svg" color="green" />
        <svg-icon icon-class="star" size="32px" type="svg" color="#ff6b35" />
      </div>
    </div>

    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-4">错误处理测试</h2>
      <div class="flex items-center gap-4">
        <div class="flex flex-col items-center">
          <svg-icon icon-class="nonexistent" size="32px" type="svg" />
          <span class="text-sm">不存在的SVG</span>
        </div>
        <div class="flex flex-col items-center">
          <svg-icon icon-class="nonexistent" size="32px" type="element" />
          <span class="text-sm">不存在的Element</span>
        </div>
        <div class="flex flex-col items-center">
          <svg-icon icon-class="nonexistent" size="32px" type="auto" />
          <span class="text-sm">不存在的Auto</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 定义布局和认证保护
definePageMeta({
  layout: 'admin',
  title: '图标库',
  middleware: 'auth'
})

// 获取所有可用的 SVG 图标
const { $getAllSvgIcons, $getSvgCacheSize } = useNuxtApp()

const availableIcons = computed(() => $getAllSvgIcons())
const cacheSize = computed(() => $getSvgCacheSize())

// 检查插件方法是否可用
const pluginMethodsAvailable = computed(() => {
  return typeof $getAllSvgIcons === 'function' && typeof $getSvgCacheSize === 'function'
})

// Element UI 图标列表（常用的）
const elementIcons = [
  'user', 'star', 'search', 'edit', 'delete', 'plus', 'minus',
  'arrow-left', 'arrow-right', 'arrow-up', 'arrow-down',
  'check', 'close', 'warning', 'info-filled'
]

// 混合图标列表（既有 SVG 文件又有 Element UI 图标的名称）
const mixedIcons = [
  'user', 'star', 'search', 'edit', 'dashboard', 'system',
  'lock', 'message', 'date', 'table', 'form', 'guide'
]

// 在组件挂载时输出调试信息
onMounted(() => {
  console.log('=== SVG 图标系统测试 ===')
  console.log('可用 SVG 图标:', availableIcons.value)
  console.log('SVG 缓存大小:', cacheSize.value)
  console.log('Element UI 图标列表:', elementIcons)
})
</script>

<style scoped>
.p-6 { padding: 1.5rem; }
.p-4 { padding: 1rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }
.mt-4 { margin-top: 1rem; }
.ml-2 { margin-left: 0.5rem; }
.w-20 { width: 5rem; }
.text-sm { font-size: 0.875rem; }
.text-xl { font-size: 1.25rem; }
.text-2xl { font-size: 1.5rem; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.text-gray-500 { color: #6b7280; }
.text-red-500 { color: #ef4444; }
.bg-gray-100 { background-color: #f3f4f6; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }
.items-center { align-items: center; }
.gap-4 { gap: 1rem; }
.border { border: 1px solid #e5e7eb; }
.rounded { border-radius: 0.25rem; }
</style> 