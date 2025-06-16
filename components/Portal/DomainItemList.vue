# 列表式域名展示组件

<template>
  <div class="domain-item-list">
    <div class="domain-content">
      <div class="domain-info">
        <h3 class="domain-name" @click="handleDomainClick">{{ domain.name }}</h3>
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
        <div v-if="showPrice" class="price-container">
          <div v-if="hasValidDiscount" class="discount-price">
            ¥{{ formatPrice(domain.discountPrice) }}
          </div>
          <div :class="['original-price', { 'has-discount': hasValidDiscount }]">
            ¥{{ formatPrice(domain.salePrice) }}
          </div>
        </div>
        <button @click="handleDomainClick" class="inquiry-btn">
          <span>询价购买</span>
        </button>
      </div>
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
  debugger
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
  color: var(--theme-primary);
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
  background: var(--theme-tertiary);
  color: color-mix(in srgb, var(--theme-primary) 90%, white 10%);
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

.price-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  margin-right: 16px;
}

.discount-price {
  color: #e53e3e;
  font-weight: 600;
  font-size: 1.1rem;
}

.original-price {
  color: #e53e3e;
  font-weight: 600;
  font-size: 1.1rem;
}

.original-price.has-discount {
  color: #718096;
  font-size: 0.9rem;
  text-decoration: line-through;
  font-weight: 500;
}

.inquiry-btn {
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
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
  transform: translateY(-1px);
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

  .price-container {
    margin-left: 0;
    margin-right: 0;
  }
}
</style> 