<template>
  <div class="app-container">
    <!-- 搜索面板 -->
    <el-card v-show="showSearch" class="search-panel">
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="100px">
      <el-form-item label="分类名称" prop="name" style="width: 280px">
        <el-input v-model="queryParams.name" placeholder="请输入分类名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="描述" prop="description" style="width: 280px">
        <el-input v-model="queryParams.description" placeholder="请输入描述" clearable @keyup.enter="handleQuery" />
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
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
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
      <el-table v-loading="loading" :data="categoryList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="分类名称" align="center" prop="name" min-width="150" />
        <el-table-column label="描述" align="center" prop="description" min-width="200">
          <template #default="{ row }">
            <span v-if="row.description">{{ row.description }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column label="排序" align="center" prop="sortOrder" width="100">
          <template #default="{ row }">
            <el-tag type="info">{{ row.sortOrder || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="域名数量" align="center" prop="domainCount" width="120">
          <template #default="{ row }">
            <el-tag v-if="row._count?.domains > 0" type="success">{{ row._count.domains }}</el-tag>
            <el-tag v-else type="info">0</el-tag>
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
            <el-button 
              link 
              type="primary" 
              icon="Delete" 
              @click="handleDelete(scope.row)"
              :disabled="scope.row._count?.domains > 0"
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

    <!-- 添加或修改分类对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="categoryRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入分类描述"
          />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number 
            v-model="form.sortOrder" 
            :min="0"
            :max="9999"
            placeholder="请输入排序值（数字越小越靠前）"
            style="width: 100%"
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

<script setup name="Category">
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

definePageMeta({
  layout: 'admin',
  title: '域名分类管理',
  middleware: 'auth'
})

useHead({
  title: '域名分类管理 - DMS 管理后台'
})

// refs
const queryRef = ref()
const categoryRef = ref()

// 响应式数据
const categoryList = ref([])
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
    description: null
  },
  rules: {
    name: [
      { required: true, message: '分类名称不能为空', trigger: 'blur' },
      { min: 1, max: 100, message: '名称长度在 1 到 100 个字符', trigger: 'blur' }
    ],
    description: [
      { max: 1000, message: '描述不能超过 1000 个字符', trigger: 'blur' }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

// 获取分类列表
async function getList() {
  loading.value = true
  try {
    const response = await $fetch('/api/admin/categories/list', {
      query: {
        page: queryParams.value.pageNum,
        limit: queryParams.value.pageSize,
        search: queryParams.value.name || queryParams.value.description
      }
    })
    
    // 通过code字段判断成功失败
    if (response.code === 200) {
      categoryList.value = response.data.categories
      total.value = response.data.pagination?.total || 0
    } else {
      ElMessage.error(response.message || '获取分类列表失败')
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败')
  } finally {
    loading.value = false
  }
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    name: null,
    description: null,
    sortOrder: 0
  }
  if (categoryRef.value) {
    categoryRef.value.resetFields()
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
  title.value = '添加域名分类'
}

// 修改按钮操作
async function handleUpdate(row) {
  reset()
  const id = row?.id || ids.value[0]
  
  // 直接设置表单数据，不需要额外的详情接口
  form.value = { 
    id: row.id,
    name: row.name, 
    description: row.description,
    sortOrder: row.sortOrder || 0
  }
  open.value = true
  title.value = '修改域名分类'
}

// 提交按钮
function submitForm() {
  if (!categoryRef.value) return
  
  categoryRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 统一使用save接口，通过是否有id来判断新增还是编辑
        const response = await $fetch('/api/admin/categories/save', {
          method: 'POST',
          body: {
            id: form.value.id,
            name: form.value.name,
            description: form.value.description,
            sortOrder: form.value.sortOrder || 0
          }
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
        console.error('操作失败:', error)
        ElMessage.error('操作失败')
      }
    }
  })
}

// 删除按钮操作
function handleDelete(row) {
  const categoryIds = row?.id ? [row.id] : ids.value
  const categoryNames = row?.name ? [row.name] : categoryList.value.filter(item => categoryIds.includes(item.id)).map(item => item.name)
  
  // 检查是否有域名在使用
  const hasDomainsUsing = row?._count?.domains > 0 || categoryList.value.filter(item => categoryIds.includes(item.id)).some(item => item._count?.domains > 0)
  
  if (hasDomainsUsing) {
    ElMessage.warning('选中的分类中有正在使用的分类，无法删除')
    return
  }
  
  ElMessageBox.confirm(
    `是否确认删除分类 "${categoryNames.join('、')}"？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // 执行删除
      const deletePromises = categoryIds.map(id => 
        $fetch('/api/admin/categories/delete', { 
          method: 'POST',
          body: { id }
        })
      )
      
      const responses = await Promise.all(deletePromises)
      
      // 检查所有响应的code字段
      const hasError = responses.some(response => response.code !== 200)
      if (hasError) {
        ElMessage.error('部分分类删除失败')
      } else {
        ElMessage.success('删除成功')
      }
      getList()
    } catch (error) {
      console.error('删除分类失败:', error)
      ElMessage.error('删除分类失败')
      getList() // 刷新列表
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

// 页面加载时获取数据
onMounted(() => {
  getList()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.text-gray-400 {
  color: #9ca3af;
}
</style> 