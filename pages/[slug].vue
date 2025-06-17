<template>
  <div class="portal-theme"  :data-theme="portfolio?.colorTheme">
    <!-- 加载状态 -->
    <div v-if="pending" class="loading-container">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p class="loading-text">加载中...</p>
      </div>
    </div>
    
    <!-- 米表显示 -->
    <PortalPortfolioView v-else-if="portfolio && domains" :portfolio="portfolio" :domains="domains" />
    
    <!-- 404页面 -->
    <div v-else class="not-found-container">
      <div class="not-found-content">
        <div class="not-found-icon">🔍</div>
        <h1 class="not-found-title">米表未找到</h1>
        <p class="not-found-description">抱歉，您访问的米表不存在或已被删除</p>
        <NuxtLink to="/" class="not-found-button">
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

// 响应式数据
const portfolio = ref(null)
const domains = ref([])
const pending = ref(true)
const error = ref(null)

import { useTheme } from '@/composables/useTheme'
const { setTheme } = useTheme()
// 数据加载函数
async function loadPortfolioData() {
  try {
    pending.value = true
    
    let portfolioData = null
    
    // 1. 如果有slug，先尝试根据slug获取米表
    if (slug) {
      try {
        portfolioData = await $fetch('/api/portal/portfolio', {
          query: { slug }
        })
      } catch (err) {
        console.warn('根据slug获取米表失败:', err)
      }
    }
    
    // 2. 如果没有找到指定的米表，尝试获取默认米表
    if (!portfolioData || portfolioData.code !== 200) {
      try {
        const defaultData = await $fetch('/api/portal/portfolio')
        
        // 如果访问的是默认米表的slug，使用默认米表数据
        if (defaultData.code === 200 && defaultData.data) {
          if (!slug || defaultData.data.slug === slug) {
            portfolioData = defaultData
          }
        }
      } catch (err) {
        console.warn('获取默认米表失败:', err)
      }
    }
    
    // 3. 处理米表数据
    if (portfolioData?.code === 200 && portfolioData.data) {
      portfolio.value = portfolioData.data
      // setTheme(portfolio.value.colorTheme)
      // 设置页面SEO - 使用米表配置的SEO信息
      const portfolioConfig = portfolio.value
      
      // 页面标题：优先使用SEO标题，否则使用米表名称
      const pageTitle = `${portfolioConfig.seoTitle} | ${portfolioConfig.name}`
      
      // 页面描述：优先使用SEO描述，否则使用默认描述
      const pageDescription = portfolioConfig.seoDescription || 
        `浏览 ${portfolioConfig.name} 的精选域名投资组合，发现优质域名投资机会。`
      
      // OG标题：优先使用OG标题，否则使用SEO标题
      const ogTitle = portfolioConfig.ogTitle || pageTitle
      
      // OG描述：优先使用OG描述，否则使用SEO描述
      const ogDescription = portfolioConfig.ogDescription || pageDescription
      
      // SEO元数据配置
      const seoConfig = {
        title: pageTitle,
        description: pageDescription,
        keywords: portfolioConfig.seoKeywords,
        ogTitle: ogTitle,
        ogDescription: ogDescription,
        ogType: 'website',
        twitterCard: portfolioConfig.twitterCard || 'summary'
      }
      
      // 如果有OG图片，添加到配置中
      if (portfolioConfig.ogImage) {
        seoConfig.ogImage = portfolioConfig.ogImage
        seoConfig.twitterImage = portfolioConfig.ogImage
      }
      
      // 应用SEO配置
      useSeoMeta(seoConfig)
      
      // 如果有统计代码，插入到页面头部
      if (portfolioConfig.analyticsCode) {
        useHead({
          script: [
            {
              innerHTML: portfolioConfig.analyticsCode,
              type: 'text/javascript'
            }
          ]
        })
      }
      
      // 4. 获取米表关联的域名数据
      try {
        const domainsResponse = await $fetch('/api/portal/domains', {
          query: { portfolioId: portfolio.value.id }
        })
        
        if (domainsResponse.code === 200) {
          domains.value = domainsResponse.data || []
        } else {
          console.warn('获取域名数据失败:', domainsResponse.message)
          domains.value = []
        }
      } catch (err) {
        console.error('获取域名数据失败:', err)
        domains.value = []
      }
    } else {
      // 设置404页面SEO
      useSeoMeta({
        title: '米表未找到',
        description: '您访问的米表不存在',
        ogTitle: '米表未找到',
        ogDescription: '您访问的米表不存在',
        ogType: 'website'
      })
      
      portfolio.value = null
      domains.value = []
    }
  } catch (err) {
    console.error('加载米表数据失败:', err)
    error.value = '加载数据失败'
    portfolio.value = null
    domains.value = []
  } finally {
    pending.value = false
  }
}

// 页面加载时获取数据
await loadPortfolioData()

// 监听路由变化，重新加载数据
watch(() => route.params.slug, () => {
  loadPortfolioData()
})
</script>

<style scoped>
.loading-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%);
}

.loading-content {
  text-align: center;
  max-width: 300px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #3182ce;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #718096;
  font-size: 1.1rem;
  margin: 0;
}

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