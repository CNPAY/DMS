# 自定义米表页面

<template>
  <div>
    <!-- 米表显示 -->
    <PortalPortfolioView  v-if="portfolio"  :portfolio="portfolio" 
    />
    
    <!-- 404页面 -->
    <div v-else class="not-found-container">
      <div class="not-found-content">
        <div class="not-found-icon">🔍</div>
        <h1 class="not-found-title">米表未找到</h1>
        <p class="not-found-description">抱歉，您访问的米表不存在或已被删除</p>
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
const slug = route?.params?.slug

// 存储米表数据
const portfolio = ref(null)

// 获取米表数据
let portfolioData = await $fetch('/api/portal/portfolio', {
  query: { slug }
}).catch(async () => {
  return { code: 500 }
})

if (portfolioData.code === 500) {
   // 如果通过slug找不到米表，尝试获取默认米表（当用户访问默认米表的自定义链接时）
   const defaultData = await $fetch('/api/portal/default-portfolio').catch(() => ({ code: 500 }))
    
    // 检查默认米表的slug是否匹配当前访问的slug
    if (defaultData.code === 200) {
      portfolioData = defaultData
    } 
}
if (portfolioData?.code === 200 && portfolioData.data) {
  portfolio.value = portfolioData.data
  console.log(portfolio.value)

  // 设置米表SEO
  const pageTitle = `${portfolio.value.name} - 域名投资组合`
  const pageDescription = `浏览 ${portfolio.value.name} 的精选域名投资组合，发现优质域名投资机会。`
  
  useSeoMeta({
    title: pageTitle,
    description: pageDescription,
    ogTitle: pageTitle,
    ogDescription: pageDescription,
    ogType: 'website'
  })
} else {
  // 设置404页面SEO
  useSeoMeta({
    title: '米表未找到',
    description: '您访问的米表不存在',
    ogTitle: '米表未找到',
    ogDescription: '您访问的米表不存在',
    ogType: 'website'
  })
}
</script>

<style scoped>
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