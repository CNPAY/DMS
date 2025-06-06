<template>
  <div class="portfolio-view" :class="[`theme-${portfolio.colorTheme}`, `layout-${portfolio.layoutTemplate}`]">
    <div class="portfolio-container">
      <!-- 头部信息 -->
      <div class="portfolio-header">
        <div class="header-content">
          <div class="header-main">
            <div class="header-info-section">
              <div class="portfolio-title">{{ portfolio.name }}</div>
              <div v-if="portfolio.headerInfo" class="header-info" v-html="portfolio.headerInfo"></div>
            </div>

            <!-- 头部静态页面导航 - 紧跟标题 -->
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
          </div>
          <div class="header-content-bottom">
            <div v-if="portfolio.headerRichText" class="header-rich-text" v-html="portfolio.headerRichText"></div>
          </div>
        </div>
      
      </div>

      <!-- 搜索和筛选 -->
      <div class="portfolio-filters">
        <!-- 第一行：关键词搜索和排序 -->
        <div class="filter-row filter-row-main">
          <div class="search-box">
            <input 
              v-model="searchTerm" 
              type="text" 
              placeholder="搜索域名关键词..." 
              class="search-input"
            />
          </div>
          <div class="sort-box">
            <select v-model="sortBy" class="sort-select">
              <option value="name_asc">按名称 A-Z</option>
              <option value="name_desc">按名称 Z-A</option>
              <option value="price_desc">按价格 高-低</option>
              <option value="price_asc">按价格 低-高</option>
              <option value="length_asc">按长度 短-长</option>
              <option value="length_desc">按长度 长-短</option>
            </select>
          </div>
        </div>

        <!-- 第二行：专业筛选选项 -->
        <div class="filter-row filter-row-advanced">
          <div class="filter-group filter-group-category">
            <label class="filter-label">分类</label>
            <div class="category-buttons">
                              <button 
                  :class="{ active: selectedCategory === '' }"
                  @click="handleCategoryClick('')"
                  class="category-btn"
                >
                  全部分类
                </button>
                              <button 
                  v-for="category in categories" 
                  :key="category.id"
                  :class="{ active: selectedCategory === category.id }"
                  @click="handleCategoryClick(category.id)"
                  class="category-btn"
                >
                  {{ category.name }}
                </button>
            </div>
          </div>

          <div class="filter-group">
            <label class="filter-label">标签</label>
            <select v-model="selectedTag" class="filter-select">
              <option value="">全部标签</option>
              <option v-for="tag in tags" :key="tag.id" :value="tag.id">
                {{ tag.name }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">长度</label>
            <select v-model="selectedLength" class="filter-select">
              <option value="">任意长度</option>
              <option value="1-3">1-3字符</option>
              <option value="4-6">4-6字符</option>
              <option value="7-10">7-10字符</option>
              <option value="11+">11字符以上</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">后缀</label>
            <select v-model="selectedSuffix" class="filter-select">
              <option value="">全部后缀</option>
              <option v-for="suffix in domainSuffixes" :key="suffix" :value="suffix">
                .{{ suffix }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">价格区间</label>
            <select v-model="selectedPriceRange" class="filter-select">
              <option value="">任意价格</option>
              <option value="0-1000">$0 - $1,000</option>
              <option value="1000-5000">$1,000 - $5,000</option>
              <option value="5000-10000">$5,000 - $10,000</option>
              <option value="10000+">$10,000以上</option>
            </select>
          </div>

          <button @click="resetFilters" class="reset-btn">
            重置筛选
          </button>
        </div>
      </div>

      <!-- 筛选结果统计 -->
      <div v-if="hasActiveFilters" class="filter-stats">
        <span>找到 {{ filteredDomainsCount }} 个域名</span>
        <span>{{ activeFiltersText }}</span>
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
        <div class="footer-content">
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
          <div v-if="portfolio.footerRichText" class="footer-rich-text" v-html="portfolio.footerRichText"></div>
        </div>
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

// 响应式数据
const searchTerm = ref('')
const sortBy = ref('name_asc')
const selectedCategory = ref('')
const selectedTag = ref('')
const selectedLength = ref('')
const selectedSuffix = ref('')
const selectedPriceRange = ref('')
const currentPage = ref(1)
const pageSize = 20
const showInquiry = ref(false)
const selectedDomain = ref(null)

// 筛选选项数据
const categories = ref([])
const tags = ref([])
const domainSuffixes = ref([])

// 从域名数据中提取后缀
const extractSuffixes = () => {
  const suffixes = new Set()
  props.domains.forEach(domain => {
    const parts = domain.name.split('.')
    if (parts.length > 1) {
      suffixes.add(parts[parts.length - 1])
    }
  })
  domainSuffixes.value = Array.from(suffixes).sort()
}

// 从域名数据中提取标签
const extractTags = () => {
  const tagMap = new Map()
  props.domains.forEach(domain => {
    if (domain.tags && domain.tags.length > 0) {
      domain.tags.forEach(tag => {
        if (!tagMap.has(tag.id)) {
          tagMap.set(tag.id, tag)
        }
      })
    }
  })
  tags.value = Array.from(tagMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  console.log('从域名中提取的标签:', tags.value)
}

// 获取筛选选项数据
async function loadFilterOptions() {
  try {
    // 获取分类数据
    const categoryResponse = await $fetch('/api/portal/categories', {
      query: { portfolioId: props.portfolio.id }
    })
    if (categoryResponse.code === 200) {
      categories.value = categoryResponse.data
      console.log('分类数据:', categories.value)
    }
  } catch (err) {
    console.warn('获取筛选选项失败:', err)
  }
  
  // 提取域名后缀和标签
  extractSuffixes()
  extractTags()
}

// 处理分类点击
const handleCategoryClick = (categoryId) => {
  console.log('点击分类:', categoryId, '类型:', typeof categoryId)
  selectedCategory.value = categoryId
  currentPage.value = 1
  console.log('设置后的selectedCategory:', selectedCategory.value, '类型:', typeof selectedCategory.value)
}

// 重置筛选条件
const resetFilters = () => {
  searchTerm.value = ''
  selectedCategory.value = ''
  selectedTag.value = ''
  selectedLength.value = ''
  selectedSuffix.value = ''
  selectedPriceRange.value = ''
  sortBy.value = 'name_asc'
  currentPage.value = 1
}

// 组件挂载时加载静态页面
onMounted(() => {
  loadStaticPages()
  loadFilterOptions()
})

// 监听域名数据变化，重新提取后缀和标签
watch(() => props.domains, () => {
  console.log('域名数据:', props.domains.slice(0, 3)) // 只打印前3个域名的数据结构
  extractSuffixes()
  extractTags()
}, { immediate: true })

// 计算属性
const filteredDomains = computed(() => {
  let filtered = props.domains

  // 关键词搜索
  if (searchTerm.value) {
    filtered = filtered.filter(domain => 
      domain.name.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }

  // 分类筛选
  if (selectedCategory.value) {
    console.log('筛选分类:', selectedCategory.value, '类型:', typeof selectedCategory.value)
    console.log('域名样例categoryId:', filtered.length > 0 ? filtered[0].categoryId : '无域名', '类型:', filtered.length > 0 ? typeof filtered[0].categoryId : '无')
    filtered = filtered.filter(domain => 
      domain.categoryId === selectedCategory.value
    )
    console.log('筛选后域名数量:', filtered.length)
  }

  // 标签筛选
  if (selectedTag.value) {
    filtered = filtered.filter(domain => 
      domain.tags && domain.tags.some(tag => tag.id === selectedTag.value)
    )
  }

  // 长度筛选
  if (selectedLength.value) {
    filtered = filtered.filter(domain => {
      const length = domain.name.split('.')[0].length
      switch (selectedLength.value) {
        case '1-3':
          return length >= 1 && length <= 3
        case '4-6':
          return length >= 4 && length <= 6
        case '7-10':
          return length >= 7 && length <= 10
        case '11+':
          return length >= 11
        default:
          return true
      }
    })
  }

  // 后缀筛选
  if (selectedSuffix.value) {
    filtered = filtered.filter(domain => 
      domain.name.endsWith('.' + selectedSuffix.value)
    )
  }

  // 价格区间筛选
  if (selectedPriceRange.value) {
    filtered = filtered.filter(domain => {
      const price = domain.salePrice || 0
      switch (selectedPriceRange.value) {
        case '0-1000':
          return price >= 0 && price <= 1000
        case '1000-5000':
          return price > 1000 && price <= 5000
        case '5000-10000':
          return price > 5000 && price <= 10000
        case '10000+':
          return price > 10000
        default:
          return true
      }
    })
  }

  // 排序
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'name_desc':
        return b.name.localeCompare(a.name)
      case 'price_desc':
        return (b.salePrice || 0) - (a.salePrice || 0)
      case 'price_asc':
        return (a.salePrice || 0) - (b.salePrice || 0)
      case 'length_asc':
        return a.name.length - b.name.length
      case 'length_desc':
        return b.name.length - a.name.length
      case 'name_asc':
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
  let filtered = props.domains

  // 应用所有筛选条件（不包括分页）
  if (searchTerm.value) {
    filtered = filtered.filter(domain => 
      domain.name.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }
  if (selectedCategory.value) {
    filtered = filtered.filter(domain => domain.categoryId === selectedCategory.value)
  }
  if (selectedTag.value) {
    filtered = filtered.filter(domain => 
      domain.tags && domain.tags.some(tag => tag.id === selectedTag.value)
    )
  }
  if (selectedLength.value) {
    filtered = filtered.filter(domain => {
      const length = domain.name.split('.')[0].length
      switch (selectedLength.value) {
        case '1-3': return length >= 1 && length <= 3
        case '4-6': return length >= 4 && length <= 6
        case '7-10': return length >= 7 && length <= 10
        case '11+': return length >= 11
        default: return true
      }
    })
  }
  if (selectedSuffix.value) {
    filtered = filtered.filter(domain => domain.name.endsWith('.' + selectedSuffix.value))
  }
  if (selectedPriceRange.value) {
    filtered = filtered.filter(domain => {
      const price = domain.salePrice || 0
      switch (selectedPriceRange.value) {
        case '0-1000': return price >= 0 && price <= 1000
        case '1000-5000': return price > 1000 && price <= 5000
        case '5000-10000': return price > 5000 && price <= 10000
        case '10000+': return price > 10000
        default: return true
      }
    })
  }

  return Math.ceil(filtered.length / pageSize)
})

// 筛选结果计数
const filteredDomainsCount = computed(() => {
  let filtered = props.domains

  // 应用所有筛选条件
  if (searchTerm.value) {
    filtered = filtered.filter(domain => 
      domain.name.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }
  if (selectedCategory.value) {
    filtered = filtered.filter(domain => domain.categoryId === selectedCategory.value)
  }
  if (selectedTag.value) {
    filtered = filtered.filter(domain => 
      domain.tags && domain.tags.some(tag => tag.id === selectedTag.value)
    )
  }
  if (selectedLength.value) {
    filtered = filtered.filter(domain => {
      const length = domain.name.split('.')[0].length
      switch (selectedLength.value) {
        case '1-3': return length >= 1 && length <= 3
        case '4-6': return length >= 4 && length <= 6
        case '7-10': return length >= 7 && length <= 10
        case '11+': return length >= 11
        default: return true
      }
    })
  }
  if (selectedSuffix.value) {
    filtered = filtered.filter(domain => domain.name.endsWith('.' + selectedSuffix.value))
  }
  if (selectedPriceRange.value) {
    filtered = filtered.filter(domain => {
      const price = domain.salePrice || 0
      switch (selectedPriceRange.value) {
        case '0-1000': return price >= 0 && price <= 1000
        case '1000-5000': return price > 1000 && price <= 5000
        case '5000-10000': return price > 5000 && price <= 10000
        case '10000+': return price > 10000
        default: return true
      }
    })
  }

  return filtered.length
})

// 是否有激活的筛选条件
const hasActiveFilters = computed(() => {
  return searchTerm.value || selectedCategory.value || selectedTag.value || 
         selectedLength.value || selectedSuffix.value || selectedPriceRange.value
})

// 激活的筛选条件文本
const activeFiltersText = computed(() => {
  const filters = []
  if (searchTerm.value) filters.push(`关键词: ${searchTerm.value}`)
  if (selectedCategory.value) {
    const category = categories.value.find(c => c.id === selectedCategory.value)
    if (category) filters.push(`分类: ${category.name}`)
  }
  if (selectedTag.value) {
    const tag = tags.value.find(t => t.id === selectedTag.value)
    if (tag) filters.push(`标签: ${tag.name}`)
  }
  if (selectedLength.value) filters.push(`长度: ${selectedLength.value}`)
  if (selectedSuffix.value) filters.push(`后缀: .${selectedSuffix.value}`)
  if (selectedPriceRange.value) filters.push(`价格: ${selectedPriceRange.value}`)
  
  return filters.join(' | ')
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
  /* margin-bottom: 16px; */
  padding: 12px 0;
}
.header-info-section{
  display: flex;
  flex-direction: column;
  gap: 8px;
  div{
    text-align: left;
  }
}
.header-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.portfolio-title {
  font-size: 2.2rem;
  font-weight: bold;
  margin: 0;
  color: #2c3e50;
  text-align: center;
}
.header-main{
  display: flex;
  flex-direction: row;
  gap: 8px;
  justify-content: space-between;
}
/* 头部导航紧跟标题 */
.header-navigation {

}

.header-nav {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.nav-link {
  color: #1976d2;
  text-decoration: none;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 4px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  font-size: 0.9rem;
}

.nav-link:hover {
  background-color: #1976d2;
  color: white;
  border-color: #1976d2;
}

/* 筛选样式 - 专业版 */
.portfolio-filters {
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  padding: 16px;
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-row-main {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e9ecef;
}

.filter-row-advanced {
  gap: 12px;
}

.search-box {
  flex: 1;
  min-width: 250px;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e1e8ed;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}

.sort-box {
  min-width: 140px;
}

.sort-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e1e8ed;
  border-radius: 4px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 120px;
}

.filter-group-category {
  min-width: 300px;
  flex: 1;
}

.filter-label {
  font-size: 12px;
  font-weight: 500;
  color: #5a6c7d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-buttons {
  display: flex;
  /* justify-content: space-between; */
  gap: 6px;
  flex-wrap: wrap;
}

.category-btn {
  padding: 3px 5px;
  border: 1px solid #e1e8ed;
  background: white;
  color: #5a6c7d;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-weight: 400;
}

.category-btn:hover {
  border-color: #1976d2;
  color: #1976d2;
}

.category-btn.active {
  background: #1976d2;
  color: white;
  border-color: #1976d2;
  font-weight: 500;
}

.filter-select {
  padding: 6px 8px;
  border: 1px solid #e1e8ed;
  border-radius: 4px;
  font-size: 13px;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.reset-btn {
  padding: 6px 12px;
  background: #ffffff;
  color: #1976d2;
  border: 1px solid #1976d2;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.reset-btn:hover {
  background: #1976d2;
  color: #ffffff;
}

/* 筛选结果统计 */
.filter-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 8px 16px;
  background: #e8f4fd;
  border-radius: 4px;
  font-size: 14px;
  color: #1976d2;
}

/* 域名展示区域 */
.domains-section {
  margin-bottom: 20px;
}

/* 网格布局 */
.domains-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

/* 卡片布局 */
.domains-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin: 20px 0;
}

.page-btn {
  padding: 6px 12px;
  border: 1px solid #e1e8ed;
  background: white;
  color: #5a6c7d;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.page-btn:hover,
.page-btn.active {
  background: #1976d2;
  color: white;
  border-color: #1976d2;
}

/* 底部样式 */
.portfolio-footer {
  padding: 12px 0;
  border-top: 1px solid #e1e8ed;
  margin-top: 20px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
}

.footer-navigation {
  flex-shrink: 0;
}

.footer-nav {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.footer-nav-link {
  color: #5a6c7d;
  text-decoration: none;
  font-weight: 400;
  padding: 3px 8px;
  border-radius: 3px;
  transition: all 0.3s ease;
  font-size: 0.8rem;
  white-space: nowrap;
}

.footer-nav-link:hover {
  color: #1976d2;
  background-color: #f5f5f5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .portfolio-title {
    font-size: 1.8rem;
  }
  
  .portfolio-filters {
    padding: 12px;
  }
  
  .filter-row {
    gap: 10px;
  }
  
  .filter-row-main {
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 10px;
    padding-bottom: 10px;
  }
  
  .filter-row-advanced {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    min-width: auto;
    max-width: none;
  }
  
  .sort-box {
    min-width: auto;
  }
  
  .filter-group {
    min-width: auto;
  }
   
  .filter-group-category {
    min-width: auto;
  }
  
  .category-buttons {
    gap: 4px;
  }
  
  .category-btn {
    font-size: 12px;
    padding: 2px 5px;
  }
  
  .filter-label {
    font-size: 11px;
  }
  
  .domains-grid,
  .domains-cards {
    grid-template-columns: 1fr;
  }
  
  .footer-nav {
    gap: 8px;
  }
}

/* 平板端优化 */
@media (min-width: 769px) and (max-width: 1023px) {
  .portfolio-title {
    margin-bottom: 0;
  }
  
  .filter-row-advanced {
    justify-content: space-between;
  }
  
  .filter-group {
    flex: 1;
    min-width: 100px;
  }
}

/* 桌面端优化 - 水平布局 */
@media (min-width: 1024px) {
  .portfolio-header {
    padding: 16px 0;
  }
  
  .portfolio-title {
    margin-bottom: 0;
  }
  
  .portfolio-filters {
    padding: 20px;
  }
  
  .filter-row-main {
    justify-content: space-between;
  }
  
  .search-box {
    max-width: 500px;
  }
  
  .sort-box {
    min-width: 160px;
  }
}

/* 超大屏幕优化 */
@media (min-width: 1440px) {
  .portfolio-container {
    max-width: 1400px;
  }
}
</style> 