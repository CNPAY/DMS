<template>
  <div class="app-container">
    <!-- 等待 Element Plus 加载 -->
    <div v-if="!elementPlusReady" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载界面...</p>
    </div>
    
    <!-- 销售报表内容 -->
    <div v-else>
      <!-- 统计卡片 -->
      <div class="stats-grid">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon sales-icon">
              <svg-icon icon-class="money" size="32px" />
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ stats.totalSales }}</div>
              <div class="stats-label">总销售数量</div>
            </div>
          </div>
        </el-card>

        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon revenue-icon">
              <svg-icon icon-class="chart" size="32px" />
            </div>
            <div class="stats-info">
              <div class="stats-number">¥{{ formatNumber(stats.totalRevenue) }}</div>
              <div class="stats-label">总销售收入</div>
            </div>
          </div>
        </el-card>

        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon profit-icon">
              <svg-icon icon-class="success" size="32px" />
            </div>
            <div class="stats-info">
              <div class="stats-number">¥{{ formatNumber(stats.totalProfit) }}</div>
              <div class="stats-label">总净利润</div>
            </div>
          </div>
        </el-card>

        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon avg-icon">
              <svg-icon icon-class="trend" size="32px" />
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ stats.averageProfitMargin }}%</div>
              <div class="stats-label">平均利润率</div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 搜索面板 -->
      <div v-show="showSearch" class="search-panel">
        <el-form ref="queryRef" :model="searchForm" :inline="true" class="mb8">
          <el-form-item label="域名" prop="domainName" style="width: 220px;">
            <el-input
              v-model="searchForm.domainName"
              placeholder="请输入域名"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          
          <el-form-item label="买家姓名" prop="buyerName" style="width: 220px;">
            <el-input
              v-model="searchForm.buyerName"
              placeholder="请输入买家姓名"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          
          <el-form-item label="支付状态" prop="paymentStatus" style="width: 220px;">
            <el-select
              v-model="searchForm.paymentStatus"
              placeholder="请选择支付状态"
              clearable
            >
              <el-option label="待支付" value="pending" />
              <el-option label="已支付" value="paid" />
              <el-option label="部分支付" value="partial" />
              <el-option label="已退款" value="refunded" />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
            <el-button icon="Refresh" @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 工具栏 -->
      <el-row class="mb8" style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex;">
          <el-button type="primary" plain icon="Plus" @click="showAddDialog">新增</el-button>
          <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
        </div>
        <div style="display: flex; gap: 10px;">
          <el-button circle @click="showSearch = !showSearch">
            <el-icon><Search /></el-icon>
          </el-button>
          <el-button circle @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </el-row>

      <!-- 数据表格 -->
      <el-card>
        <el-table
          :data="salesList"
          v-loading="loading"
          empty-text="暂无销售记录"
          @selection-change="handleSelectionChange"
          @sort-change="handleSort"
        >
          <el-table-column type="selection" width="55" align="center" />
          
          <el-table-column label="域名" align="center" prop="domain.domainName" min-width="180">
            <template #default="{ row }">
              <span>{{ row.domain?.domainName || '-' }}</span>
            </template>
          </el-table-column>
          
          <el-table-column label="买家" align="center" width="120">
            <template #default="{ row }">
              <span v-if="row.buyerName">{{ row.buyerName }}</span>
              <span v-else class="text-gray-400">-</span>
            </template>
          </el-table-column>
          
          <el-table-column label="售价" align="center" width="120" sortable="custom">
            <template #default="{ row }">
              ¥{{ formatNumber(row.salePrice) }}
            </template>
          </el-table-column>
          
          <el-table-column label="成本" align="center" width="120">
            <template #default="{ row }">
              <span v-if="row.domain?.purchasePrice">¥{{ formatNumber(row.domain.purchasePrice) }}</span>
              <span v-else class="text-gray-400">-</span>
            </template>
          </el-table-column>
          
          <el-table-column label="净利润" align="center" width="120">
            <template #default="{ row }">
              <span :class="row.netProfit >= 0 ? 'profit-positive' : 'profit-negative'">
                ¥{{ formatNumber(row.netProfit) }}
              </span>
            </template>
          </el-table-column>
          
          <el-table-column label="利润率" align="center" width="100">
            <template #default="{ row }">
              <span :class="row.profitMargin >= 0 ? 'profit-positive' : 'profit-negative'">
                {{ row.profitMargin }}%
              </span>
            </template>
          </el-table-column>
          
          <el-table-column label="销售日期" align="center" width="120">
            <template #default="{ row }">
              {{ formatDate(row.saleDate) }}
            </template>
          </el-table-column>
          
          <el-table-column label="支付状态" align="center" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.paymentStatus)">
                {{ getStatusText(row.paymentStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="平台" align="center" width="120">
            <template #default="{ row }">
              <span v-if="row.platformName">{{ row.platformName }}</span>
              <span v-else class="text-gray-400">-</span>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" align="center" fixed="right" width="180">
            <template #default="scope">
              <el-button link type="primary" icon="Edit" @click="editSale(scope.row)">修改</el-button>
              <el-button link type="primary" icon="Delete" @click="deleteSale(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-show="pagination.total > 0"
            :current-page="pagination.page"
            :page-size="pagination.limit"
            :page-sizes="[10, 20, 30, 40]"
            :total="pagination.total"
            background
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 添加/编辑销售记录对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogForm.id ? '编辑销售记录' : '添加销售记录'"
      width="600px"
      @close="resetDialog"
    >
      <el-form
        ref="dialogFormRef"
        :model="dialogForm"
        :rules="dialogRules"
        label-width="100px"
      >
        <el-form-item label="域名" prop="domainId">
          <el-select
            v-model="dialogForm.domainId"
            placeholder="选择域名"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="domain in availableDomains"
              :key="domain.id"
              :label="domain.domainName"
              :value="domain.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="售价" prop="salePrice">
          <el-input-number
            v-model="dialogForm.salePrice"
            :min="0"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="销售日期" prop="saleDate">
          <el-date-picker
            v-model="dialogForm.saleDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="买家姓名">
          <el-input v-model="dialogForm.buyerName" />
        </el-form-item>
        
        <el-form-item label="买家邮箱">
          <el-input v-model="dialogForm.buyerEmail" />
        </el-form-item>
        
        <el-form-item label="平台名称">
          <el-input v-model="dialogForm.platformName" />
        </el-form-item>
        
        <el-form-item label="平台费用">
          <el-input-number
            v-model="dialogForm.platformFee"
            :min="0"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="支付状态">
          <el-select v-model="dialogForm.paymentStatus" style="width: 100%">
            <el-option label="待支付" value="pending" />
            <el-option label="已支付" value="paid" />
            <el-option label="部分支付" value="partial" />
            <el-option label="已退款" value="refunded" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input
            v-model="dialogForm.notes"
            type="textarea"
            rows="3"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitDialog" :loading="submitLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
// 设置管理后台布局和认证保护
definePageMeta({
  layout: 'admin',
  title: '销售报表',
  middleware: 'auth'
})

// 使用智能 UI 库管理器
const { isElementPlusLoaded } = useUILibrary()

// 检查 Element Plus 是否准备就绪
const elementPlusReady = ref(false)

// 响应式数据
const loading = ref(true)
const salesList = ref([])
const stats = ref({
  totalSales: 0,
  totalRevenue: 0,
  totalProfit: 0,
  averageProfitMargin: 0
})

const searchForm = ref({
  domainName: '',
  buyerName: '',
  paymentStatus: ''
})

const pagination = ref({
  page: 1,
  limit: 20,
  total: 0
})

// 界面控制
const showSearch = ref(true)
const multiple = ref(true)
const ids = ref([])
const queryRef = ref()

const dialogVisible = ref(false)
const dialogFormRef = ref()
const submitLoading = ref(false)
const availableDomains = ref<any[]>([])

const dialogForm = ref({
  id: null,
  domainId: null,
  salePrice: null,
  saleDate: null,
  buyerName: '',
  buyerEmail: '',
  platformName: '',
  platformFee: null,
  paymentStatus: 'pending',
  notes: ''
})

const dialogRules = {
  domainId: [{ required: true, message: '请选择域名', trigger: 'change' }],
  salePrice: [{ required: true, message: '请输入售价', trigger: 'blur' }],
  saleDate: [{ required: true, message: '请选择销售日期', trigger: 'change' }]
}

// 监听 Element Plus 加载状态
watch(() => isElementPlusLoaded(), (loaded) => {
  elementPlusReady.value = loaded
  if (loaded) {
    loadData()
  }
}, { immediate: true })

// 轮询检查 Element Plus 是否加载完成（备用方案）
onMounted(() => {
  const checkInterval = setInterval(() => {
    if (isElementPlusLoaded()) {
      elementPlusReady.value = true
      loadData()
      clearInterval(checkInterval)
    }
  }, 100)
  
  setTimeout(() => {
    clearInterval(checkInterval)
  }, 5000)
})

// 加载数据
async function loadData() {
  await Promise.all([
    loadSalesList(),
    loadStats()
  ])
}

// 加载销售记录列表
async function loadSalesList() {
  try {
    loading.value = true
    
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit,
      ...searchForm.value
    }
    
    const response = await $fetch('/api/admin/report/sales/list', { params })
    
    if (response.code === 200) {
      salesList.value = response.data.sales
      pagination.value = response.data.pagination
    }
  } catch (error) {
    console.error('加载销售记录失败:', error)
    ElMessage.error('加载销售记录失败')
  } finally {
    loading.value = false
  }
}

// 加载统计数据
async function loadStats() {
  try {
    const response = await $fetch('/api/admin/report/sales/stats')
    
    if (response.code === 200) {
      stats.value = response.data.overview
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 搜索处理
function handleSearch() {
  pagination.value.page = 1
  loadSalesList()
}

// 重置搜索
function resetSearch() {
  searchForm.value = {
    domainName: '',
    buyerName: '',
    paymentStatus: ''
  }
  handleSearch()
}

// 选择变化处理
function handleSelectionChange(selection: any[]) {
  ids.value = selection.map(item => item.id)
  multiple.value = !selection.length
}

// 分页大小变化
function handleSizeChange(val: number) {
  pagination.value.limit = val
  loadSalesList()
}

// 页码变化
function handleCurrentChange(val: number) {
  pagination.value.page = val
  loadSalesList()
}

// 刷新数据
function handleRefresh() {
  loadData()
}

// 批量删除处理
async function handleDelete() {
  if (ids.value.length === 0) {
    ElMessage.warning('请选择要删除的记录')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确定要删除这${ids.value.length}条销售记录吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await $fetch('/api/admin/report/sales/delete', {
      method: 'POST',
      body: {
        ids: ids.value
      }
    })
    
    if (response.code === 200) {
      ElMessage.success(`成功删除${ids.value.length}条记录`)
      await loadData() // 重新加载列表和统计数据
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 排序处理
function handleSort({ column, prop, order }: any) {
  // 实现排序逻辑
  console.log('排序:', prop, order)
}

// 显示添加对话框
function showAddDialog() {
  dialogVisible.value = true
  loadAvailableDomains()
}

// 编辑销售记录
function editSale(row: any) {
  dialogForm.value = { ...row }
  dialogVisible.value = true
  loadAvailableDomains()
}

// 删除销售记录
async function deleteSale(row: any) {
  try {
    await ElMessageBox.confirm('确定要删除这条销售记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await $fetch('/api/admin/report/sales/delete', {
      method: 'POST',
      body: {
        id: row.id
      }
    })
    
    if (response.code === 200) {
      ElMessage.success('删除成功')
      await loadData() // 重新加载列表和统计数据
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除销售记录失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 加载可选域名
async function loadAvailableDomains() {
  try {
    const response = await $fetch('/api/admin/domains/list')
    if (response.code === 200) {
      availableDomains.value = response.data.domains
    }
  } catch (error) {
    console.error('加载域名列表失败:', error)
  }
}

// 提交对话框
async function submitDialog() {
  try {
    await dialogFormRef.value.validate()
    
    submitLoading.value = true
    
    const response = await $fetch('/api/admin/report/sales/save', {
      method: 'POST',
      body: dialogForm.value
    })
    
    if (response.code === 200) {
      ElMessage.success(response.message)
      dialogVisible.value = false
      await loadData()
    } else {
      ElMessage.error(response.message || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    submitLoading.value = false
  }
}

// 重置对话框
function resetDialog() {
  dialogForm.value = {
    id: null,
    domainId: null,
    salePrice: null,
    saleDate: null,
    buyerName: '',
    buyerEmail: '',
    platformName: '',
    platformFee: null,
    paymentStatus: 'pending',
    notes: ''
  }
  dialogFormRef.value?.resetFields()
}

// 格式化数字
function formatNumber(value: number): string {
  if (value >= 10000) {
    return (value / 10000).toFixed(1) + 'w'
  }
  return value.toLocaleString()
}

// 格式化日期
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString()
}

// 获取状态类型
function getStatusType(status: string): string {
  const typeMap: Record<string, string> = {
    pending: 'warning',
    paid: 'success',
    partial: 'info',
    refunded: 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
function getStatusText(status: string): string {
  const textMap: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    partial: '部分支付',
    refunded: '已退款'
  }
  return textMap[status] || status
}

// 设置页面标题
useHead({
  title: '销售报表 - DMS 管理后台'
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--text-color-secondary);
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--border-color);
    border-top: 4px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }
}


.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
  
  .stats-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }
    
    .stats-content {
      display: flex;
      align-items: center;
      gap: 16px;
      
      .stats-icon {
        font-size: 2.5rem;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        color: white;
        
        &.sales-icon {
          background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
        }
        
        &.revenue-icon {
          background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
        }
        
        &.profit-icon {
          background: linear-gradient(45deg, #43e97b 0%, #38f9d7 100%);
        }
        
        &.avg-icon {
          background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
        }
      }
      
      .stats-info {
        flex-grow: 1;
        
        .stats-number {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--text-color);
          margin-bottom: 4px;
        }
        
        .stats-label {
          color: var(--text-color-secondary);
          font-size: 0.9rem;
        }
      }
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.text-gray-400 {
  color: #9ca3af;
}

.profit-positive {
  color: #67c23a;
  font-weight: 500;
}

.profit-negative {
  color: #f56c6c;
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style> 