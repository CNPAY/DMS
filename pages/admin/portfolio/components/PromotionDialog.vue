<template>
  <el-dialog 
    :title="'设置促销'" 
    v-model="dialogVisible" 
    width="80%"
    @close="handleClose"
  >
    <div class="promotion-container">
      <!-- 批量设置 -->
      <el-card class="mb-4">
        <template #header>
          <div class="card-header">
            <span>批量设置</span>
          </div>
        </template>
        
        <el-form :model="batchForm" label-width="120px">
          <el-form-item label="设置方式">
            <el-radio-group v-model="batchForm.type">
              <el-radio label="fixed">固定价格</el-radio>
              <el-radio label="discount">折扣比例</el-radio>
              <el-radio label="reduce">批量减价</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item v-if="batchForm.type === 'fixed'" label="促销价格">
            <el-input-number 
              v-model="batchForm.fixedPrice" 
              :min="0"
              :precision="2"
              :step="100"
              style="width: 200px"
            />
            <span class="ml-2">元</span>
          </el-form-item>
          
          <el-form-item v-else-if="batchForm.type === 'discount'" label="折扣比例">
            <el-input-number 
              v-model="batchForm.discountPercent" 
              :min="1"
              :max="99"
              :precision="0"
              style="width: 200px"
            />
            <span class="ml-2">%</span>
          </el-form-item>

          <el-form-item v-else label="减价金额">
            <el-input-number 
              v-model="batchForm.reduceAmount" 
              :min="0"
              :precision="2"
              :step="100"
              style="width: 200px"
            />
            <span class="ml-2">元</span>
          </el-form-item>

          <el-form-item label="有效期至">
            <el-date-picker
              v-model="batchForm.expiry"
              type="datetime"
              placeholder="选择有效期"
              format="YYYY-MM-DD HH:mm"
              :shortcuts="dateShortcuts"
              style="width: 240px"
            />
          </el-form-item>

          <el-form-item>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
              <el-button @click="handleResetToOriginal">恢复默认</el-button>
              <el-button type="primary" @click="handleBatchApply">应用到所有域名</el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 域名列表 -->
      <el-card>
        <template #header>
          <div class="card-header">
            <span>域名列表</span>
            <el-input
              v-model="searchKeyword"
              placeholder="搜索域名"
              style="width: 200px"
              clearable
            />
          </div>
        </template>

        <el-table :data="filteredDomains" v-loading="loading" style="width: 100%">
          <el-table-column prop="domainName" label="域名" min-width="180" />
          <el-table-column prop="salesPrice" label="销售价格" width="120">
            <template #default="{ row }">
              {{ formatPrice(row.salesPrice) }}
            </template>
          </el-table-column>
          <el-table-column label="促销价格" width="200">
            <template #default="{ row }">
              <el-input-number 
                v-model="row.discountPrice"
                :min="0"
                :precision="2"
                :step="100"
                style="width: 150px"
                @change="handleSingleDomainChange(row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="折扣" width="100">
            <template #default="{ row }">
              {{ calculateDiscount(row) }}%
            </template>
          </el-table-column>
          <el-table-column label="有效期" width="200">
            <template #default="{ row }">
              <el-date-picker
                v-model="row.discountExpiry"
                type="datetime"
                placeholder="选择有效期"
                format="YYYY-MM-DD HH:mm"
                style="width: 160px"
                @change="handleSingleDomainChange(row)"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保 存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  portfolioId: Number,
  portfolioName: String
})

const emit = defineEmits(['update:modelValue', 'success'])

// 响应式数据
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const saving = ref(false)
const searchKeyword = ref('')
const domains = ref([])
const originalDomains = ref([])

// 批量设置表单
const batchForm = ref({
  type: 'fixed',
  fixedPrice: 0,
  discountPercent: 90,
  reduceAmount: 100,
  expiry: null
})

// 日期快捷选项
const dateShortcuts = [
  {
    text: '一周后',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() + 3600 * 1000 * 24 * 7)
      return date
    }
  },
  {
    text: '一个月后',
    value: () => {
      const date = new Date()
      date.setMonth(date.getMonth() + 1)
      return date
    }
  },
  {
    text: '三个月后',
    value: () => {
      const date = new Date()
      date.setMonth(date.getMonth() + 3)
      return date
    }
  }
]

// 计算属性
const filteredDomains = computed(() => {
  if (!searchKeyword.value) return domains.value
  const keyword = searchKeyword.value.toLowerCase()
  return domains.value.filter(domain => 
    domain.domainName.toLowerCase().includes(keyword)
  )
})

// 方法
const loadDomains = async () => {
  loading.value = true
  try {
    const response = await $fetch(`/api/admin/portfolio/${props.portfolioId}/domains`)
    if (response.code === 200) {
      const domainsData = response.data.map(domain => ({
        ...domain,
        discountPrice: domain.discount || null,
        discountExpiry: domain.discountExpiry ? new Date(domain.discountExpiry) : null
      }))
      domains.value = domainsData
      // 保存原始数据的深拷贝
      originalDomains.value = JSON.parse(JSON.stringify(domainsData))
    }
  } catch (error) {
    console.error('获取域名列表失败:', error)
    ElMessage.error('获取域名列表失败')
  } finally {
    loading.value = false
  }
}

const handleBatchApply = () => {
  const { type, fixedPrice, discountPercent, reduceAmount, expiry } = batchForm.value
  
  domains.value.forEach(domain => {
    if (!domain.salesPrice) return // 跳过没有销售价格的域名
    
    if (type === 'fixed') {
      domain.discountPrice = fixedPrice
    } else if (type === 'discount') {
      domain.discountPrice = Number((domain.salesPrice * discountPercent / 100).toFixed(2))
    } else if (type === 'reduce') {
      // 确保减价后的价格不小于0
      domain.discountPrice = Number(Math.max(0, domain.salesPrice - reduceAmount).toFixed(2))
    }
    domain.discountExpiry = expiry
  })
}

const handleSingleDomainChange = (domain) => {
  // 可以在这里添加单个域名修改时的逻辑
}

const calculateDiscount = (domain) => {
  if (!domain.salesPrice || !domain.discountPrice) return '-'
  return Math.round((domain.discountPrice / domain.salesPrice) * 100)
}

const formatPrice = (price) => {
  return price ? `¥${price}` : '-'
}

const handleSave = async () => {
  saving.value = true
  try {
    const updateData = domains.value.map(domain => ({
      id: domain.id,
      discount: domain.discountPrice,
      discountExpiry: domain.discountExpiry
    }))

    const response = await $fetch('/api/admin/portfolio/update-promotions', {
      method: 'POST',
      body: {
        portfolioId: props.portfolioId,
        domains: updateData
      }
    })

    if (response.code === 200) {
      ElMessage.success('保存成功')
      emit('success')
      dialogVisible.value = false
    } else {
      ElMessage.error(response.message || '保存失败')
    }
  } catch (error) {
    console.error('保存促销设置失败:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const handleClose = () => {
  domains.value = []
  searchKeyword.value = ''
  batchForm.value = {
    type: 'fixed',
    fixedPrice: 0,
    discountPercent: 90,
    reduceAmount: 100,
    expiry: null
  }
}

// 恢复到原始状态
const handleResetToOriginal = () => {
  domains.value = JSON.parse(JSON.stringify(originalDomains.value))
  ElMessage.success('已恢复到原始状态')
}

// 监听对话框显示
watch(() => dialogVisible.value, (val) => {
  if (val) {
    loadDomains()
  }
})
</script>

<style scoped>
.promotion-container {
  max-height: 70vh;
  overflow-y: auto;
}

.mb-4 {
  margin-bottom: 16px;
}

.ml-2 {
  margin-left: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-input-number .el-input__wrapper) {
  padding-left: 8px;
  padding-right: 8px;
}
</style> 