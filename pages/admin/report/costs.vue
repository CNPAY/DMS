<template>
  <div class="app-container">
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card shadow="never" class="stats-card">
        <div class="stats-content">
          <div class="stats-icon">
            <el-icon :size="24" color="#409EFF">
              <Money />
            </el-icon>
          </div>
          <div class="stats-info">
            <div class="stats-value">￥{{ costStats.overview?.totalAmount?.toLocaleString() || 0 }}</div>
            <div class="stats-label">总成本支出</div>
          </div>
        </div>
      </el-card>
      
      <el-card shadow="never" class="stats-card">
        <div class="stats-content">
          <div class="stats-icon">
            <el-icon :size="24" color="#67C23A">
              <Wallet />
            </el-icon>
          </div>
          <div class="stats-info">
            <div class="stats-value">￥{{ costStats.overview?.totalHoldingCost?.toLocaleString() || 0 }}</div>
            <div class="stats-label">总持有成本</div>
          </div>
        </div>
      </el-card>
      
      <el-card shadow="never" class="stats-card">
        <div class="stats-content">
          <div class="stats-icon">
            <el-icon :size="24" color="#F56C6C">
              <TrendCharts />
            </el-icon>
          </div>
          <div class="stats-info">
            <div class="stats-value">￥{{ costStats.overview?.averageAmount?.toFixed(2) || 0 }}</div>
            <div class="stats-label">平均成本</div>
          </div>
        </div>
      </el-card>
      
      <el-card shadow="never" class="stats-card">
        <div class="stats-content">
          <div class="stats-icon">
            <el-icon :size="24" color="#E6A23C">
              <Calendar />
            </el-icon>
          </div>
          <div class="stats-info">
            <div class="stats-value">{{ costStats.overview?.upcomingRenewalsCount || 0 }}</div>
            <div class="stats-label">即将到期域名</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 成本类型分布图表 -->
    <el-row :gutter="20" class="mt-4" style="margin-bottom: 15px;">
      <el-col :xs="24" :sm="12">
        <el-card shadow="never" title="成本类型分布">
          <div id="costTypeChart" class="chart-container"></div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12">
        <el-card shadow="never" title="月度成本趋势">
          <div id="monthlyTrendChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索面板 -->
    <el-card v-show="showSearch" class="search-panel">
      <el-form :model="searchForm" ref="queryRef" :inline="true" label-width="100px">
        <el-form-item label="域名" prop="domainName" style="width: 280px">
          <el-input
            v-model="searchForm.domainName"
            placeholder="请输入域名"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="成本类型" prop="costType" style="width: 280px">
          <el-select v-model="searchForm.costType" placeholder="请选择成本类型" clearable style="width: 100%">
            <el-option
              v-for="type in costTypeOptions"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="日期范围" prop="dateRange" style="width: 320px">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="金额范围" style="width: 420px">
          <el-input-number
            v-model="searchForm.minAmount"
            placeholder="最小金额"
            :min="0"
            size="small"
            style="width: 120px; margin-right: 10px;display: inline-block;"
          />
          <span style="margin: 0 5px;">-</span>
          <el-input-number
            v-model="searchForm.maxAmount"
            placeholder="最大金额"
            :min="0"
            size="small"
            style="width: 120px;display: inline-block;"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
          <el-button icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <el-row class="mb8" style="display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex;">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
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
        v-loading="loading"
        :data="costList"
        @selection-change="handleSelectionChange"
      >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column prop="domainName" label="域名" width="200" show-overflow-tooltip />
          <el-table-column prop="registrarName" label="注册商" width="120" align="center">
            <template #default="{ row }">
              <span :class="{ 'text-gray-400': !row.registrarName }">
                {{ row.registrarName || '-' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="costTypeName" label="成本类型" width="120" align="center" />
          <el-table-column prop="amount" label="金额" width="120" align="center">
            <template #default="{ row }">
              <span class="text-red-500 font-medium">￥{{ row.amount?.toLocaleString() }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="costDate" label="成本日期" width="120" align="center">
            <template #default="{ row }">
              {{ formatDate(row.costDate) }}
            </template>
          </el-table-column>
          <el-table-column prop="renewalYears" label="续费年限" width="100" align="center">
            <template #default="{ row }">
              <span :class="{ 'text-gray-400': !row.renewalYears }">
                {{ row.renewalYears ? `${row.renewalYears}年` : '-' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="notes" label="备注" min-width="200" show-overflow-tooltip>
            <template #default="{ row }">
              <span :class="{ 'text-gray-400': !row.notes }">
                {{ row.notes || '-' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="160" align="center">
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" align="center" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                link
                size="small"
                icon="Edit"
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                link
                size="small"
                icon="Delete"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-show="total > 0"
          :current-page="searchForm.page"
          :page-size="searchForm.pageSize"
          :total="total"
          :page-sizes="[10, 20, 30, 40]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="域名" prop="domainId">
          <el-select v-model="form.domainId" placeholder="请选择域名" style="width: 100%">
            <el-option
              v-for="domain in domainOptions"
              :key="domain.value"
              :label="domain.label"
              :value="domain.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="成本类型" prop="costType">
          <el-select v-model="form.costType" placeholder="请选择成本类型" style="width: 100%">
            <el-option
              v-for="type in costTypeOptions"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="金额" prop="amount">
          <el-input-number
            v-model="form.amount"
            placeholder="请输入金额"
            :min="0"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="成本日期" prop="costDate">
          <el-date-picker
            v-model="form.costDate"
            type="date"
            placeholder="请选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="续费年限" prop="renewalYears">
          <el-input-number
            v-model="form.renewalYears"
            placeholder="续费年限（仅续费类型）"
            :min="1"
            :max="10"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="备注" prop="notes">
          <el-input
            v-model="form.notes"
            type="textarea"
            placeholder="请输入备注"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Money, 
  Wallet, 
  TrendCharts, 
  Calendar,
  Search,
  Refresh,
  Plus,
  Delete,
  Edit
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'

definePageMeta({
  layout: 'admin'
})

// 响应式数据
const loading = ref(false)
const showSearch = ref(true)
const multiple = ref(false)
const ids = ref<number[]>([])
const queryRef = ref()
const formRef = ref()

// 成本统计数据
const costStats = ref<any>({})

// 搜索表单
const searchForm = reactive({
  domainName: '',
  costType: '',
  dateRange: null as string[] | null,
  minAmount: undefined as number | undefined,
  maxAmount: undefined as number | undefined,
  page: 1,
  pageSize: 20
})

// 成本列表
const costList = ref([])
const total = ref(0)

// 选项数据
const domainOptions = ref([])
const costTypeOptions = ref([])

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = computed(() => form.id ? '编辑成本记录' : '新增成本记录')

// 表单数据
const form = reactive({
  id: undefined as number | undefined,
  domainId: undefined as number | undefined,
  costType: '',
  amount: undefined as number | undefined,
  costDate: '',
  renewalYears: undefined as number | undefined,
  notes: ''
})

// 表单验证规则
const formRules = {
  domainId: [
    { required: true, message: '请选择域名', trigger: 'change' }
  ],
  costType: [
    { required: true, message: '请选择成本类型', trigger: 'change' }
  ],
  amount: [
    { required: true, message: '请输入金额', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '金额必须大于0', trigger: 'blur' }
  ],
  costDate: [
    { required: true, message: '请选择日期', trigger: 'change' }
  ]
}

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

// 格式化日期时间
const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString()
}

// 获取成本统计
const fetchCostStats = async (timeRange = 'all') => {
  try {
    const { data } = await $fetch('/api/admin/report/costs/stats', {
      params: { timeRange }
    })
    costStats.value = data
    
    // 更新图表
    nextTick(() => {
      updateCharts()
    })
  } catch (error) {
    console.error('获取成本统计失败:', error)
  }
}

// 获取成本列表
const fetchCostList = async () => {
  loading.value = true
  try {
    const params: any = {
      page: searchForm.page,
      pageSize: searchForm.pageSize
    }
    
    if (searchForm.domainName) params.domainName = searchForm.domainName
    if (searchForm.costType) params.costType = searchForm.costType
    if (searchForm.dateRange?.length === 2) {
      params.startDate = searchForm.dateRange[0]
      params.endDate = searchForm.dateRange[1]
    }
    if (searchForm.minAmount) params.minAmount = searchForm.minAmount
    if (searchForm.maxAmount) params.maxAmount = searchForm.maxAmount
    
    const { data } = await $fetch('/api/admin/report/costs/list', { params })
    costList.value = data.list
    total.value = data.pagination.total
  } catch (error) {
    console.error('获取成本列表失败:', error)
    ElMessage.error('获取成本列表失败')
  } finally {
    loading.value = false
  }
}

// 获取选项数据
const fetchOptions = async () => {
  try {
    const { data } = await $fetch('/api/admin/report/costs/options')
    domainOptions.value = data.domains
    costTypeOptions.value = data.costTypes
  } catch (error) {
    console.error('获取选项数据失败:', error)
  }
}

// 更新图表
const updateCharts = () => {
  // 成本类型分布饼图
  const costTypeChart = echarts.getInstanceByDom(document.getElementById('costTypeChart')!) || 
                       echarts.init(document.getElementById('costTypeChart')!)
  
  const costTypeData = costStats.value.costsByType || []
  costTypeChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: ￥{c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '成本类型',
        type: 'pie',
        radius: '50%',
        data: costTypeData.map((item: any) => ({
          name: item.typeName,
          value: item.totalAmount
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  })

  // 月度趋势折线图
  const monthlyChart = echarts.getInstanceByDom(document.getElementById('monthlyTrendChart')!) || 
                      echarts.init(document.getElementById('monthlyTrendChart')!)
  
  const monthlyData = costStats.value.monthlyTrend || []
  monthlyChart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: monthlyData.map((item: any) => item.month)
    },
    yAxis: {
      type: 'value',
      name: '金额（元）'
    },
    series: [
      {
        name: '月度成本',
        type: 'line',
        data: monthlyData.map((item: any) => item.amount),
        smooth: true
      }
    ]
  })
}

// 搜索
const handleSearch = () => {
  searchForm.page = 1
  fetchCostList()
}

// 重置搜索
const resetSearch = () => {
  queryRef.value?.resetFields()
  searchForm.domainName = ''
  searchForm.costType = ''
  searchForm.dateRange = null
  searchForm.minAmount = undefined
  searchForm.maxAmount = undefined
  handleSearch()
}

// 新增
const handleAdd = () => {
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  form.id = row.id
  form.domainId = row.domainId
  form.costType = row.costType
  form.amount = row.amount
  form.costDate = row.costDate
  form.renewalYears = row.renewalYears
  form.notes = row.notes
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row?: any) => {
  const deleteIds = row ? [row.id] : ids.value
  if (deleteIds.length === 0) {
    ElMessage.warning('请选择要删除的记录')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定删除${deleteIds.length === 1 ? '该条' : `这${deleteIds.length}条`}成本记录吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const action = deleteIds.length === 1 ? 'delete' : 'batchDelete'
    const data = deleteIds.length === 1 ? deleteIds[0] : deleteIds

    await $fetch('/api/admin/report/costs/save', {
      method: 'POST',
      body: { action, data }
    })

    ElMessage.success('删除成功')
    await fetchCostList()
    await fetchCostStats()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 表格选择变化
const handleSelectionChange = (selection: any[]) => {
  ids.value = selection.map(item => item.id)
  multiple.value = !selection.length
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  searchForm.pageSize = size
  searchForm.page = 1
  fetchCostList()
}

// 当前页变化
const handleCurrentChange = (page: number) => {
  searchForm.page = page
  fetchCostList()
}

// 刷新
const handleRefresh = () => {
  fetchCostList()
  fetchCostStats()
}

// 重置表单
const resetForm = () => {
  form.id = undefined
  form.domainId = undefined
  form.costType = ''
  form.amount = undefined
  form.costDate = ''
  form.renewalYears = undefined
  form.notes = ''
  formRef.value?.clearValidate()
}

// 提交表单
const submitForm = async () => {
  try {
    await formRef.value?.validate()
    
    const action = form.id ? 'update' : 'create'
    await $fetch('/api/admin/report/costs/save', {
      method: 'POST',
      body: { action, data: form }
    })

    ElMessage.success(form.id ? '更新成功' : '创建成功')
    dialogVisible.value = false
    await fetchCostList()
    await fetchCostStats()
  } catch (error) {
    console.error('保存失败:', error)
  }
}

// 页面初始化
onMounted(async () => {
  await fetchOptions()
  await fetchCostStats()
  await fetchCostList()
})
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stats-card {
  border: none;
}

.stats-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stats-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: rgba(64, 158, 255, 0.1);
}

.stats-info {
  flex: 1;
}

.stats-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
}

.stats-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.chart-container {
  height: 300px;
  width: 100%;
}

/* 保持和注册商页面一致的样式 */

.text-gray-400 {
  color: #c0c4cc;
}

.text-red-500 {
  color: #f56565;
}

.font-medium {
  font-weight: 500;
}
</style> 