# 表格式域名展示组件

<template>
  <div class="domain-table-view">
    <div class="table-container">
      <table class="domains-table">
        <thead>
          <tr>
            <th class="domain-column">域名</th>
            <th v-if="portfolio.showPrice" class="price-column">价格</th>
            <th class="category-column">分类</th>
            <th class="registrar-column">注册商</th>
            <th class="expiry-column">到期时间</th>
            <th v-if="portfolio.showTags" class="tags-column">标签</th>
            <th class="action-column">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="domain in domains" 
            :key="domain.id" 
            class="domain-row"
          >
            <td class="domain-cell">
              <div class="domain-info">
                <span class="domain-name">{{ domain.name }}</span>
                <p v-if="domain.description && portfolio.showDescription" class="domain-description">
                  {{ domain.description }}
                </p>
              </div>
            </td>
            <td v-if="portfolio.showPrice" class="price-cell">
              <span v-if="domain.salePrice" class="price">¥{{ formatPrice(domain.salePrice) }}</span>
              <span v-else class="no-price">-</span>
            </td>
            <td class="category-cell">
              <span v-if="domain.category" class="category-badge">{{ domain.category }}</span>
              <span v-else class="no-category">-</span>
            </td>
            <td class="registrar-cell">
              <span v-if="domain.registrar">{{ domain.registrar }}</span>
              <span v-else>-</span>
            </td>
            <td class="expiry-cell">
              <span v-if="domain.expirationDate" class="expiry-date">
                {{ formatDate(domain.expirationDate) }}
              </span>
              <span v-else>-</span>
            </td>
            <td v-if="portfolio.showTags" class="tags-cell">
              <div v-if="domain.tags?.length" class="tags-list">
                <span 
                  v-for="tag in domain.tags.slice(0, 2)" 
                  :key="tag.name" 
                  class="tag"
                >
                  {{ tag.name }}
                </span>
                <span v-if="domain.tags.length > 2" class="more-tags">
                  +{{ domain.tags.length - 2 }}
                </span>
              </div>
              <span v-else>-</span>
            </td>
            <td class="action-cell">
              <button @click="handleInquiry(domain)" class="inquiry-btn">
                询价
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div v-if="!domains.length" class="empty-state">
      <div class="empty-icon">📋</div>
      <p class="empty-text">暂无域名数据</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  domains: {
    type: Array,
    default: () => []
  },
  portfolio: {
    type: Object,
    required: true
  }
})

const showInquiry = inject('showInquiry')

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatPrice = (price) => {
  if (!price) return '0'
  return new Intl.NumberFormat('zh-CN').format(price)
}

const handleInquiry = (domain) => {
  showInquiry(domain)
}
</script>

<style scoped>
.domain-table-view {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.table-container {
  overflow-x: auto;
}

.domains-table {
  width: 100%;
  border-collapse: collapse;
}

.domains-table th,
.domains-table td {
  padding: 16px 12px;
  text-align: left;
  border-bottom: 1px solid #f1f3f4;
}

.domains-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.875rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.domain-row {
  transition: background-color 0.2s ease;
}

.domain-row:hover {
  background: #f8f9fa;
}

.domain-row:last-child td {
  border-bottom: none;
}

/* 列宽设置 */
.domain-column {
  width: 25%;
  min-width: 200px;
}

.price-column {
  width: 12%;
  min-width: 100px;
}

.category-column {
  width: 15%;
  min-width: 120px;
}

.registrar-column {
  width: 15%;
  min-width: 120px;
}

.expiry-column {
  width: 15%;
  min-width: 120px;
}

.tags-column {
  width: 18%;
  min-width: 150px;
}

.action-column {
  width: 10%;
  min-width: 80px;
}

/* 域名信息 */
.domain-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.domain-name {
  font-weight: 600;
  color: #2c3e50;
  cursor: pointer;
  word-break: break-all;
}

.domain-name:hover {
  color: #1976d2;
  text-decoration: underline;
}

.domain-description {
  font-size: 0.8rem;
  color: #6c757d;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

/* 价格 */
.price {
  font-weight: 600;
  color: #e74c3c;
  font-size: 1rem;
}

.no-price {
  color: #6c757d;
}

/* 分类徽章 */
.category-badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.no-category {
  color: #6c757d;
}

/* 到期时间 */
.expiry-date {
  color: #2c3e50;
  font-size: 0.875rem;
}

/* 标签 */
.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.tag {
  background: #f1f3f4;
  color: #5a6c7d;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
  white-space: nowrap;
}

.more-tags {
  color: #6c757d;
  font-size: 0.7rem;
  font-weight: 500;
}

/* 操作按钮 */
.inquiry-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.inquiry-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 1.1rem;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .domains-table th,
  .domains-table td {
    padding: 12px 8px;
  }
  
  .domain-column {
    min-width: 180px;
  }
  
  .category-column,
  .registrar-column,
  .expiry-column {
    min-width: 100px;
  }
  
  .tags-column {
    min-width: 120px;
  }
}

@media (max-width: 768px) {
  .domains-table th,
  .domains-table td {
    padding: 10px 6px;
    font-size: 0.875rem;
  }
  
  .domain-description {
    display: none;
  }
  
  .tags-list {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    margin: 0;
    border-radius: 0;
  }
  
  .domains-table {
    min-width: 700px; /* 确保有滚动空间 */
  }
  
  .domains-table th,
  .domains-table td {
    padding: 8px 4px;
    font-size: 0.8rem;
  }
  
  /* 固定域名列 */
  .domain-column,
  .domain-cell {
    position: sticky;
    left: 0;
    background: white;
    box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
    z-index: 5;
    min-width: 150px;
    max-width: 150px;
  }
  
  .domain-column {
    background: #f8f9fa;
    z-index: 6;
  }
  
  .category-column,
  .registrar-column,
  .expiry-column,
  .tags-column {
    min-width: 80px;
  }
  
  .inquiry-btn {
    padding: 4px 8px;
    font-size: 0.7rem;
  }
}
</style> 