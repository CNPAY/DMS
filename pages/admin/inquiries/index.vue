<template>
  <div class="app-container">
    <!-- 搜索面板 -->
    <el-form :model="queryParams" class="search-panel" ref="queryRef" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="关键词" prop="search" style="width: 280px">
        <el-input v-model="queryParams.search" placeholder="请输入潜客姓名/邮箱/域名" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="询盘状态" prop="status">
        <el-segmented v-model="queryParams.status" :options="segmentedStatusOptions" @change="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作栏 -->
    <el-row class="mb8" style="display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex;">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
        <el-button type="warning" plain icon="Download" @click="handleExport">导出</el-button>
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

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="inquiryList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="潜客信息" align="center" min-width="200">
        <template #default="{ row }">
          <div style="text-align: left;">
            <div style="font-weight: bold;">{{ row.visitorName || '未填写' }}</div>
            <div style="color: #666;">{{ row.visitorEmail }}</div>
            <div v-if="row.visitorPhone" style="color: #999; font-size: 12px;">{{ row.visitorPhone }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="相关域名" align="center" prop="domain" min-width="150">
        <template #default="{ row }">
          <span v-if="row.domain">{{ row.domain.domainName }}</span>
          <span v-else-if="row.portfolio">米表: {{ row.portfolio.name }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="报价" align="center" prop="offerPrice" min-width="120">
        <template #default="{ row }">
          <span v-if="row.offerPrice" style="color: #67C23A; font-weight: bold;">
            ${{ Number(row.offerPrice).toLocaleString() }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="询盘状态" align="center" prop="status" min-width="120">
        <template #default="{ row }">
          <el-tag 
            :type="getStatusType(row.status)"
            size="small"
          >
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="询盘内容" align="center" prop="message" min-width="200">
        <template #default="{ row }">
          <el-tooltip :content="row.message" placement="top">
            <span>{{ truncateText(row.message, 50) }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="提交时间" align="center" prop="submittedAt" width="180">
        <template #default="{ row }">
          <span>{{ dayjs(row.submittedAt).format('YYYY-MM-DD HH:mm:ss') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding" fixed="right" width="250">
        <template #default="scope">
          <el-dropdown @command="(command) => handleStatusChange(scope.row, command)">
            <el-button link type="primary" icon="Edit">
              更新状态<el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item 
                  v-for="status in statusOptions" 
                  :key="status.value"
                  :command="status.value"
                  :disabled="scope.row.status === status.value"
                >
                  {{ status.label }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button link type="primary" icon="View" @click="handleDetail(scope.row)">详情</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
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

    <!-- 询盘详情对话框 -->
    <el-dialog title="询盘详情" v-model="detailOpen" width="800px" append-to-body>
      <div v-if="currentInquiry">
        <el-descriptions :column="2" border label-width="100px">
          <el-descriptions-item label="潜客姓名">
            {{ currentInquiry.visitorName || '未填写' }}
          </el-descriptions-item>
          <el-descriptions-item label="潜客邮箱">
            {{ currentInquiry.visitorEmail }}
          </el-descriptions-item>
          <el-descriptions-item label="潜客电话">
            {{ currentInquiry.visitorPhone || '未填写' }}
          </el-descriptions-item>
          <el-descriptions-item label="相关域名">
            <span v-if="currentInquiry.domain">{{ currentInquiry.domain.domainName }}</span>
            <span v-else-if="currentInquiry.portfolio">米表: {{ currentInquiry.portfolio.name }}</span>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="报价">
            <span v-if="currentInquiry.offerPrice" style="color: #67C23A; font-weight: bold;">
              ${{ Number(currentInquiry.offerPrice).toLocaleString() }}
            </span>
            <span v-else>未报价</span>
          </el-descriptions-item>
          <el-descriptions-item label="询盘状态">
            <el-tag :type="getStatusType(currentInquiry.status)" size="small">
              {{ getStatusLabel(currentInquiry.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="IP地址">
            {{ currentInquiry.ipAddress || '未记录' }}
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">
            {{ dayjs(currentInquiry.submittedAt).format('YYYY-MM-DD HH:mm:ss') }}
          </el-descriptions-item>
          <el-descriptions-item label="询盘内容" :span="2">
            <div style="white-space: pre-wrap;">{{ currentInquiry.message }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="用户代理" :span="2">
            <div style="word-break: break-all; font-size: 12px; color: #666;">
              {{ currentInquiry.userAgent || '未记录' }}
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailOpen = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Inquiries">
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

definePageMeta({
  layout: 'admin',
  title: '询盘管理',
  middleware: 'auth'
})

useHead({
  title: '询盘管理 - DMS 管理后台'
})

// refs
const queryRef = ref()

// 响应式数据
const inquiryList = ref([])
const statusOptions = ref([])
const segmentedStatusOptions = ref([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const detailOpen = ref(false)
const currentInquiry = ref(null)

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    search: null,
    status: 'new' // 默认为新询盘
  }
})

const { queryParams } = toRefs(data)

// 获取询盘列表
async function getList() {
  loading.value = true
  try {
    const response = await $fetch('/api/admin/inquiries/list', {
      query: {
        page: queryParams.value.pageNum,
        limit: queryParams.value.pageSize,
        search: queryParams.value.search,
        status: queryParams.value.status
      }
    })
    
    if (response.code === 200) {
      inquiryList.value = response.data.inquiries
      total.value = response.data.pagination?.total || 0
    } else {
      ElMessage.error(response.message || '获取询盘列表失败')
    }
  } catch (error) {
    console.error('获取询盘列表失败:', error)
    ElMessage.error('获取询盘列表失败')
  } finally {
    loading.value = false
  }
}

// 获取选项数据
async function getOptions() {
  try {
    const response = await $fetch('/api/admin/inquiries/options')
    if (response.code === 200) {
      statusOptions.value = response.data.statusOptions
      
      // 构建 segmented 组件的选项格式
      segmentedStatusOptions.value = [
        { label: '全部', value: '' },
        ...response.data.statusOptions.map(item => ({
          label: item.label,
          value: item.value
        }))
      ]
    }
  } catch (error) {
    console.error('获取选项数据失败:', error)
  }
}

// 搜索
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

// 重置搜索
function resetQuery() {
  queryRef.value.resetFields()
  queryParams.value.status = 'new' // 重置时回到默认的新询盘状态
  handleQuery()
}

// 多选处理
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

// 分页大小改变
function handleSizeChange(val) {
  queryParams.value.pageSize = val
  getList()
}

// 当前页改变
function handleCurrentChange(val) {
  queryParams.value.pageNum = val
  getList()
}

// 状态改变
async function handleStatusChange(row, status) {
  try {
    const response = await $fetch('/api/admin/inquiries/update-status', {
      method: 'POST',
      body: {
        id: row.id,
        status: status
      }
    })
    
    if (response.code === 200) {
      ElMessage.success('状态更新成功')
      getList()
    } else {
      ElMessage.error(response.message || '状态更新失败')
    }
  } catch (error) {
    console.error('状态更新失败:', error)
    ElMessage.error('状态更新失败')
  }
}

// 查看详情
async function handleDetail(row) {
  try {
    const response = await $fetch(`/api/admin/inquiries/${row.id}`)
    if (response.code === 200) {
      currentInquiry.value = response.data
      detailOpen.value = true
    } else {
      ElMessage.error(response.message || '获取询盘详情失败')
    }
  } catch (error) {
    console.error('获取询盘详情失败:', error)
    ElMessage.error('获取询盘详情失败')
  }
}

// 删除
function handleDelete(row) {
  const inquiryIds = row ? [row.id] : ids.value
  if (inquiryIds.length === 0) {
    ElMessage.warning('请选择要删除的询盘')
    return
  }
  
  ElMessageBox.confirm('是否确认删除选中的询盘数据？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await $fetch('/api/admin/inquiries/delete', {
        method: 'POST',
        body: { ids: inquiryIds }
      })
      
      if (response.code === 200) {
        ElMessage.success('删除成功')
        getList()
      } else {
        ElMessage.error(response.message || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  })
}

// 导出
function handleExport() {
  ElMessage.info('导出功能开发中...')
}

// 状态标签类型
function getStatusType(status) {
  const typeMap = {
    'new': 'primary',
    'contacted': 'warning', 
    'negotiating': 'info',
    'accepted': 'success',
    'rejected': 'danger',
    'closed': 'info'
  }
  return typeMap[status] || 'info'
}

// 状态标签文字
function getStatusLabel(status) {
  const option = statusOptions.value.find(item => item.value === status)
  return option ? option.label : status
}

// 文本截断
function truncateText(text, maxLength) {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

// 初始化
onMounted(() => {
  getOptions()
  getList()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.pagination-container {
  padding: 32px 16px;
  text-align: center;
}

.mb8 {
  margin-bottom: 8px;
}
</style> 