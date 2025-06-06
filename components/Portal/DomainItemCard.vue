# 卡片式域名展示组件

<template>
  <div class="domain-item-card">
    <div class="card-header">
      <div class="domain-name-section">
        <h3 class="domain-name">{{ domain.name }}</h3>
        <span v-if="domain.category" class="category-badge">{{ domain.category }}</span>
      </div>
      <div v-if="domain.salePrice && portfolio.showPrice" class="price-badge">
        ¥{{ formatPrice(domain.salePrice) }}
      </div>
    </div>
    
    <div class="card-body">
      <p v-if="domain.description && portfolio.showDescription" class="domain-description">
        {{ domain.description }}
      </p>
      
      <div class="domain-info-grid">
        <div v-if="domain.registrar" class="info-item">
          <span class="info-label">注册商</span>
          <span class="info-value">{{ domain.registrar }}</span>
        </div>
        <div v-if="domain.registrationDate" class="info-item">
          <span class="info-label">注册</span>
          <span class="info-value">{{ formatDate(domain.registrationDate) }}</span>
        </div>
        <div v-if="domain.expirationDate" class="info-item">
          <span class="info-label">到期</span>
          <span class="info-value">{{ formatDate(domain.expirationDate) }}</span>
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
    
    <div class="card-footer">
      <button @click="handleInquiry" class="inquiry-btn">
        <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
        </svg>
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
.domain-item-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.domain-item-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

.card-header {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.domain-name-section {
  flex: 1;
}

.domain-name {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0 0 8px 0;
  cursor: pointer;
  word-break: break-all;
  line-height: 1.3;
}

.domain-name:hover {
  text-decoration: underline;
}

.category-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
}

.price-badge {
  background: rgba(255, 255, 255, 0.95);
  color: #e74c3c;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 1.1rem;
  font-weight: bold;
  white-space: nowrap;
}

.card-body {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.domain-description {
  color: #5a6c7d;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.domain-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 0.75rem;
  color: #6c757d;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 0.875rem;
  color: #2c3e50;
  font-weight: 500;
}

.domain-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto;
}

.tag {
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  color: #1976d2;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid rgba(25, 118, 210, 0.1);
}

.card-footer {
  padding: 20px;
  border-top: 1px solid #f1f3f4;
}

.inquiry-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.inquiry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.btn-icon {
  width: 18px;
  height: 18px;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .price-badge {
    align-self: flex-start;
  }

  .domain-info-grid {
    grid-template-columns: 1fr;
  }
}
</style> 