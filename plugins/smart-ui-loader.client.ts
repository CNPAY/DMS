// plugins/smart-ui-loader.client.ts
// 智能 UI 库加载器 - 基于路由的按需加载

export default defineNuxtPlugin(async () => {
  // 只在客户端执行
  if (import.meta.server) return

  const { autoLoadForCurrentRoute } = useUILibrary()
  const route = useRoute()
  
  // 监听路由变化，智能加载 UI 库
  watch(() => route.path, async (newPath) => {
    console.log(`Route changed to: ${newPath}`)
    await autoLoadForCurrentRoute()
  }, { immediate: true })
  
  console.log('Smart UI Loader initialized')
}) 