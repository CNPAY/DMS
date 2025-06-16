# 网格式域名展示组件

<template>
  <div class="domain-item-grid">
    <div class="domain-header">
      <h3 class="domain-name" @click="handleDomainClick">{{ domain.name }}</h3>
      <div v-if="showPrice" class="price-container">
        <div v-if="hasValidDiscount" class="discount-price">
          ¥{{ formatPrice(domain.discountPrice) }}
        </div>
        <div :class="['original-price', { 'has-discount': hasValidDiscount }]">
          ¥{{ formatPrice(domain.salePrice) }}
        </div>
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
      <button @click="handleDomainClick" class="inquiry-btn">
        <span>询价购买</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { inject, computed } from 'vue'
import { useRouter } from '#imports'

const router = useRouter()
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

// 检查日期是否过期
const isDateExpired = (date) => {
  if (!date) return false
  return new Date(date) < new Date()
}

// 判断销售价格是否有效
const hasValidSalePrice = computed(() => {
  return props.domain.salePrice && 
         !isDateExpired(props.domain.salePriceExpirationDate) &&
         !isDateExpired(props.domain.expirationDate)
})

// 判断是否显示价格
const showPrice = computed(() => {
  return props.portfolio.showPrice && hasValidSalePrice.value
})

// 判断是否有有效的折扣价
const hasValidDiscount = computed(() => {
  return showPrice.value && 
         props.domain.discountPrice && 
         !isDateExpired(props.domain.discountExpirationDate)
})

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatPrice = (price) => {
  if (!price) return '0'
  return new Intl.NumberFormat('zh-CN').format(price)
}

// 处理询价按钮点击
const handleInquiry = () => {
  showInquiry(props.domain)
}

// 处理域名点击
const handleDomainClick = () => {
  // 优先使用域名自身的点击行为配置，如果没有则使用米表的默认配置
  const clickBehavior = props.domain.clickBehavior || props.portfolio.defaultClickBehavior || 'popup'
  
  switch (clickBehavior) {
    case 'landing':
      // 跳转到域名着陆页
      router.push(`/domains/${props.domain.name}`)
      break
    case 'popup':
      // 显示询价弹窗
      showInquiry(props.domain)
      break
    case 'external':
      // 跳转到外部链接
      if (props.domain.externalUrl) {
        window.open(props.domain.externalUrl, '_blank')
      } else {
        // 如果没有设置外部链接，默认显示询价弹窗
        showInquiry(props.domain)
      }
      break
    default:
      // 默认跳转到着陆页
      router.push(`/domains/${props.domain.name}`)
  }
}
</script>

<style scoped>
.domain-item-grid {
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  background: white;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.domain-item-grid:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.domain-header {
  padding: 20px;
  border-bottom: 1px solid #f1f3f4;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.domain-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
  cursor: pointer;
  word-break: break-all;
  line-height: 1.4;
  letter-spacing: -0.02em;
}

.domain-name:hover {
  color: #4a5568;
}

.price-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.discount-price {
  color: #e53e3e;
  font-weight: 600;
  font-size: 1.25rem;
  letter-spacing: -0.02em;
}

.original-price {
  color: #e53e3e;
  font-weight: 600;
  font-size: 1.25rem;
  letter-spacing: -0.02em;
}

.original-price.has-discount {
  color: #718096;
  font-size: 1rem;
  text-decoration: line-through;
  font-weight: 500;
}

.domain-body {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.domain-description {
  color: #4a5568;
  font-size: 0.9375rem;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.domain-meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: auto;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.meta-label {
  color: #718096;
  font-weight: 500;
}

.meta-value {
  color: #2d3748;
  font-weight: 500;
}

.domain-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.tag {
  background: var(--theme-tertiary);
  color: color-mix(in srgb, var(--theme-primary) 90%, white 10%);
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.tag:hover {
  background: rgba(102, 126, 234, 0.15);
}

.domain-footer {
  padding: 20px;
  border-top: 1px solid #f1f3f4;
  background: #fafafa;
}

.inquiry-btn {
  width: 100%;
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
}

.inquiry-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.inquiry-btn span {
  position: relative;
  z-index: 2;
  transition: color 0.3s ease;
}

.inquiry-btn:hover {
  transform: translateY(-2px);
  border-color: var(--theme-primary);
  color: #fff;
}

.inquiry-btn:hover::before {
  opacity: 1;
}

.inquiry-btn:active {
  transform: translateY(0);
}

.inquiry-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.4);
}

.inquiry-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@media (max-width: 768px) {
  .domain-header {
    padding: 16px;
  }
  
  .domain-body {
    padding: 16px;
  }
  
  .domain-footer {
    padding: 16px;
  }
  
  .domain-name {
    font-size: 1.125rem;
  }
  
  .price {
    font-size: 1.125rem;
  }
  
  .inquiry-btn {
    padding: 10px 20px;
    font-size: 0.875rem;
  }
}
</style> 