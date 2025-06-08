<script setup>
const route = useRoute();
const router = useRouter();

// 获取redirect后的真实路径
const { params } = route;
const { path } = params;
const routePath = Array.isArray(path) ? '/' + path.join('/') : '/' + path;

// 立即跳转到目标页面
await nextTick();
router.replace(routePath + route.query ? '?' + new URLSearchParams(route.query).toString() : '');
</script>

<template>
  <div></div>
</template> 