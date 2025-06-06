<template>
  <div>
    <!-- 静态页面显示 -->
    <PortalLayout v-if="staticPage">
      <div class="static-page-container">
        <div class="static-page-content">
          <h1 class="static-page-title">{{ staticPage.title }}</h1>
          <div class="static-page-body" v-html="staticPage.content"></div>
        </div>
      </div>
    </PortalLayout>
    
    <!-- 404页面 -->
    <div v-else class="not-found-container">
      <div class="not-found-content">
        <div class="not-found-icon">📄</div>
        <h1 class="not-found-title">页面未找到2</h1>
        <p class="not-found-description">抱歉，您访问的页面不存在或已被删除</p>
        <NuxtLink 
          to="/" 
          class="not-found-button"
        >
          返回首页
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
// 获取路由参数
const route = useRoute()
const slug = route.params.slug

// 存储静态页面数据
const staticPage = ref(null)

// 查找静态页面
const staticPageData = await $fetch('/api/portal/static-page', {
  query: { slug }
}).catch(() => ({ code: 500 }))

if (staticPageData?.code === 200 && staticPageData.data) {
  staticPage.value = staticPageData.data
  
  // 设置静态页面SEO
  useSeoMeta({
    title: staticPageData.data.title,
    description: staticPageData.data.metaDescription || staticPageData.data.title,
    ogTitle: staticPageData.data.metaTitle || staticPageData.data.title,
    ogDescription: staticPageData.data.metaDescription || staticPageData.data.title,
    ogType: 'website'
  })
} else {
  // 设置404页面SEO
  useSeoMeta({
    title: '页面未找到',
    description: '您访问的页面不存在',
    ogTitle: '页面未找到',
    ogDescription: '您访问的页面不存在',
    ogType: 'website'
  })
}
</script>

<style scoped>
/* 静态页面样式 */
.static-page-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%);
  padding: 2rem 0;
}

.static-page-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.static-page-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 2rem;
  text-align: center;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 1rem;
}

.static-page-body {
  color: #4a5568;
  line-height: 1.8;
  font-size: 1.1rem;
}

.static-page-body :deep(h1),
.static-page-body :deep(h2),
.static-page-body :deep(h3),
.static-page-body :deep(h4),
.static-page-body :deep(h5),
.static-page-body :deep(h6) {
  color: #2d3748;
  margin: 1.5rem 0 1rem 0;
  font-weight: 600;
}

.static-page-body :deep(p) {
  margin-bottom: 1rem;
}

.static-page-body :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1rem 0;
}

.static-page-body :deep(a) {
  color: #3182ce;
  text-decoration: underline;
}

.static-page-body :deep(a:hover) {
  color: #2c5282;
}

.static-page-body :deep(ul),
.static-page-body :deep(ol) {
  margin: 1rem 0;
  padding-left: 2rem;
}

.static-page-body :deep(li) {
  margin-bottom: 0.5rem;
}

.static-page-body :deep(blockquote) {
  border-left: 4px solid #3182ce;
  padding: 1rem;
  margin: 1rem 0;
  background: #f7fafc;
  border-radius: 0 8px 8px 0;
}

.static-page-body :deep(code) {
  background: #f7fafc;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.9em;
}

.static-page-body :deep(pre) {
  background: #f7fafc;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1rem 0;
}

.static-page-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.static-page-body :deep(th),
.static-page-body :deep(td) {
  border: 1px solid #e2e8f0;
  padding: 0.75rem;
  text-align: left;
}

.static-page-body :deep(th) {
  background: #f7fafc;
  font-weight: 600;
}

/* 404页面样式 */
.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%);
}

.not-found-content {
  text-align: center;
  max-width: 500px;
  padding: 2rem;
}

.not-found-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.not-found-title {
  font-size: 2rem;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 1rem;
}

.not-found-description {
  color: #718096;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  line-height: 1.5;
}

.not-found-button {
  display: inline-flex;
  align-items: center;
  padding: 0.875rem 1.5rem;
  background-color: #3182ce;
  color: white;
  font-weight: 500;
  border-radius: 0.5rem;
  text-decoration: none;
  transition: background-color 0.2s ease-in-out;
}

.not-found-button:hover {
  background-color: #2c5282;
}
</style> 