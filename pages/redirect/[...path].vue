<script setup>
const route = useRoute();
const router = useRouter();

// 获取redirect后的真实路径
const { params } = route;
const { path } = params;
const routePath = Array.isArray(path) ? '/' + path.join('/') : '/' + path;

// 构建完整的URL包含query参数
const queryString = route.query && Object.keys(route.query).length > 0 
  ? '?' + new URLSearchParams(route.query).toString() 
  : '';

// 立即跳转到目标页面
await nextTick();
router.replace(routePath + queryString);
</script>

<template>
  <div class="redirect-container">
    <div class="loading">正在刷新页面...</div>
  </div>
</template>

<style scoped>
.redirect-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.loading {
  font-size: 16px;
  color: #666;
}
</style> 