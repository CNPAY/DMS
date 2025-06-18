<template>
  <div class="portfolio-view" :class="[`layout-${portfolio.layoutTemplate}`, portfolioTextThemeClass]" :style="portfolioBackgroundStyle">
    <!-- 背景遮罩层 -->
    <div v-if="portfolio.backgroundUrl && portfolio.backgroundOverlay" class="background-overlay"></div>
    <div class="portfolio-container">
      <!-- 头部信息 -->
      <div class="portfolio-header">
        <div class="header-content">
          <div class="header-main">
            <!-- Logo在左侧 -->
            <div v-if="portfolio.logoUrl" class="portfolio-logo">
              <img :src="portfolio.logoUrl" :alt="portfolio.name" class="logo-image" />
            </div>
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
      <div class="portfolio-filters" :class="{ collapsed: !searchAreaExpanded }">
        <!-- 折叠状态的搜索按钮 -->
        <div v-if="!searchAreaExpanded" class="search-toggle-collapsed" @click="toggleSearchArea">
          <div class="search-icon">⚙</div>
          <span class="search-text">筛选</span>
        </div>
        
        <!-- 展开状态的搜索区域 -->
        <div v-else class="search-area-expanded">
          
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
          <div class="filter-row filter-right">
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
          <!-- 布局切换按钮组 -->
          <div class="layout-switcher">
            <div class="layout-label">布局</div>
            <div class="layout-buttons">
              <button
                v-for="option in layoutOptions"
                :key="option.value"
                :class="{ active: currentLayout === option.value }"
                @click="switchLayout(option.value)"
                class="layout-btn"
                :title="option.label"
              >
                <span class="layout-icon">{{ option.icon }}</span>
              </button>
            </div>
          </div>
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

          <div class="filter-buttons">
            <button @click="resetFilters" class="reset-btn">
              重置筛选
            </button>
            
            <!-- 收起筛选按钮 -->
            <button @click="toggleSearchArea" class="collapse-btn">
              <span class="collapse-icon">▲</span>
            </button>
          </div>
        </div>
        </div>
      </div>

      <!-- 筛选结果统计 -->
      <div v-if="hasActiveFilters" class="filter-stats">
        <span>找到 {{ filteredDomainsCount }} 个域名</span>
        <span>{{ activeFiltersText }}</span>
      </div>

      <!-- 域名展示区域 -->
      <div class="domains-section">
        <!-- 分组模式显示 -->
        <template v-if="portfolio.enableGrouping">
          <div v-for="group in groupedDomains" :key="group.categoryId" :id="`group-${group.categoryId}`" class="domain-group">
            <div class="group-header">
              <h3 class="group-title">{{ group.categoryName }}</h3>
              <span class="group-count">{{ group.domains.length }} 个域名</span>
            </div>
            
            <!-- 列表布局 -->
            <div v-if="currentLayout === 'list'" class="domains-list">
              <PortalDomainItemList 
                v-for="domain in group.domains" 
                :key="domain.id" 
                :domain="domain" 
                :portfolio="portfolio"
              />
            </div>

            <!-- 网格布局 -->
            <div v-else-if="currentLayout === 'grid'" class="domains-grid">
              <PortalDomainItemGrid 
                v-for="domain in group.domains" 
                :key="domain.id" 
                :domain="domain" 
                :portfolio="portfolio"
              />
            </div>

            <!-- 表格布局 -->
            <div v-else-if="currentLayout === 'table'" class="domains-table">
              <PortalDomainTableView :domains="group.domains" :portfolio="portfolio" />
            </div>

            <!-- 卡片布局 -->
            <div v-else-if="currentLayout === 'card'" class="domains-cards">
              <PortalDomainItemCard 
                v-for="domain in group.domains" 
                :key="domain.id" 
                :domain="domain" 
                :portfolio="portfolio"
              />
            </div>
          </div>
        </template>

        <!-- 非分组模式显示 -->
        <template v-else>
          <!-- 列表布局 -->
          <div v-if="currentLayout === 'list'" class="domains-list">
            <PortalDomainItemList 
              v-for="domain in filteredDomains" 
              :key="domain.id" 
              :domain="domain" 
              :portfolio="portfolio"
            />
          </div>

          <!-- 网格布局 -->
          <div v-else-if="currentLayout === 'grid'" class="domains-grid">
            <PortalDomainItemGrid 
              v-for="domain in filteredDomains" 
              :key="domain.id" 
              :domain="domain" 
              :portfolio="portfolio"
            />
          </div>

          <!-- 表格布局 -->
          <div v-else-if="currentLayout === 'table'" class="domains-table">
            <PortalDomainTableView :domains="filteredDomains" :portfolio="portfolio" />
          </div>

          <!-- 卡片布局 -->
          <div v-else-if="currentLayout === 'card'" class="domains-cards">
            <PortalDomainItemCard 
              v-for="domain in filteredDomains" 
              :key="domain.id" 
              :domain="domain" 
              :portfolio="portfolio"
            />
          </div>
        </template>
      </div>

      <!-- 分页（非瀑布流且非分组模式） -->
      <div v-if="!portfolio.enableWaterfall && !portfolio.enableGrouping && totalPages > 1" class="pagination">
        <!-- 上一页按钮 -->
        <button 
          :disabled="currentPage === 1"
          @click="handlePageChange(currentPage - 1)"
          class="page-btn prev-btn"
          :class="{ disabled: currentPage === 1 }"
        >
          <span class="pagination-icon">‹</span>
          <span class="pagination-text">上一页</span>
        </button>
        
        <!-- 页码按钮 -->
        <template v-for="page in visiblePages" :key="page">
          <span v-if="page === '...'" class="page-ellipsis">...</span>
          <button 
            v-else
            :class="{ active: page === currentPage }"
            @click="handlePageChange(page)"
            class="page-btn"
          >
            {{ page }}
          </button>
        </template>
        
        <!-- 下一页按钮 -->
        <button 
          :disabled="currentPage === totalPages"
          @click="handlePageChange(currentPage + 1)"
          class="page-btn next-btn"
          :class="{ disabled: currentPage === totalPages }"
        >
          <span class="pagination-text">下一页</span>
          <span class="pagination-icon">›</span>
        </button>
      </div>

      <!-- 瀑布流加载提示 -->
      <div v-if="portfolio.enableWaterfall" class="waterfall-loading">
        <div v-if="isLoadingMore" class="loading-indicator">
          <div class="loading-spinner"></div>
          <span class="loading-text">加载中...</span>
        </div>
        <div v-else-if="hasMore" class="load-more-tip">
          <span class="tip-icon"></span>
          <span class="tip-text">滚动加载更多</span>
        </div>
        <div v-else class="no-more-tip">
          <span class="complete-icon"></span>
          <span class="complete-text">已加载全部</span>
        </div>
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
      <PortalInquiryModal v-model="showInquiry" :domain="selectedDomain" :portfolio="portfolio" />
    </div>
  </div>
</template>

<script setup>
import { Loading } from '@element-plus/icons-vue'
import { nextTick } from 'vue'


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
const headerPages = computed(() => props.portfolio.headerPagesData || [])
const footerPages = computed(() => props.portfolio.footerPagesData || [])

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

// 搜索区域展开状态 - 根据米表配置初始化
const searchAreaExpanded = ref(props.portfolio.enableSearchArea !== false)

// 计算背景样式
const portfolioBackgroundStyle = computed(() => {
  const styles = {}
  
  if (props.portfolio.backgroundUrl) {
    styles.backgroundImage = `url('${props.portfolio.backgroundUrl}')`
    styles.backgroundSize = 'cover'
    styles.backgroundPosition = 'center'
    styles.backgroundRepeat = 'no-repeat'
    styles.backgroundAttachment = 'fixed'
  }
  
  return styles
})

// 计算文字颜色主题类
const portfolioTextThemeClass = computed(() => {
  const theme = props.portfolio.textTheme || 'auto'
  const hasBackground = !!props.portfolio.backgroundUrl
  const hasOverlay = props.portfolio.backgroundOverlay
  
  // 调试日志已移除
  
  return {
    'text-theme-auto': theme === 'auto',
    'text-theme-light': theme === 'light',
    'text-theme-dark': theme === 'dark',
    'has-background': hasBackground,
    'has-overlay': hasOverlay
  }
})

// 瀑布流相关状态
const isLoadingMore = ref(false)
const hasMore = ref(true)
const waterfallPage = ref(1)

// 添加布局模式状态
const currentLayout = ref(props.portfolio.layoutTemplate || 'grid')

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
  // console.log('从域名中提取的标签:', tags.value)
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
  
  // 在分组模式下，滚动到对应的位置
  if (props.portfolio.enableGrouping) {
    // 使用 nextTick 确保DOM更新完成后再滚动
    nextTick(() => {
      if (categoryId) {
        // 滚动到指定分组
        const targetElement = document.getElementById(`group-${categoryId}`)
        if (targetElement) {
          // 获取筛选区域的高度，用于计算偏移
          const filtersElement = document.querySelector('.portfolio-filters')
          const offset = filtersElement ? filtersElement.offsetHeight + 20 : 100
          
          // 计算目标位置
          const targetPosition = targetElement.offsetTop - offset
          
          // 平滑滚动到目标位置
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          })
        }
      } else {
        // 点击"全部分类"时，滚动到域名区域开始位置
        const domainsSection = document.querySelector('.domains-section')
        if (domainsSection) {
          const filtersElement = document.querySelector('.portfolio-filters')
          const offset = filtersElement ? filtersElement.offsetHeight + 20 : 100
          const targetPosition = domainsSection.offsetTop - offset
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          })
        }
      }
    })
  }
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
  resetWaterfallState()
}

// 布局模式选项
const layoutOptions = [
  { value: 'list', label: '列表', icon: '☰' },
  { value: 'grid', label: '网格', icon: '⊞' },
  { value: 'table', label: '表格', icon: '≣' },
  { value: 'card', label: '卡片', icon: '⊡' }
]

// 切换布局模式
const switchLayout = (layout) => {
  currentLayout.value = layout
  currentPage.value = 1 // 切换布局时重置到第一页
}

// 瀑布流滚动监听器
const handleScroll = throttle(() => {
  if (!props.portfolio.enableWaterfall || isLoadingMore.value || !hasMore.value) {
    return
  }

  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight

  // 当滚动到距离底部200px时加载更多
  if (scrollTop + windowHeight >= documentHeight - 200) {
    loadMoreDomains()
  }
}, 200) // 节流200ms

// 加载更多域名
const loadMoreDomains = async () => {
  if (isLoadingMore.value || !hasMore.value) {
    return
  }

  isLoadingMore.value = true
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  waterfallPage.value += 1
  isLoadingMore.value = false
}

// 简单的节流函数
function throttle(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 重置筛选条件时重置瀑布流状态
const resetWaterfallState = () => {
  waterfallPage.value = 1
  hasMore.value = true
}

// 组件挂载时加载静态页面
onMounted(() => {
  loadFilterOptions()
  
  // 添加滚动监听器（仅在瀑布流模式下）
  if (props.portfolio.enableWaterfall) {
    window.addEventListener('scroll', handleScroll)
  }
})

// 组件卸载时移除滚动监听器
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// 监听域名数据变化，重新提取后缀和标签
watch(() => props.domains, () => {
  extractSuffixes()
  extractTags()
}, { immediate: true })

// 监听 portfolio 变化，更新布局模式
watch(() => props.portfolio.layoutTemplate, (newLayout) => {
  if (newLayout) {
    currentLayout.value = newLayout
  }
}, { immediate: true })

// 监听筛选条件变化，重置瀑布流状态
watch([searchTerm, selectedCategory, selectedTag, selectedLength, selectedSuffix, selectedPriceRange, sortBy], () => {
  if (props.portfolio.enableWaterfall) {
    resetWaterfallState()
  }
})

// 获取过滤和排序后的所有域名
const getFilteredAndSortedDomains = () => {
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

  return filtered
}

// 计算属性
const filteredDomains = computed(() => {
  const filtered = getFilteredAndSortedDomains()
  
  if (props.portfolio.enableWaterfall) {
    // 瀑布流模式：显示从第1页到当前瀑布流页的所有数据
    const end = waterfallPage.value * pageSize
    const result = filtered.slice(0, end)
    
    // 更新是否还有更多数据
    hasMore.value = filtered.length > end
    
    return result
  } else {
    // 普通分页模式
    const start = (currentPage.value - 1) * pageSize
    const end = start + pageSize
    return filtered.slice(start, end)
  }
})

const totalPages = computed(() => {
  const filtered = getFilteredAndSortedDomains()
  return Math.ceil(filtered.length / pageSize)
})

// 计算可见的页码数组（智能分页显示）
const visiblePages = computed(() => {
  const current = currentPage.value
  const total = totalPages.value
  const pages = []
  
  if (total <= 7) {
    // 少于7页，显示全部
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // 多于7页，智能显示
    if (current <= 4) {
      // 当前页在前面
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      // 当前页在后面
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // 当前页在中间
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
})

// 筛选结果计数
const filteredDomainsCount = computed(() => {
  const filtered = getFilteredAndSortedDomains()
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

// 分组域名数据
const groupedDomains = computed(() => {
  if (!props.portfolio.enableGrouping) {
    return []
  }
  
  // 获取筛选后的域名，但排除分类筛选（因为要分组显示）
  let filtered = props.domains
  
  // 关键词搜索
  if (searchTerm.value) {
    filtered = filtered.filter(domain => 
      domain.name.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
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
        case '1-3': return length >= 1 && length <= 3
        case '4-6': return length >= 4 && length <= 6
        case '7-10': return length >= 7 && length <= 10
        case '11+': return length >= 11
        default: return true
      }
    })
  }

  // 后缀筛选
  if (selectedSuffix.value) {
    filtered = filtered.filter(domain => domain.name.endsWith('.' + selectedSuffix.value))
  }

  // 价格区间筛选
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

  // 按分类分组
  const groups = new Map()
  
  filtered.forEach(domain => {
    const categoryId = domain.categoryId || 0 // 未分类的域名
    if (!groups.has(categoryId)) {
      // 找到分类名称
      let categoryName = '未分类'
      if (categoryId > 0) {
        const category = categories.value.find(c => c.id === categoryId)
        categoryName = category ? category.name : `分类 ${categoryId}`
      }
      
      groups.set(categoryId, {
        categoryId,
        categoryName,
        domains: []
      })
    }
    groups.get(categoryId).domains.push(domain)
  })

  // 排序分组内的域名
  groups.forEach(group => {
    group.domains.sort((a, b) => {
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
  })

  // 转换为数组并按分类名称排序
  const groupsArray = Array.from(groups.values())
  groupsArray.sort((a, b) => {
    // 未分类的放在最后
    if (a.categoryId === 0) return 1
    if (b.categoryId === 0) return -1
    return a.categoryName.localeCompare(b.categoryName)
  })

  return groupsArray
})

// 处理分页变更
const handlePageChange = (page) => {
  currentPage.value = page
  
  // 滚动到域名展示区域顶部
  nextTick(() => {
    const domainsSection = document.querySelector('.domains-section')
    if (domainsSection) {
      domainsSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  })
}

// 切换搜索区域展开/折叠状态
const toggleSearchArea = () => {
  searchAreaExpanded.value = !searchAreaExpanded.value
}

// 提供事件给子组件
provide('showInquiry', (domain) => {
  selectedDomain.value = domain
  showInquiry.value = true
})
</script>

<style scoped lang="scss">
.portfolio-view {
  min-height: 100vh;
}

.portfolio-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 背景遮罩层 */
.background-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom, 
    rgba(0, 0, 0, 0.4) 0%, 
    rgba(0, 0, 0, 0.3) 50%, 
    rgba(0, 0, 0, 0.5) 100%
  );
  z-index: 1;
  pointer-events: none;
}

/* 确保内容在遮罩层之上 */
.portfolio-view.has-overlay .portfolio-container {
  position: relative;
  z-index: 2;
}

/* 文字颜色主题样式 */
.portfolio-view.text-theme-light {
  color: #ffffff;
}

.portfolio-view.text-theme-light .portfolio-title {
  color: #ffffff;
}

.portfolio-view.text-theme-light .header-info {
  background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 50%, #c7d2fe 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.portfolio-view.text-theme-light .nav-link {
  color: #e0e0e0;
}

.portfolio-view.text-theme-light .nav-link:hover {
  color: #ffffff;
}

.portfolio-view.text-theme-dark {
  color: #333333;
}

.portfolio-view.text-theme-dark .portfolio-title {
  color: #1a1a1a !important;
}

.portfolio-view.text-theme-dark .header-info {
  background: linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}



/* 自动适应主题 - 有背景图时添加文字阴影增强可读性 */
.portfolio-view.text-theme-auto.has-background .portfolio-title {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  color: #ffffff;
}

/* 确保dark主题优先级最高 */
.portfolio-view.text-theme-dark .portfolio-title {
  color: #1a1a1a !important;
  text-shadow: none !important;
}

.portfolio-view.text-theme-auto.has-background .header-info {
  background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 50%, #e2e8f0 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.8));
}

.portfolio-view.text-theme-auto.has-background .nav-link {
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  color: #e0e0e0;
}

.portfolio-view.text-theme-auto.has-background .nav-link:hover {
  color: #ffffff;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.9);
}

/* 有遮罩时调整文字对比度 */
// .portfolio-view.has-overlay .portfolio-filters {
//   background: rgba(248, 249, 250, 0.95);
//   backdrop-filter: blur(10px);
// }

// .portfolio-view.text-theme-light .portfolio-filters {
//   background: rgba(0, 0, 0, 0.7);
//   backdrop-filter: blur(10px);
//   color: #ffffff;
// }

// .portfolio-view.text-theme-light .filter-label {
//   color: #e0e0e0;
// }

// .portfolio-view.text-theme-light .search-input,
// .portfolio-view.text-theme-light .sort-select,
// .portfolio-view.text-theme-light .filter-select {
//   background: rgba(255, 255, 255, 0.1);
//   border-color: rgba(255, 255, 255, 0.3);
//   color: #ffffff;
// }

// .portfolio-view.text-theme-light .search-input::placeholder {
//   color: #cccccc;
// }

/* 头部样式 */
.portfolio-header {
  /* margin-bottom: 16px; */
  padding: 12px 0;
}
.header-info-section{
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  overflow: hidden;
}

.header-info-section .portfolio-title {
  text-align: left;
}

.header-info-section .header-info {
  text-align: left;
}
.header-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.portfolio-title {
  font-size: 2rem;
  font-weight: bold;
  margin: 0 0 2px 0;
  color: #2c3e50;
  line-height: 1.2;
}

.header-info {
  font-size: 0.8rem;
  line-height: 1.5;
  margin: 0;
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 50%, #f093fb 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: 'Georgia', 'Times New Roman', '宋体', serif;
  font-weight: 400;
  font-style: italic;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
}

.header-info::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  50%, 100% {
    left: 100%;
  }
}
.header-main{
  display: flex;
  flex-direction: row;
  gap: 16px;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
}

/* Logo样式 */
.portfolio-logo {
  flex-shrink: 0;
}

.logo-image {
  max-height: 80px;
  max-width: 200px;
  width: auto;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
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
  color: #64748b;
  text-decoration: none;
  font-weight: 500;
  padding: 4px 0;
  margin: 0 12px;
  font-size: 0.9rem;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: 2px solid transparent;
}

.nav-link::before {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--theme-primary), var(--theme-secondary));
  transition: width 0.3s ease;
}

.nav-link::after {
  content: '';
  position: absolute;
  top: 50%;
  left: -8px;
  width: 4px;
  height: 4px;
  background: var(--theme-primary);
  border-radius: 50%;
  transform: translateY(-50%) scale(0);
  transition: transform 0.3s ease;
  opacity: 0;
}

.nav-link:hover {
  color: var(--theme-primary);
  text-shadow: 0 0 8px rgba(var(--theme-primary), 0.3);

  
}

.nav-link:hover::before {
  width: 100%;
}

.nav-link:hover::after {
  transform: translateY(-50%) scale(1);
  opacity: 1;
}

/* 筛选样式 - 专业版 */
.portfolio-filters {
  background: white;
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
  justify-content: space-between;
}
.filter-right{
  display: flex;
  flex-direction: row;
  gap: 12px;
  justify-content: space-between;
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
  border-color: var(--theme-primary);
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

/* 布局切换器样式 */
.layout-switcher {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 140px;
}

.layout-label {
  font-size: 12px;
  font-weight: 500;
  color: #5a6c7d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.layout-buttons {
  display: flex;
  gap: 2px;
  border: 1px solid #e1e8ed;
  border-radius: 4px;
  background: white;
  padding: 2px;
}

.layout-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #5a6c7d;
}

.layout-btn:hover {
  background: #f5f5f5;
  color: var(--theme-primary);
}
  
.layout-btn.active {
  background: var(--theme-primary);
  color: var(--theme-text-active);
}

.layout-icon {
  font-size: 20px;
  line-height: 1;
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
  border-color: var(--theme-text-hover);
  color: var(--theme-primary);
}

.category-btn.active {
  background: var(--theme-primary);
  color: var(--theme-text-active);
  border-color: var(--theme-text-active);
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
  color: var(--theme-primary);
  border: 1px solid var(--theme-primary);
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.reset-btn:hover {
  background: var(--theme-primary);
  color: #ffffff;
}

/* 筛选结果统计 */
.filter-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  background: linear-gradient(135deg, var(--theme-tertiary) 0%, #f3e5f5 100%);
  color: color-mix(in srgb, var(--theme-primary) 90%, white 10%);
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

/* 分组样式 */
.domain-group {
  margin-bottom: 40px;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  font-weight: 600;
}

.group-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.group-count {
  font-size: 0.9rem;
  color: #666;
  background: #f8f9fa;
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid #e1e8ed;
}

/* 瀑布流加载样式 - 小巧版 */
.waterfall-loading {
  display: flex;
  justify-content: center;
}

.loading-indicator,
.load-more-tip,
.no-more-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(8px);
  font-size: 14px;
  transition: all 0.3s ease;
}

.loading-indicator:hover,
.load-more-tip:hover,
.no-more-tip:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

/* 加载动画 */
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 文本样式 */
.loading-text {
  color: #3b82f6;
  font-weight: 500;
}

.tip-text {
  color: #6b7280;
  font-weight: 500;
}

.complete-text {
  color: #059669;
  font-weight: 500;
}

/* 图标样式 */
.tip-icon,
.complete-icon {
  font-size: 16px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

/* 不同状态的主题色 */
.loading-indicator {
  background: rgba(59, 130, 246, 0.05);
  border-color: rgba(59, 130, 246, 0.1);
}

.load-more-tip {
  background: rgba(107, 114, 128, 0.05);
  border-color: rgba(107, 114, 128, 0.1);
}

.no-more-tip {
  background: rgba(5, 150, 105, 0.05);
  border-color: rgba(5, 150, 105, 0.1);
}

/* 响应式优化 */
@media (max-width: 768px) {
  .waterfall-loading {
    padding: 12px 0;
    margin: 12px 0;
  }
  
  .loading-indicator,
  .load-more-tip,
  .no-more-tip {
    padding: 6px 12px;
    font-size: 13px;
    gap: 6px;
  }
  
  .loading-spinner {
    width: 14px;
    height: 14px;
  }
  
  .tip-icon,
  .complete-icon {
    font-size: 14px;
  }
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin: 20px 0;
  flex-wrap: wrap;
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
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 36px;
}

.page-btn:hover{
  background: var(--theme-primary);
  color: var(--theme-text-active);
  border-color: var(--theme-text-active);
}
.page-btn.active {
  background: var(--theme-primary);
  color: var(--theme-text-active);
  border-color: var(--theme-text-active);
}

.page-btn.disabled {
  background: #f5f5f5;
  color: #ccc;
  cursor: not-allowed;
  border-color: #e1e8ed;
}

.page-btn.disabled:hover {
  background: #f5f5f5;
  color: #ccc;
  border-color: #e1e8ed;
}

.prev-btn,
.next-btn {
  font-weight: 500;
}

.pagination-icon {
  font-size: 16px;
  font-weight: bold;
}

.pagination-text {
  font-size: 0.85rem;
}

.page-ellipsis {
  padding: 6px 8px;
  color: #999;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  min-height: 36px;
}

/* 移动端分页优化 */
@media (max-width: 480px) {
  .pagination {
    gap: 4px;
    margin: 15px 0;
  }
  
  .page-btn {
    padding: 5px 8px;
    font-size: 0.8rem;
    min-height: 32px;
  }
  
  .pagination-text {
    display: none;
  }
  
  .prev-btn::before {
    content: '上一页';
    font-size: 0.75rem;
  }
  
  .next-btn::after {
    content: '下一页';
    font-size: 0.75rem;
  }
  
  .page-ellipsis {
    min-height: 32px;
    padding: 5px 6px;
  }
}

/* 搜索区域折叠/展开样式 */
.portfolio-filters.collapsed {
  padding: 0;
  background: none;
  border: none;
  box-shadow: none;
  margin: 5px 0;
}

.search-toggle-collapsed {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 3px 6px;
  background: var(--theme-primary);
  color: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 8px auto;
  font-size: 12px;
  border: 1px solid var(--theme-primary);
  max-width: fit-content;
}

.search-toggle-collapsed:hover {
  background: #5a67d8;
  border-color: #5a67d8;
  transform: scale(1.02);
}

.search-icon {
  font-size: 11px;
  opacity: 0.8;
  transition: all 0.2s ease;
}

.search-toggle-collapsed:hover .search-icon {
  opacity: 1;
  transform: rotate(90deg);
}

.search-text {
  font-size: 12px;
  font-weight: 400;
  opacity: 0.9;
}

.search-area-expanded {
  position: relative;
}

.collapse-btn {
  padding: 8px 12px;
  background: rgba(102, 126, 234, 0.1);
  color: var(--theme-primary);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.collapse-btn:hover {
  background: rgba(102, 126, 234, 0.15);
  color: #5a67d8;
  transform: translateY(-1px);
}

.collapse-btn .collapse-icon {
  font-size: 10px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.filter-buttons .reset-btn,
.filter-buttons .collapse-btn {
  height: 36px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 展开状态下的筛选区域动画 */
.search-area-expanded .filter-row {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 移动端搜索切换优化 */
@media (max-width: 768px) {
  .search-toggle-collapsed {
    padding: 5px 10px;
    gap: 3px;
    font-size: 11px;
    margin: 6px auto;
  }
  
  .search-icon {
    font-size: 10px;
  }
  
  .search-text {
    font-size: 11px;
  }
  
  .collapse-btn {
    padding: 6px 10px;
    font-size: 11px;
  }
  
  .collapse-btn .collapse-icon {
    font-size: 9px;
  }
  
  /* 移动端按钮平分布局 */
  .filter-buttons {
    display: flex;
    gap: 8px;
  }
  
  .filter-buttons .reset-btn,
  .filter-buttons .collapse-btn {
    flex: 1;
    justify-content: center;
  }
  
  /* 移动端筛选条件2列布局 */
  .search-area-expanded .filter-row-advanced {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  
  .search-area-expanded .filter-group {
    margin-bottom: 0;
  }
  
  /* 分类按钮和操作按钮单独占一行 */
  .search-area-expanded .filter-group-category,
  .search-area-expanded .filter-buttons {
    grid-column: 1 / -1;
  }
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
  color: #64748b;
  text-decoration: none;
  font-weight: 500;
  padding: 2px 0;
  margin: 0 8px;
  font-size: 0.9rem;
  white-space: nowrap;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: 1px solid transparent;
}

.footer-nav-link::before {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  width: 0;
  height: 1px;
  background: linear-gradient(90deg, var(--theme-primary), var(--theme-secondary));
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.footer-nav-link::after {
  content: '';
  position: absolute; 
  top: 50%;
  right: -6px;
  width: 3px;
  height: 3px;
  background: var(--theme-primary);
  border-radius: 50%;
  transform: translateY(-50%) scale(0);
  transition: transform 0.3s ease;
  opacity: 0;
}

.footer-nav-link:hover {
  color: var(--theme-primary);
  text-shadow: 0 0 6px rgba(var(--theme-primary), 0.3);
}

.footer-nav-link:hover::before {
  width: 100%;
}

.footer-nav-link:hover::after {
  transform: translateY(-50%) scale(1);
  opacity: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .portfolio-title {
    font-size: 1.8rem;
  }
  
  .header-info {
    font-size: 1rem;
    line-height: 1.5;
  }
  
  .header-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .portfolio-logo {
    align-self: center;
  }
  
  .logo-image {
    max-height: 60px;
    max-width: 150px;
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
    justify-content: flex-start;
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

  /* 移动端布局切换器 */
  .layout-switcher {
    min-width: auto;
    justify-content: center;
    margin-top: 8px;
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
    font-size: 2.6rem;
  }
  
  .header-info {
    font-size: 1rem;
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