# 米表展示组件

<template>
  <div class="portfolio-view" :class="[`theme-${portfolio.colorTheme}`, `layout-${portfolio.layoutTemplate}`]">
    <div class="portfolio-container">
      <!-- 头部信息 -->
      <div class="portfolio-header">
        <div class="header-content">
          <h1 class="portfolio-title">{{ portfolio.name }}</h1>
          
          <!-- 头部静态页面导航 -->
          <div v-if="headerPages && headerPages.length > 0" class="header-navigation">
            <nav class="header-nav">
              <NuxtLink 
                v-for="page in headerPages" 
                :key="page.id"
                :to="page.linkType === 'external' ? page.externalUrl : `/pages/${page.slug}`"
                :target="page.linkType === 'external' && page.openInNewTab ? '_blank' : '_self'"
                class="nav-link"
              >
                {{ page.title }}
              </NuxtLink>
            </nav>
          </div>
          
          <!-- 头部描述信息 -->
          <div v-if="portfolio.headerInfo" class="header-info" v-html="portfolio.headerInfo"></div>
          
          <!-- 头部富文本内容 -->
          <div v-if="portfolio.headerRichText" class="header-rich-text" v-html="portfolio.headerRichText"></div>
        </div>
      </div>

      <!-- 搜索和筛选 -->
      <div class="portfolio-filters">
        <div class="search-box">
          <input 
            v-model="searchTerm" 
            type="text" 
            placeholder="搜索域名..." 
            class="search-input"
          />
        </div>
        <div class="filter-options">
          <select v-model="sortBy" class="sort-select">
            <option value="name">按名称排序</option>
            <option value="price">按价格排序</option>
            <option value="length">按长度排序</option>
          </select>
        </div>
      </div>

      <!-- 域名展示区域 -->
      <div class="domains-section">
        <!-- 列表布局 -->
        <div v-if="portfolio.layoutTemplate === 'list'" class="domains-list">
          <PortalDomainItemList 
            v-for="domain in filteredDomains" 
            :key="domain.id" 
            :domain="domain" 
            :portfolio="portfolio"
          />
        </div>

        <!-- 网格布局 -->
        <div v-else-if="portfolio.layoutTemplate === 'grid'" class="domains-grid">
          <PortalDomainItemGrid 
            v-for="domain in filteredDomains" 
            :key="domain.id" 
            :domain="domain" 
            :portfolio="portfolio"
          />
        </div>

        <!-- 表格布局 -->
        <div v-else-if="portfolio.layoutTemplate === 'table'" class="domains-table">
          <PortalDomainTableView :domains="filteredDomains" :portfolio="portfolio" />
        </div>

        <!-- 卡片布局 -->
        <div v-else-if="portfolio.layoutTemplate === 'card'" class="domains-cards">
          <PortalDomainItemCard 
            v-for="domain in filteredDomains" 
            :key="domain.id" 
            :domain="domain" 
            :portfolio="portfolio"
          />
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          v-for="page in totalPages" 
          :key="page"
          :class="{ active: page === currentPage }"
          @click="currentPage = page"
          class="page-btn"
        >
          {{ page }}
        </button>
      </div>

      <!-- 底部信息 -->
      <div class="portfolio-footer">
        <!-- 底部静态页面导航 -->
        <div v-if="footerPages && footerPages.length > 0" class="footer-navigation">
          <nav class="footer-nav">
            <NuxtLink 
              v-for="page in footerPages" 
              :key="page.id"
              :to="page.linkType === 'external' ? page.externalUrl : `/pages/${page.slug}`"
              :target="page.linkType === 'external' && page.openInNewTab ? '_blank' : '_self'"
              class="footer-nav-link"
            >
              {{ page.title }}
            </NuxtLink>
          </nav>
        </div>
        
        <!-- 底部描述信息 -->
        <div v-if="portfolio.footerInfo" class="footer-info" v-html="portfolio.footerInfo"></div>
        
        <!-- 底部富文本内容 -->
        <div v-if="portfolio.footerRichText" class="footer-rich-text" v-html="portfolio.footerRichText"></div>
      </div>

      <!-- 线索模态框 -->
      <PortalInquiryModal v-model="showInquiry" :domain="selectedDomain" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  portfolio: {
    type: Object,
    required: true
  },
  domains: {
    type: Array,
    default: () => []
  }
})

// 处理头部和尾部页面数据
const headerPages = ref([])
const footerPages = ref([])

// 获取静态页面数据
async function loadStaticPages() {
  try {
    // 获取头部页面
    if (props.portfolio.headerPages) {
      const headerPageIds = JSON.parse(props.portfolio.headerPages)
      if (headerPageIds && headerPageIds.length > 0) {
        for (const pageId of headerPageIds) {
          try {
            const response = await $fetch(`/api/admin/static-pages/${pageId}`)
            if (response.code === 200) {
              headerPages.value.push(response.data)
            }
          } catch (err) {
            console.warn(`获取头部页面 ${pageId} 失败:`, err)
          }
        }
      }
    }
    
    // 获取尾部页面
    if (props.portfolio.footerPages) {
      const footerPageIds = JSON.parse(props.portfolio.footerPages)
      if (footerPageIds && footerPageIds.length > 0) {
        for (const pageId of footerPageIds) {
          try {
            const response = await $fetch(`/api/admin/static-pages/${pageId}`)
            if (response.code === 200) {
              footerPages.value.push(response.data)
            }
          } catch (err) {
            console.warn(`获取尾部页面 ${pageId} 失败:`, err)
          }
        }
      }
    }
  } catch (err) {
    console.error('加载静态页面数据失败:', err)
  }
}

// 组件挂载时加载静态页面
onMounted(() => {
  loadStaticPages()
})

// 响应式数据
const searchTerm = ref('')
const sortBy = ref('name')
const currentPage = ref(1)
const pageSize = 20
const showInquiry = ref(false)
const selectedDomain = ref(null)

// 计算属性
const filteredDomains = computed(() => {
  let filtered = props.domains

  // 搜索过滤
  if (searchTerm.value) {
    filtered = filtered.filter(domain => 
      domain.name.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }

  // 排序
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'price':
        return (b.salePrice || 0) - (a.salePrice || 0)
      case 'length':
        return a.name.length - b.name.length
      default:
        return a.name.localeCompare(b.name)
    }
  })

  // 分页
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filtered.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(props.domains.length / pageSize)
})

// 提供事件给子组件
provide('showInquiry', (domain) => {
  selectedDomain.value = domain
  showInquiry.value = true
})
</script>

<style scoped>
.portfolio-view {
  min-height: 100vh;
}

.portfolio-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 头部样式 */
.portfolio-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 0;
}

.portfolio-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 20px;
  color: #2c3e50;
}

/* 头部导航 */
.header-navigation {
  margin: 30px 0;
}

.header-nav {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.nav-link {
  color: #1976d2;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.nav-link:hover {
  background-color: #1976d2;
  color: white;
  border-color: #1976d2;
}

.header-info {
  font-size: 1.1rem;
  color: #5a6c7d;
  max-width: 800px;
  margin: 20px auto;
  line-height: 1.6;
}

.header-rich-text {
  font-size: 1rem;
  color: #5a6c7d;
  max-width: 800px;
  margin: 20px auto;
  line-height: 1.6;
}

/* 筛选样式 */
.portfolio-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  gap: 20px;
}

.search-box {
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #1976d2;
}

.sort-select {
  padding: 12px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  cursor: pointer;
}

/* 域名展示区域 */
.domains-section {
  margin-bottom: 40px;
}

/* 网格布局 */
.domains-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

/* 卡片布局 */
.domains-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 40px 0;
}

.page-btn {
  padding: 8px 16px;
  border: 2px solid #e1e8ed;
  background: white;
  color: #5a6c7d;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover,
.page-btn.active {
  background: #1976d2;
  color: white;
  border-color: #1976d2;
}

/* 底部样式 */
.portfolio-footer {
  text-align: center;
  padding: 40px 0;
  border-top: 1px solid #e1e8ed;
  margin-top: 40px;
}

/* 底部导航 */
.footer-navigation {
  margin-bottom: 30px;
}

.footer-nav {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.footer-nav-link {
  color: #5a6c7d;
  text-decoration: none;
  font-weight: 400;
  padding: 6px 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.footer-nav-link:hover {
  color: #1976d2;
  background-color: #f5f5f5;
}

.footer-info {
  color: #5a6c7d;
  line-height: 1.6;
  margin: 20px 0;
}

.footer-rich-text {
  color: #5a6c7d;
  line-height: 1.6;
  font-size: 0.9rem;
  margin: 20px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .portfolio-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    max-width: none;
  }

  .domains-grid,
  .domains-cards {
    grid-template-columns: 1fr;
  }

  .portfolio-title {
    font-size: 2rem;
  }
}
</style> 