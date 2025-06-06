# 网格式域名展示组件

<template>
  <div class="domain-item-grid">
    <div class="domain-header">
      <h3 class="domain-name">{{ domain.name }}</h3>
      <div v-if="domain.salePrice && portfolio.showPrice" class="price">
        ¥{{ formatPrice(domain.salePrice) }}
      </div>
    </div>
    
    <div class="domain-body">
      <p v-if="domain.description && portfolio.showDescription" class="domain-description">
        {{ domain.description }}
      </p>
      
      <div class="domain-meta">
        <div v-if="domain.category" class="meta-item">
          <span class="meta-label">分类</span>
          <span class="meta-value">{{ domain.category }}</span>
        </div>
        <div v-if="domain.expirationDate" class="meta-item">
          <span class="meta-label">到期</span>
          <span class="meta-value">{{ formatDate(domain.expirationDate) }}</span>
        </div>
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
    
    <div class="domain-footer">
      <button @click="handleInquiry" class="inquiry-btn">
        询价购买
      </button>
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
.domain-item-grid {
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  background: white;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.domain-item-grid:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.domain-header {
  padding: 16px;
  border-bottom: 1px solid #f1f3f4;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.domain-name {
  font-size: 1.1rem;
  font-weight: bold;
  color: #2c3e50;
  margin: 0;
  cursor: pointer;
  word-break: break-all;
  line-height: 1.4;
}

.domain-name:hover {
  color: #1976d2;
}

.price {
  font-size: 1.1rem;
  font-weight: bold;
  color: #e74c3c;
  white-space: nowrap;
}

.domain-body {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.domain-description {
  color: #5a6c7d;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.domain-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}

.meta-label {
  color: #6c757d;
  font-weight: 500;
}

.meta-value {
  color: #2c3e50;
}

.domain-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
}

.domain-footer {
  padding: 16px;
  border-top: 1px solid #f1f3f4;
}

.inquiry-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.inquiry-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
</style> 