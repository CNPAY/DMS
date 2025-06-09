# 线索模态框组件

<template>
  <div v-if="modelValue" class="inquiry-modal-overlay" @click="closeModal">
    <div class="inquiry-modal" @click.stop>
      <div class="modal-header">
        <h3>域名报价</h3>
        <button @click="closeModal" class="close-btn">&times;</button>
      </div>
      
      <div class="modal-body">
        <div v-if="domain" class="domain-info">
          <h4>{{ domain.name }}</h4>
          <div v-if="showPrice" class="price-info">
            <div class="price-container">
              <p v-if="hasValidDiscount" class="discount-price">
                <span class="price-label">折扣价</span>
                <span class="price-value">¥{{ formatPrice(domain.discountPrice) }}</span>
              </p>
              <p :class="{'price': !hasValidDiscount, 'sale-price': hasValidDiscount}">
                <span class="price-label">售价</span>
                <span  :class="{'price-value':true, 'sales-price':!hasValidDiscount}">¥{{ formatPrice(domain.salePrice) }}</span>
              </p>
            </div>
          </div>
        </div>
        
        <form @submit.prevent="submitInquiry" class="inquiry-form">
          <div class="form-group">
            <label for="visitorName">姓名 *</label>
            <input 
              id="visitorName"
              v-model="form.visitorName" 
              type="text" 
              required 
              placeholder="请输入您的姓名"
            />
          </div>
          
          <div class="form-group">
            <label for="visitorEmail">邮箱 *</label>
            <input 
              id="visitorEmail"
              v-model="form.visitorEmail" 
              type="email" 
              required 
              placeholder="请输入您的邮箱"
            />
          </div>
          
          <div class="form-group">
            <label for="visitorPhone">电话</label>
            <input 
              id="visitorPhone"
              v-model="form.visitorPhone" 
              type="tel" 
              placeholder="请输入您的电话"
            />
          </div>
          
          <div class="form-group">
            <label for="offerPrice">报价</label>
            <input 
              id="offerPrice"
              v-model="form.offerPrice" 
              type="number" 
              step="0.01" 
              placeholder="您的出价（可选）"
            />
          </div>
          
          <div class="form-group">
            <label for="message">留言 *</label>
            <textarea 
              id="message"
              v-model="form.message" 
              required 
              rows="4" 
              placeholder="请详细说明您的需求..."
            ></textarea>
          </div>
        </form>
      </div>

      <div class="form-actions">
        <button type="button" @click="closeModal" class="cancel-btn">
          取消
        </button>
        <button type="submit" :disabled="submitting" class="submit-btn" @click="submitInquiry">
          {{ submitting ? '提交中...' : '提交报价' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: Boolean,
  domain: Object,
  portfolio: Object
})

const emit = defineEmits(['update:modelValue'])

// 表单数据
const form = reactive({
  visitorName: '',
  visitorEmail: '',
  visitorPhone: '',
  offerPrice: '',
  message: ''
})

const submitting = ref(false)

// 格式化价格
const formatPrice = (price) => {
  if (!price) return '0'
  return new Intl.NumberFormat('zh-CN').format(price)
}

// 关闭模态框
const closeModal = () => {
  emit('update:modelValue', false)
  resetForm()
}

// 重置表单
const resetForm = () => {
  Object.keys(form).forEach(key => {
    form[key] = ''
  })
}

// 提交线索
const submitInquiry = async () => {
  if (submitting.value) return
  
  submitting.value = true
  
  try {
    const response = await $fetch('/api/portal/inquiry', {
      method: 'POST',
      body: {
        domainId: props.domain?.id,
        visitorName: form.visitorName,
        visitorEmail: form.visitorEmail,
        visitorPhone: form.visitorPhone,
        offerPrice: form.offerPrice ? parseFloat(form.offerPrice) : null,
        message: form.message
      }
    })
    
    if (response.success) {
      // 显示成功消息
      alert('提交成功！我们会尽快与您联系。')
      closeModal()
    } else {
      alert(response.message || '提交失败，请重试')
    }
  } catch (error) {
    console.error('提交线索失败:', error)
    alert('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 监听 domain 变化，重置表单
watch(() => props.domain, () => {
  if (props.domain) {
    resetForm()
  }
})
// 判断销售价格是否有效
const hasValidSalePrice = computed(() => {
  return props.domain.salePrice && 
         !isDateExpired(props.domain.salePriceExpirationDate) &&
         !isDateExpired(props.domain.expirationDate)
})
// 检查日期是否过期
const isDateExpired = (date) => {
  if (!date) return false
  return new Date(date) < new Date()
}
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
</script>

<style scoped>
.inquiry-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.inquiry-modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e1e8ed;
  flex-shrink: 0;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f8f9fa;
  color: #2c3e50;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 美化滚动条 */
.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.domain-info {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.domain-info h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.domain-info .price {
  margin: 0;
  color: #e74c3c;
  font-weight: 600;
}

.inquiry-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

.form-group input,
.form-group textarea {
  padding: 12px;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #1976d2;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 24px;
  background: white;
  border-top: 1px solid #e1e8ed;
  flex-shrink: 0;
  margin-top: auto;
  border-radius: 0 0 12px 12px;
}

.cancel-btn,
.submit-btn {
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background: #5a6268;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 576px) {
  .inquiry-modal {
    margin: 0;
    border-radius: 8px;
  }
  
  .modal-header,
  .modal-body {
    padding: 16px;
  }
  
  .form-actions {
    padding: 12px 16px;
    flex-direction: column;
  }
  
  .cancel-btn,
  .submit-btn {
    width: 100%;
  }
}

.price-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 8px;
  margin-top: 8px;
}

.price-container p {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
  padding: 2px 0;
}

.price-label {
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
  margin-right: 12px;
}

.price-value {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 500;
}

.sales-price {
  color: #f56565;
  background: rgba(245, 101, 101, 0.1);
}

.discount-price .price-value {
  color: #f56565;
  background: rgba(245, 101, 101, 0.1);
}

.sale-price {
  opacity: 0.75;
}

.sale-price .price-value {
  color: #64748b;
  text-decoration: line-through;
  background: none;
  padding: 2px 8px;
}
</style> 