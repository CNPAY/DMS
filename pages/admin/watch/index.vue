<template>
  <div class="app-container">
    <!-- 搜索面板 -->
    <el-card v-show="showSearch" class="search-panel">
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="80px">
      <el-form-item label="域名" prop="domainName" style="width: 280px">
        <el-input v-model="queryParams.domainName" placeholder="请输入域名" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="监控级别" prop="monitoringLevel" style="width: 280px">
        <el-select v-model="queryParams.monitoringLevel" placeholder="请选择监控级别" clearable>
          <el-option
            v-for="level in monitoringLevels"
            :key="level.value"
            :label="level.label"
            :value="level.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="通知设置" prop="notifyOnChange" style="width: 280px">
        <el-select v-model="queryParams.notifyOnChange" placeholder="请选择通知设置" clearable>
          <el-option
            v-for="option in notifyOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    </el-card>

    <!-- 操作栏 -->
    <el-row class="mb8" style="display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex;">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate">修改</el-button>
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">删除</el-button>
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
    <el-card>
      <el-table v-loading="loading" :data="watchedList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="域名" align="center" prop="domainName" min-width="200">
          <template #default="{ row }">
            <span class="domain-name">{{ row.domainName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="监控级别" align="center" prop="monitoringLevel" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.monitoringLevel" :type="getMonitoringLevelType(row.monitoringLevel)">
              {{ getMonitoringLevelLabel(row.monitoringLevel) }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="最后检查" align="center" prop="lastWhoisCheck" width="150">
          <template #default="{ row }">
            <span v-if="row.lastWhoisCheck">
              {{ dayjs(row.lastWhoisCheck).format('YYYY-MM-DD HH:mm:ss') }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="通知设置" align="center" prop="notifyOnChange" width="100">
          <template #default="{ row }">
            <el-tag :type="row.notifyOnChange ? 'success' : 'info'">
              {{ row.notifyOnChange ? '开启' : '关闭' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="notes" min-width="200">
          <template #default="{ row }">
            <span v-if="row.notes">{{ row.notes }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
          <template #default="{ row }">
            <span>{{ dayjs(row.createdAt).format('YYYY-MM-DD HH:mm:ss') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding" fixed="right" width="200">
          <template #default="scope">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
            <el-button link type="success" @click="handleWhoisCheck(scope.row)">WHOIS</el-button>
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
    </el-card>

    <!-- 添加或修改关注域名对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="watchedRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="域名" prop="domainName">
          <el-input v-model="form.domainName" placeholder="请输入域名，如：example.com" />
        </el-form-item>
        <el-form-item label="监控级别" prop="monitoringLevel">
          <el-select v-model="form.monitoringLevel" placeholder="请选择监控级别" clearable style="width: 100%">
            <el-option
              v-for="level in monitoringLevels"
              :key="level.value"
              :label="level.label"
              :value="level.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="通知设置" prop="notifyOnChange">
          <el-switch
            v-model="form.notifyOnChange"
            active-text="开启通知"
            inactive-text="关闭通知"
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

<script setup name="Watch">
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

definePageMeta({
  layout: 'admin',
  title: '关注域名管理',
  middleware: 'auth'
})

useHead({
  title: '关注域名管理 - DMS 管理后台'
})

// refs
const queryRef = ref()
const watchedRef = ref()

// 响应式数据
const watchedList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    domainName: null,
    monitoringLevel: null,
    notifyOnChange: null
  },
  rules: {
    domainName: [
      { required: true, message: '域名不能为空', trigger: 'blur' },
      { 
        pattern: /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/,
        message: '域名格式不正确',
        trigger: 'blur'
      }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

// 选项数据
const monitoringLevels = ref([])
const notifyOptions = ref([])

// 获取关注域名列表
async function getList() {
  loading.value = true
  try {
    const response = await $fetch('/api/admin/watch/list', {
      query: {
        page: queryParams.value.pageNum,
        limit: queryParams.value.pageSize,
        search: queryParams.value.domainName,
        monitoringLevel: queryParams.value.monitoringLevel,
        notifyOnChange: queryParams.value.notifyOnChange
      }
    })
    
    if (response.code === 200) {
      watchedList.value = response.data.watchedDomains
      total.value = response.data.pagination?.total || 0
    } else {
      ElMessage.error(response.message || '获取关注域名列表失败')
    }
  } catch (error) {
    console.error('获取关注域名列表失败:', error)
    ElMessage.error('获取关注域名列表失败')
  } finally {
    loading.value = false
  }
}

// 加载选项数据
async function loadOptions() {
  try {
    const response = await $fetch('/api/admin/watch/options')
    if (response.code === 200) {
      monitoringLevels.value = response.data.monitoringLevels
      notifyOptions.value = response.data.notifyOptions
    }
  } catch (error) {
    console.error('加载选项数据失败:', error)
  }
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    domainName: null,
    monitoringLevel: null,
    notifyOnChange: true,
    notes: null
  }
  watchedRef.value?.resetFields()
}

// 搜索按钮操作
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

// 重置按钮操作
function resetQuery() {
  queryRef.value?.resetFields()
  handleQuery()
}

// 列表多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

// 新增按钮操作
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加关注域名'
}

// 修改按钮操作
async function handleUpdate(row) {
  reset()
  
  form.value = { 
    id: row.id,
    domainName: row.domainName,
    monitoringLevel: row.monitoringLevel,
    notifyOnChange: row.notifyOnChange,
    notes: row.notes
  }
  open.value = true
  title.value = '修改关注域名'
}

// 提交按钮
function submitForm() {
  watchedRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        const response = await $fetch('/api/admin/watch/save', {
          method: 'POST',
          body: form.value
        })
        
        if (response.code === 200) {
          ElMessage.success(response.message || '操作成功')
          open.value = false
          getList()
        } else {
          ElMessage.error(response.message || '操作失败')
        }
      } catch (error) {
        console.error('保存失败:', error)
        ElMessage.error('保存失败')
      }
    }
  })
}

// 取消按钮
function cancel() {
  open.value = false
  reset()
}

// 删除按钮操作
async function handleDelete(row) {
  const domainIds = row?.id || ids.value
  const domainNames = Array.isArray(domainIds) 
    ? watchedList.value.filter(item => domainIds.includes(item.id)).map(item => item.domainName).join('、')
    : row?.domainName

  try {
    await ElMessageBox.confirm(
      `是否确认删除关注域名"${domainNames}"？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    if (Array.isArray(domainIds)) {
      // 批量删除
      const deletePromises = domainIds.map(id => 
        $fetch('/api/admin/watch/delete', { 
          method: 'POST',
          body: { id }
        })
      )
      const responses = await Promise.all(deletePromises)
      
      const hasError = responses.some(response => response.code !== 200)
      if (hasError) {
        ElMessage.error('部分关注域名删除失败')
      } else {
        ElMessage.success('删除成功')
      }
    } else {
      // 单个删除
      const response = await $fetch('/api/admin/watch/delete', { 
        method: 'POST',
        body: { id: domainIds }
      })
      
      if (response.code === 200) {
        ElMessage.success('删除成功')
      } else {
        ElMessage.error(response.message || '删除失败')
      }
    }

    getList()
  } catch (error) {
    if (error === 'cancel') return
    console.error('删除关注域名失败:', error)
    ElMessage.error('删除失败')
  }
}

// WHOIS检查
async function handleWhoisCheck(row) {
  try {
    ElMessage.info(`正在检查域名 ${row.domainName} 的WHOIS信息...`)
    await navigateTo(`/admin/whois?domain=${row.domainName}`)
  } catch (error) {
    console.error('WHOIS检查失败:', error)
    ElMessage.error('WHOIS检查失败')
  }
}

// 导出按钮操作
function handleExport() {
  console.log('导出功能暂未实现')
  ElMessage.info('导出功能开发中...')
}

// 分页-每页大小改变
function handleSizeChange(val) {
  queryParams.value.pageSize = val
  getList()
}

// 分页-当前页改变
function handleCurrentChange(val) {
  queryParams.value.pageNum = val
  getList()
}

// 获取监控级别类型
function getMonitoringLevelType(level) {
  const typeMap = {
    'basic': 'info',
    'standard': 'warning',
    'advanced': 'success',
    'premium': 'danger'
  }
  return typeMap[level] || 'info'
}

// 获取监控级别标签
function getMonitoringLevelLabel(level) {
  const label = monitoringLevels.value.find(item => item.value === level)
  return label?.label || level
}

// 初始化
loadOptions()
getList()
</script>

<style scoped lang="scss">
.domain-name {
  font-family: monospace;
  font-weight: 600;
  color: #409eff;
}

.dialog-footer {
  text-align: right;
}
</style> 