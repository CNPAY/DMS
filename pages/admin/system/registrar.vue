<template>
  <div class="app-container">
    <!-- 搜索面板 -->
    <el-card v-show="showSearch" class="search-panel">
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="100px">
        <el-form-item label="注册商名称" prop="name" style="width: 280px">
          <el-input v-model="queryParams.name" placeholder="请输入注册商名称" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="官网地址" prop="websiteUrl" style="width: 280px">
          <el-input v-model="queryParams.websiteUrl" placeholder="请输入官网地址" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <el-row  class="mb8" style="display: flex; justify-content: space-between; align-items: center;">
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
      <el-table v-loading="loading" :data="registrarList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="注册商名称" align="center" prop="name" min-width="150" />
        <el-table-column label="官网地址" align="center" prop="websiteUrl" min-width="200">
          <template #default="{ row }">
            <el-link v-if="row.websiteUrl" :href="row.websiteUrl" target="_blank" type="primary">
              {{ row.websiteUrl }}
            </el-link>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="登录地址" align="center" prop="loginUrl" min-width="150">
          <template #default="{ row }">
            <el-link v-if="row.loginUrl" :href="row.loginUrl" target="_blank" type="primary">
              登录入口
            </el-link>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="账户ID" align="center" prop="accountId" min-width="120">
          <template #default="{ row }">
            <span v-if="row.accountId">{{ row.accountId }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
          <template #default="{ row }">
            <span>{{ dayjs(row.createdAt).format('YYYY-MM-DD HH:mm:ss') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding" fixed="right" width="160">
          <template #default="scope">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
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

    <!-- 添加或修改注册商对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="registrarRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="注册商名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入注册商名称" />
        </el-form-item>
        <el-form-item label="官网地址" prop="websiteUrl">
          <el-input v-model="form.websiteUrl" placeholder="https://example.com" />
        </el-form-item>
        <el-form-item label="登录地址" prop="loginUrl">
          <el-input v-model="form.loginUrl" placeholder="https://login.example.com" />
        </el-form-item>
        <el-form-item label="账户ID" prop="accountId">
          <el-input v-model="form.accountId" placeholder="请输入账户ID或用户名" />
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

<script setup name="Registrar">
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

definePageMeta({
  layout: 'admin',
  title: '注册商管理',
  middleware: 'auth'
})

useHead({
  title: '注册商管理 - DMS 管理后台'
})

// refs
const queryRef = ref()
const registrarRef = ref()

// 响应式数据
const registrarList = ref([])
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
    name: null,
    websiteUrl: null
  },
  rules: {
    name: [
      { required: true, message: '注册商名称不能为空', trigger: 'blur' },
      { min: 2, max: 50, message: '名称长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    websiteUrl: [
      { type: 'url', message: '请输入有效的网址', trigger: 'blur' }
    ],
    loginUrl: [
      { type: 'url', message: '请输入有效的网址', trigger: 'blur' }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

// 获取注册商列表
async function getList() {
  loading.value = true
  try {
    const response = await $fetch('/api/admin/registrars/list', {
      query: {
        page: queryParams.value.pageNum,
        limit: queryParams.value.pageSize,
        search: queryParams.value.name || queryParams.value.websiteUrl
      }
    })
    
    // 通过code字段判断成功失败
    if (response.code === 200) {
      registrarList.value = response.data.registrars
      total.value = response.data.pagination?.total || 0
    } else {
      ElMessage.error(response.message || '获取注册商列表失败')
    }
  } catch (error) {
    console.error('获取注册商列表失败:', error)
    ElMessage.error('获取注册商列表失败')
  } finally {
    loading.value = false
  }
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    name: null,
    websiteUrl: null,
    loginUrl: null,
    accountId: null,
    notes: null
  }
  registrarRef.value?.resetFields()
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
  title.value = '添加注册商'
}

// 修改按钮操作
async function handleUpdate(row) {
  reset()
  
  // 直接设置表单数据，不需要额外的详情接口
  form.value = { 
    id: row.id,
    name: row.name,
    websiteUrl: row.websiteUrl,
    loginUrl: row.loginUrl,
    accountId: row.accountId,
    notes: row.notes
  }
  open.value = true
  title.value = '修改注册商'
}

// 提交按钮
function submitForm() {
  registrarRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        // 统一使用save接口，通过是否有id来判断新增还是编辑
        const response = await $fetch('/api/admin/registrars/save', {
          method: 'POST',
          body: form.value
        })
        
        // 通过code字段判断成功失败
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
  const registrarIds = row?.id || ids.value
  const registrarNames = Array.isArray(registrarIds) 
    ? registrarList.value.filter(item => registrarIds.includes(item.id)).map(item => item.name).join('、')
    : row?.name

  try {
    await ElMessageBox.confirm(
      `是否确认删除注册商"${registrarNames}"？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    if (Array.isArray(registrarIds)) {
      // 批量删除
      const deletePromises = registrarIds.map(id => 
        $fetch('/api/admin/registrars/delete', { 
          method: 'POST',
          body: { id }
        })
      )
      const responses = await Promise.all(deletePromises)
      
      // 检查所有响应的code字段
      const hasError = responses.some(response => response.code !== 200)
      if (hasError) {
        ElMessage.error('部分注册商删除失败')
      } else {
        ElMessage.success('删除成功')
      }
    } else {
      // 单个删除
      const response = await $fetch('/api/admin/registrars/delete', { 
        method: 'POST',
        body: { id: registrarIds }
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
    console.error('删除注册商失败:', error)
    ElMessage.error('删除失败')
  }
}

// 导出按钮操作
function handleExport() {
  // 这里暂时用console.log代替导出功能
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

// 初始化
getList()
</script>

<style scoped lang="scss">
.dialog-footer {
  text-align: right;
}

</style> 