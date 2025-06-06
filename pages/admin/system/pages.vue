<template>
  <div class="app-container">
    <!-- 搜索面板 -->
    <el-card v-show="showSearch" class="search-panel">
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="100px">
        <el-form-item label="页面标题" prop="title" style="width: 280px">
          <el-input v-model="queryParams.title" placeholder="请输入页面标题" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="URL别名" prop="slug" style="width: 280px">
          <el-input v-model="queryParams.slug" placeholder="请输入URL别名" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="状态" prop="status" style="width: 280px">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option label="已发布" value="published" />
            <el-option label="草稿" value="draft" />
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
      <el-table v-loading="loading" :data="staticPageList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="页面标题" align="center" prop="title" min-width="200" />
        <el-table-column label="链接地址" align="center" min-width="200">
          <template #default="{ row }">
            <!-- 内部页面显示站内链接 -->
            <template v-if="row.linkType === 'internal'">
              <el-link :href="`/pages/${row.slug}`" target="_blank" type="primary">
                /{{'pages/'+ row.slug }}
              </el-link>
            </template>
            <!-- 外部链接显示完整URL -->
            <template v-else-if="row.linkType === 'external'">
              <el-link :href="row.externalUrl" :target="row.openInNewTab ? '_blank' : '_self'" type="warning">
                {{ row.externalUrl }}
              </el-link>
            </template>
            <!-- 兜底情况 -->
            <template v-else>
              <span class="text-gray-400">-</span>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="链接类型" align="center" prop="linkType" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.linkType === 'external'" type="warning">外部链接</el-tag>
            <el-tag v-else type="primary">内部页面</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" prop="status" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'published'" type="success">已发布</el-tag>
            <el-tag v-else type="info">草稿</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="排序" align="center" prop="sortOrder" width="80" />
        <el-table-column label="SEO标题" align="center" prop="metaTitle" min-width="150">
          <template #default="{ row }">
            <span v-if="row.metaTitle">{{ row.metaTitle }}</span>
            <span v-else class="text-gray-400">-</span>
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

    <!-- 添加或修改静态页对话框 -->
    <el-dialog :title="title" v-model="open" width="1000px" append-to-body>
      <el-form ref="staticPageRef" :model="form" :rules="rules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="页面标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入页面标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12"  v-if="form.linkType == 'internal'">
            <el-form-item label="URL别名" prop="slug">
              <el-input v-model="form.slug" placeholder="如：about-us" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="链接类型" prop="linkType">
              <el-select v-model="form.linkType" placeholder="请选择链接类型" @change="handleLinkTypeChange">
                <el-option label="内部页面" value="internal" />
                <el-option label="外部链接" value="external" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择状态">
                <el-option label="已发布" value="published" />
                <el-option label="草稿" value="draft" />
              </el-select>
            </el-form-item>
          </el-col>
          
        </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
            <el-form-item label="排序" prop="sortOrder">
              <el-input-number v-model="form.sortOrder" :min="0" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 外部链接配置 -->
        <template v-if="form.linkType === 'external'">
          <el-row :gutter="20">
            <el-col :span="18">
              <el-form-item label="外部链接URL" prop="externalUrl">
                <el-input v-model="form.externalUrl" placeholder="https://example.com" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="新窗口打开">
                <el-switch v-model="form.openInNewTab" />
              </el-form-item>
            </el-col>
          </el-row>
        </template>

        <el-row :gutter="20"  v-if="form.linkType == 'internal'">
          <el-col :span="12">
            <el-form-item label="SEO标题" prop="metaTitle">
              <el-input v-model="form.metaTitle" placeholder="用于SEO优化的标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="SEO描述" prop="metaDescription">
              <el-input 
                v-model="form.metaDescription" 
                placeholder="用于SEO优化的描述"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 内部页面内容 -->
        <template v-if="form.linkType === 'internal'">
          <el-form-item label="页面内容" prop="content">
            <el-input 
              v-model="form.content" 
              type="textarea" 
              :rows="15"
              placeholder="请输入页面内容（支持HTML）"
            />
          </el-form-item>
        </template>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog title="页面预览" v-model="previewOpen" width="800px" append-to-body>
      <div class="preview-container">
        <div class="preview-header">
          <h1>{{ previewData.title }}</h1>
          <p class="preview-url">URL: /{{ previewData.slug }}</p>
        </div>
        <div class="preview-content" v-html="previewData.content"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="StaticPages">
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

definePageMeta({
  layout: 'admin',
  title: '页面管理',
  middleware: 'auth'
})

useHead({
  title: '页面管理 - DMS 管理后台'
})

// refs
const queryRef = ref()
const staticPageRef = ref()

// 响应式数据
const staticPageList = ref([])
const open = ref(false)
const previewOpen = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const previewData = ref({})

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    title: null,
    slug: null,
    status: null
  },
  rules: {
    title: [
      { required: true, message: '页面标题不能为空', trigger: 'blur' },
      { min: 1, max: 255, message: '标题长度在 1 到 255 个字符', trigger: 'blur' }
    ],
    slug: [
      { 
        validator: (rule, value, callback) => {
          if (form.value.linkType === 'internal' && !value) {
            callback(new Error('URL别名不能为空'))
          } else if (form.value.linkType === 'internal' && value && !/^[a-z0-9-]+$/.test(value)) {
            callback(new Error('URL别名只能包含小写字母、数字和连字符'))
          } else {
            callback()
          }
        }, 
        trigger: 'blur' 
      }
    ],
    linkType: [
      { required: true, message: '请选择链接类型', trigger: 'change' }
    ],
    externalUrl: [
      { 
        validator: (rule, value, callback) => {
          if (form.value.linkType === 'external' && !value) {
            callback(new Error('外部链接URL不能为空'))
          } else if (form.value.linkType === 'external' && value && !/^https?:\/\/.+/.test(value)) {
            callback(new Error('请输入有效的URL格式（必须以http://或https://开头）'))
          } else {
            callback()
          }
        }, 
        trigger: 'blur' 
      }
    ],
    content: [
      { 
        validator: (rule, value, callback) => {
          if (form.value.linkType === 'internal' && !value) {
            callback(new Error('页面内容不能为空'))
          } else {
            callback()
          }
        }, 
        trigger: 'blur' 
      }
    ],
    status: [
      { required: true, message: '请选择状态', trigger: 'change' }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

// 获取静态页列表
async function getList() {
  loading.value = true
  try {
    const response = await $fetch('/api/admin/static-pages/list', {
      query: {
        page: queryParams.value.pageNum,
        limit: queryParams.value.pageSize,
        search: queryParams.value.title || queryParams.value.slug,
        status: queryParams.value.status
      }
    })
    
    // 通过code字段判断成功失败
    if (response.code === 200) {
      staticPageList.value = response.data.staticPages
      total.value = response.data.pagination?.total || 0
    } else {
      ElMessage.error(response.message || '获取静态页列表失败')
    }
  } catch (error) {
    console.error('获取静态页列表失败:', error)
    ElMessage.error('获取静态页列表失败')
  } finally {
    loading.value = false
  }
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    title: null,
    slug: null,
    content: null,
    linkType: 'internal',
    externalUrl: null,
    openInNewTab: false,
    metaTitle: null,
    metaDescription: null,
    status: 'published',
    sortOrder: 0
  }
  staticPageRef.value?.resetFields()
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
  title.value = '添加静态页'
}

// 修改按钮操作
async function handleUpdate(row) {
  reset()
  
  try {
    // 调用详情接口获取完整数据
    const response = await $fetch(`/api/admin/static-pages/${row.id}`)
    
    if (response.code === 200) {
      const staticPage = response.data
      form.value = { 
        id: staticPage.id,
        title: staticPage.title,
        slug: staticPage.slug,
        content: staticPage.content,
        linkType: staticPage.linkType || 'internal',
        externalUrl: staticPage.externalUrl,
        openInNewTab: staticPage.openInNewTab || false,
        metaTitle: staticPage.metaTitle,
        metaDescription: staticPage.metaDescription,
        status: staticPage.status,
        sortOrder: staticPage.sortOrder
      }
      open.value = true
      title.value = '修改静态页'
    } else {
      ElMessage.error(response.message || '获取静态页详情失败')
    }
  } catch (error) {
    console.error('获取静态页详情失败:', error)
    ElMessage.error('获取静态页详情失败')
  }
}

// 预览按钮操作
function handlePreview(row) {
  previewData.value = row
  previewOpen.value = true
}

// 链接类型切换处理
function handleLinkTypeChange(value) {
  if (value === 'external') {
    form.value.content = null
    form.value.slug = null // 外部链接不需要slug
    form.value.metaTitle = null // 外部链接不需要SEO字段
    form.value.metaDescription = null
  } else {
    form.value.externalUrl = null
    form.value.openInNewTab = false
  }
}

// 提交按钮
function submitForm() {
  staticPageRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        // 统一使用save接口，通过是否有id来判断新增还是编辑
        const response = await $fetch('/api/admin/static-pages/save', {
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
  const pageIds = row?.id || ids.value
  const pageNames = Array.isArray(pageIds) 
    ? staticPageList.value.filter(item => pageIds.includes(item.id)).map(item => item.title).join('、')
    : row?.title

  try {
    await ElMessageBox.confirm(
      `是否确认删除静态页"${pageNames}"？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    if (Array.isArray(pageIds)) {
      // 批量删除
      const deletePromises = pageIds.map(id => 
        $fetch('/api/admin/static-pages/delete', { 
          method: 'POST',
          body: { id }
        })
      )
      const responses = await Promise.all(deletePromises)
      
      // 检查所有响应的code字段
      const hasError = responses.some(response => response.code !== 200)
      if (hasError) {
        ElMessage.error('部分静态页删除失败')
      } else {
        ElMessage.success('删除成功')
      }
    } else {
      // 单个删除
      const response = await $fetch('/api/admin/static-pages/delete', { 
        method: 'POST',
        body: { id: pageIds }
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
    console.error('删除静态页失败:', error)
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

.preview-container {
  .preview-header {
    border-bottom: 1px solid #ebeef5;
    padding-bottom: 15px;
    margin-bottom: 20px;
    
    h1 {
      margin: 0 0 5px 0;
      font-size: 24px;
      color: #303133;
    }
    
    .preview-url {
      margin: 0;
      color: #909399;
      font-size: 14px;
    }
  }
  
  .preview-content {
    line-height: 1.6;
    color: #606266;
  }
}

.text-gray-400 {
  color: #c0c4cc;
}
</style> 