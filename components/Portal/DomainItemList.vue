# 列表式域名展示组件

<template>
  <div class="domain-item-list">
    <div class="domain-content">
      <div class="domain-info">
        <h3 class="domain-name">{{ domain.name }}</h3>
        <p v-if="domain.description && portfolio.showDescription" class="domain-description">
          {{ domain.description }}
        </p>
        <div class="domain-meta">
          <span v-if="domain.category" class="meta-item category">
            分类：{{ domain.category }}
          </span>
          <span v-if="domain.registrar" class="meta-item registrar">
            注册商：{{ domain.registrar }}
          </span>
          <span v-if="domain.expirationDate" class="meta-item expiry">
            到期：{{ formatDate(domain.expirationDate) }}
          </span>
        </div>
        <div v-if="domain.tags?.length && portfolio.showTags" class="domain-tags">
          <span 
            v-for="tag in domain.tags" 
            :key="tag.name" 
            class="tag"
          >
            {{ tag.name }}
          </span>
        </div>
      </div>
      <div class="domain-actions">
        <div v-if="domain.salePrice && portfolio.showPrice" class="price-section">
          <span class="price">¥{{ formatPrice(domain.salePrice) }}</span>
        </div>
        <button @click="handleInquiry" class="inquiry-btn">
          询价购买
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  domain: {
    type: Object,
    required: true
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

const handleInquiry = () => {
  showInquiry(props.domain)
}
</script>

<style scoped>
.domain-item-list {
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  background: white;
  transition: all 0.3s ease;
}

.domain-item-list:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.domain-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.domain-info {
  flex: 1;
}

.domain-name {
  font-size: 1.25rem;
  font-weight: bold;
  color: #2c3e50;
  margin: 0 0 8px 0;
  cursor: pointer;
}

.domain-name:hover {
  color: #1976d2;
}

.domain-description {
  color: #5a6c7d;
  margin: 8px 0;
  line-height: 1.5;
}

.domain-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 12px 0;
}

.meta-item {
  font-size: 0.875rem;
  color: #6c757d;
}

.domain-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
}

.domain-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  min-width: 120px;
}

.price-section {
  text-align: right;
}

.price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #e74c3c;
}

.inquiry-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.inquiry-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .domain-content {
    flex-direction: column;
    align-items: stretch;
  }

  .domain-actions {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    min-width: auto;
  }

  .price-section {
    text-align: left;
  }
}
</style> 