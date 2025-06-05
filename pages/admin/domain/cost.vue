<template>
  <div class="app-container">
    <!-- 搜索面板 -->
    <el-card v-show="showSearch" class="search-panel">
      <el-form ref="queryRef" :model="queryParams" :inline="true" class="mb8">
        <el-form-item label="域名" prop="domainId">
          <el-select
            v-model="queryParams.domainId"
            placeholder="请选择域名"
            clearable
            filterable
          >
            <el-option
              v-for="domain in options.domains"
              :key="domain.id"
              :label="domain.domainName"
              :value="domain.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="成本类型" prop="costType" style="width: 250px;">
          <el-select
            v-model="queryParams.costType"
            placeholder="请选择成本类型"
            clearable
          >
            <el-option
              v-for="type in options.costTypeOptions"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="日期范围" prop="dateRange">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleDateRangeChange"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 工具栏 -->
    <el-row class="mb8" style="display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex;">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
        <el-button type="success" plain icon="TrendCharts" @click="showStats = !showStats">统计</el-button>
      </div>
      <div style="display: flex; gap: 10px;">
        <el-button circle @click="showSearch = !showSearch">
          <el-icon><Search /></el-icon>
        </el-button>
        <el-button circle @click="getList">
          <el-icon><Refresh /></el-icon>
        </el-button>
      </div>
    </el-row>

    <!-- 统计面板 -->
    <el-card v-show="showStats" class="mb8">
      <div class="stats-container">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">¥{{ stats.summary.totalAmount || 0 }}</div>
              <div class="stat-label">总成本</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ stats.summary.totalCount || 0 }}</div>
              <div class="stat-label">总记录数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">¥{{ (stats.summary.averageAmount || 0).toFixed(2) }}</div>
              <div class="stat-label">平均金额</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ stats.upcomingRenewals?.length || 0 }}</div>
              <div class="stat-label">即将到期</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="costList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        
        <el-table-column label="域名" align="center" min-width="180">
          <template #default="{ row }">
            <span class="domain-name">{{ row.domain.domainName }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="成本类型" align="center" width="100">
          <template #default="{ row }">
            <el-tag :type="getCostTypeTagType(row.costType)">
              {{ getCostTypeLabel(row.costType) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="金额" align="center" width="120">
          <template #default="{ row }">
            <span class="cost-amount">¥{{ row.amount }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="成本日期" align="center" width="120">
          <template #default="{ row }">
            <span>{{ dayjs(row.costDate).format('YYYY-MM-DD') }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="续费年数" align="center" width="100">
          <template #default="{ row }">
            <span v-if="row.renewalYears">{{ row.renewalYears }}年</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        
        <el-table-column label="备注" align="center" min-width="150">
          <template #default="{ row }">
            <span v-if="row.notes" class="cost-notes">{{ row.notes }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        
        <el-table-column label="创建时间" align="center" width="160">
          <template #default="{ row }">
            <span>{{ dayjs(row.createdAt).format('YYYY-MM-DD HH:mm') }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" align="center" fixed="right" width="150">
          <template #default="scope">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
            <el-button 
              link 
              type="primary" 
              icon="Delete" 
              @click="handleDelete(scope.row)"
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
          :current-page="queryParams.pageNum"
          :page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 30, 40]"
          :total="total"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加或修改成本对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="costRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="域名" prop="domainId">
          <el-select 
            v-model="form.domainId" 
            placeholder="请选择域名" 
            filterable 
            style="width: 100%"
          >
            <el-option
              v-for="domain in options.domains"
              :key="domain.id"
              :label="domain.domainName"
              :value="domain.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="成本类型" prop="costType">
          <el-select v-model="form.costType" placeholder="请选择成本类型" style="width: 100%">
            <el-option
              v-for="type in options.costTypeOptions"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="金额" prop="amount">
              <el-input-number
                v-model="form.amount"
                :precision="2"
                :min="0"
                placeholder="请输入金额"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="成本日期" prop="costDate">
              <el-date-picker
                v-model="form.costDate"
                type="date"
                placeholder="选择成本日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="续费年数" prop="renewalYears" v-if="form.costType === 'renewal'">
          <el-input-number
            v-model="form.renewalYears"
            :min="1"
            :max="10"
            placeholder="请输入续费年数"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="备注" prop="notes">
          <el-input
            v-model="form.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="DomainCost">
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

definePageMeta({
  layout: 'admin',
  title: '域名成本管理',
  middleware: 'auth'
})

useHead({
  title: '域名成本管理 - DMS 管理后台'
})

// refs
const queryRef = ref()
const costRef = ref()

// 响应式数据
const costList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const showStats = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const dateRange = ref([])
const options = ref({
  domains: [],
  costTypeOptions: []
})
const stats = ref({
  summary: {},
  upcomingRenewals: []
})

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    domainId: null,
    costType: null,
    startDate: null,
    endDate: null
  },
  rules: {
    domainId: [
      { required: true, message: '请选择域名', trigger: 'change' }
    ],
    costType: [
      { required: true, message: '请选择成本类型', trigger: 'change' }
    ],
    amount: [
      { required: true, message: '请输入金额', trigger: 'blur' }
    ],
    costDate: [
      { required: true, message: '请选择成本日期', trigger: 'change' }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

// 获取成本列表
async function getList() {
  loading.value = true
  try {
    const response = await $fetch('/api/admin/domain-costs/list', {
      query: {
        page: queryParams.value.pageNum,
        limit: queryParams.value.pageSize,
        domainId: queryParams.value.domainId,
        costType: queryParams.value.costType,
        startDate: queryParams.value.startDate,
        endDate: queryParams.value.endDate
      }
    })
    
    if (response.code === 200) {
      costList.value = response.data.costs
      total.value = response.data.pagination?.total || 0
    } else {
      ElMessage.error(response.message || '获取成本列表失败')
    }
  } catch (error) {
    console.error('获取成本列表失败:', error)
    ElMessage.error('获取成本列表失败')
  } finally {
    loading.value = false
  }
}

// 获取选项数据
async function getOptions() {
  try {
    const response = await $fetch('/api/admin/domain-costs/options')
    if (response.code === 200) {
      options.value = response.data
    }
  } catch (error) {
    console.error('获取选项数据失败:', error)
  }
}

// 获取统计数据
async function getStats() {
  try {
    const response = await $fetch('/api/admin/domain-costs/stats')
    if (response.code === 200) {
      stats.value = response.data
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    domainId: null,
    costType: null,
    amount: null,
    costDate: null,
    renewalYears: null,
    notes: null
  }
  if (costRef.value) {
    costRef.value.resetFields()
  }
}

// 处理日期范围变化
function handleDateRangeChange(range) {
  if (range && range.length === 2) {
    queryParams.value.startDate = range[0]
    queryParams.value.endDate = range[1]
  } else {
    queryParams.value.startDate = null
    queryParams.value.endDate = null
  }
}

// 搜索按钮操作
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

// 重置按钮操作
function resetQuery() {
  if (queryRef.value) {
    queryRef.value.resetFields()
  }
  dateRange.value = []
  queryParams.value.startDate = null
  queryParams.value.endDate = null
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

// 新增按钮操作
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加成本记录'
}

// 修改按钮操作
function handleUpdate(row) {
  reset()
  
  // 设置表单数据
  form.value = {
    id: row.id,
    domainId: row.domainId,
    costType: row.costType,
    amount: parseFloat(row.amount),
    costDate: row.costDate,
    renewalYears: row.renewalYears,
    notes: row.notes
  }
  
  open.value = true
  title.value = '修改成本记录'
}

// 提交按钮
function submitForm() {
  if (!costRef.value) return
  
  costRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await $fetch('/api/admin/domain-costs/save', {
          method: 'POST',
          body: form.value
        })
        
        if (response.code === 200) {
          ElMessage.success(response.message || '操作成功')
          open.value = false
          getList()
          getStats() // 刷新统计数据
        } else {
          ElMessage.error(response.message || '操作失败')
        }
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error('操作失败')
      }
    }
  })
}

// 删除按钮操作
function handleDelete(row) {
  const costIds = row?.id ? [row.id] : ids.value
  const costInfo = row?.id ? 
    `${row.domain.domainName} 的 ${getCostTypeLabel(row.costType)} 记录` : 
    `${costIds.length} 条成本记录`
  
  ElMessageBox.confirm(
    `是否确认删除 ${costInfo}？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const deletePromises = costIds.map(id => 
        $fetch('/api/admin/domain-costs/delete', { 
          method: 'POST',
          body: { id }
        })
      )
      
      const responses = await Promise.all(deletePromises)
      
      const hasError = responses.some(response => response.code !== 200)
      if (hasError) {
        ElMessage.error('部分记录删除失败')
      } else {
        ElMessage.success('删除成功')
      }
      getList()
      getStats() // 刷新统计数据
    } catch (error) {
      console.error('删除成本记录失败:', error)
      ElMessage.error('删除成本记录失败')
      getList()
      getStats()
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 取消按钮
function cancel() {
  open.value = false
  reset()
}

// 改变页面大小
function handleSizeChange(val) {
  queryParams.value.pageSize = val
  getList()
}

// 改变当前页码
function handleCurrentChange(val) {
  queryParams.value.pageNum = val
  getList()
}

// 获取成本类型标签样式
function getCostTypeTagType(type) {
  const typeMap = {
    purchase: 'primary',   // 购买
    renewal: 'success',    // 续费
    transfer: 'warning',   // 转移
    protection: 'info',    // 隐私保护
    other: 'default'       // 其他
  }
  return typeMap[type] || 'default'
}

// 获取成本类型标签文本
function getCostTypeLabel(type) {
  const typeMap = {
    purchase: '购买',
    renewal: '续费',
    transfer: '转移',
    protection: '隐私保护',
    other: '其他'
  }
  return typeMap[type] || type
}

// 页面加载时获取数据
onMounted(async () => {
  await getOptions()
  getList()
  getStats()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.search-panel {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
}

.mb8 {
  margin-bottom: 8px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.text-gray-400 {
  color: #9ca3af;
}

.dialog-footer {
  text-align: right;
}

.stats-container {
  padding: 20px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.domain-name {
  font-weight: 500;
  color: #409eff;
}

.cost-amount {
  font-weight: 600;
  color: #67c23a;
}

.cost-notes {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}
</style> 