<template>
  <div class="app-container">
    <!-- 搜索面板 -->
    <el-card v-show="showSearch" class="search-panel">
      <el-form ref="queryRef" :model="queryParams" :inline="true" >
        <el-form-item label="域名" prop="search" style="width: 220px;">
          <el-input
            v-model="queryParams.search"
            placeholder="请输入域名"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        
        <el-form-item label="注册商" prop="registrarId" style="width: 220px;">
          <el-select
            v-model="queryParams.registrarId"
            placeholder="请选择注册商"
            clearable
          >
            <el-option
              v-for="registrar in options.registrars"
              :key="registrar.id"
              :label="registrar.name"
              :value="registrar.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="分类" prop="categoryId" style="width: 220px;">
          <el-select
            v-model="queryParams.categoryId"
            placeholder="请选择分类"
            clearable
          >
            <el-option
              v-for="category in options.categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 工具栏 -->
    <el-row class="mb8" style="display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
        <el-button type="success" plain icon="Upload" @click="handleImport">批量导入</el-button>
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
        
        <!-- 批量操作按钮 -->
        <el-dropdown v-if="selectedDomains.length > 0" @command="handleBatchCommand">
          <el-button type="warning" plain>
            批量操作({{ selectedDomains.length }}) <el-icon><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="batchCategory" icon="FolderOpened">移动分类</el-dropdown-item>
              <el-dropdown-item command="batchPrice" icon="PriceTag">设置价格</el-dropdown-item>
              <el-dropdown-item command="batchWhois" icon="Search">Whois填充</el-dropdown-item>
              <el-dropdown-item command="batchStatus" icon="Switch">修改销售状态</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
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
      <el-table
        v-loading="loading"
        :data="domainList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        
        <el-table-column label="域名" align="center" prop="domainName" min-width="200">
          <template #default="{ row }">
            <el-link type="primary" @click="handleView(row)">{{ row.domainName }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="notes" min-width="200">
          <template #default="{ row }">
            <span v-if="row.notes">{{ row.notes }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        
        <el-table-column label="注册商" align="center" width="120">
          <template #default="{ row }">
            <span v-if="row.registrar">{{ row.registrar.name }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        
        <el-table-column label="分类" align="center" width="120">
          <template #default="{ row }">
            <span v-if="row.category">{{ row.category.name }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        
        <el-table-column label="标签" align="center" width="160">
          <template #default="{ row }">
            <div v-if="row.tags && row.tags.length > 0" class="tag-container">
              <el-tag
                v-for="tagMap in row.tags.slice(0, 2)"
                :key="tagMap.tag.id"
                type="info"
                size="small"
                class="mr-1"
              >
                {{ tagMap.tag.name }}
              </el-tag>
              <el-tag v-if="row.tags.length > 2" type="info" size="small">
                +{{ row.tags.length - 2 }}
              </el-tag>
            </div>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        
        <el-table-column label="购买价格" align="center" width="100">
          <template #default="{ row }">
            <span v-if="row.purchasePrice">¥{{ row.purchasePrice }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        
        <el-table-column label="到期时间" align="center" width="120">
          <template #default="{ row }">
            <span v-if="row.expiryDate">{{ dayjs(row.expiryDate).format('YYYY-MM-DD') }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        
        <el-table-column label="域名状态" align="center" width="100">
          <template #default="{ row }">
            <el-tag :type="getDomainStatusType(row.domainStatus)">
              {{ getDomainStatusLabel(row.domainStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="销售状态" align="center" width="100">
          <template #default="{ row }">
            <el-tag :type="getSalesStatusType(row.salesStatus)">
              {{ getSalesStatusLabel(row.salesStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" align="center" fixed="right" width="180">
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
          :page-sizes="[20, 30, 50, 100, 200, 500, 1000]"
          :total="total"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加或修改域名对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="domainRef" :model="form" :rules="rules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="域名" prop="domainName">
              <el-input v-model="form.domainName" placeholder="请输入域名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="注册商" prop="registrarId">
              <el-select v-model="form.registrarId" placeholder="请选择注册商" clearable style="width: 100%">
                <el-option
                  v-for="registrar in options.registrars"
                  :key="registrar.id"
                  :label="registrar.name"
                  :value="registrar.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="创建时间" prop="creationDate">
              <el-date-picker
                v-model="form.creationDate"
                type="date"
                placeholder="选择创建时间"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="到期时间" prop="expiryDate">
              <el-date-picker
                v-model="form.expiryDate"
                type="date"
                placeholder="选择到期时间"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="购买价格" prop="purchasePrice">
              <el-input-number
                v-model="form.purchasePrice"
                :precision="2"
                :min="0"
                placeholder="请输入购买价格"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" prop="categoryId">
              <el-select v-model="form.categoryId" placeholder="请选择分类" clearable style="width: 100%">
                <el-option
                  v-for="category in options.categories"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="域名状态" prop="domainStatus">
              <el-select v-model="form.domainStatus" placeholder="请选择域名状态" style="width: 100%">
                <el-option
                  v-for="status in options.domainStatusOptions"
                  :key="status.value"
                  :label="status.label"
                  :value="status.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="销售状态" prop="salesStatus">
              <el-select v-model="form.salesStatus" placeholder="请选择销售状态" style="width: 100%">
                <el-option
                  v-for="status in options.salesStatusOptions"
                  :key="status.value"
                  :label="status.label"
                  :value="status.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="标签" prop="tagIds">
          <el-select
            v-model="form.tagIds"
            multiple
            placeholder="请选择标签"
            style="width: 100%"
          >
            <el-option
              v-for="tag in options.tags"
              :key="tag.id"
              :label="tag.name"
              :value="tag.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="域名服务器" prop="nameServers">
          <el-input
            v-model="form.nameServers"
            type="textarea"
            :rows="3"
            placeholder="请输入域名服务器，多个用换行分隔"
          />
        </el-form-item>
        
        <el-form-item label="持有人信息" prop="holderInfo">
          <el-input
            v-model="form.holderInfo"
            type="textarea"
            :rows="3"
            placeholder="请输入持有人信息"
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

    <!-- 批量导入域名对话框 -->
    <DomainImport 
      v-model="showImport" 
      @success="handleImportSuccess" 
    />

    <!-- 批量移动分类对话框 -->
    <el-dialog title="批量移动分类" v-model="batchCategoryDialog" width="500px">
      <el-form :model="batchForm" label-width="100px">
        <el-form-item label="目标分类">
          <el-select v-model="batchForm.categoryId" placeholder="请选择分类" clearable style="width: 100%">
            <el-option label="无分类" :value="null" />
            <el-option
              v-for="category in options.categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="batch-info">
        <el-alert type="info" :closable="false">
          将移动 {{ selectedDomains.length }} 个域名到选定分类
        </el-alert>
      </div>
      <template #footer>
        <el-button @click="batchCategoryDialog = false">取消</el-button>
        <el-button type="primary" :loading="batchLoading" @click="executeBatchCategory">确定</el-button>
      </template>
    </el-dialog>

    <!-- 批量设置价格对话框 -->
    <el-dialog title="批量设置价格" v-model="batchPriceDialog" width="500px">
      <el-form :model="batchForm" label-width="100px">
        <el-form-item label="销售价格">
          <el-input-number
            v-model="batchForm.price"
            :precision="2"
            :min="0"
            placeholder="设置销售价格"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="域名成本">
          <el-input-number
            v-model="batchForm.costPrice"
            :precision="2"
            :min="0"
            placeholder="设置域名成本"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <div class="batch-info">
        <el-alert type="info" :closable="false">
          将为 {{ selectedDomains.length }} 个域名设置价格（空白字段将跳过）
        </el-alert>
      </div>
      <template #footer>
        <el-button @click="batchPriceDialog = false">取消</el-button>
        <el-button type="primary" :loading="batchLoading" @click="executeBatchPrice">确定</el-button>
      </template>
    </el-dialog>

    <!-- 批量修改销售状态对话框 -->
    <el-dialog title="批量修改销售状态" v-model="batchStatusDialog" width="500px">
      <el-form :model="batchForm" label-width="100px">
        <el-form-item label="销售状态">
          <el-select v-model="batchForm.salesStatus" placeholder="请选择销售状态" style="width: 100%">
            <el-option
              v-for="status in options.salesStatusOptions"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="batch-info">
        <el-alert type="info" :closable="false">
          将修改 {{ selectedDomains.length }} 个域名的销售状态
        </el-alert>
      </div>
      <template #footer>
        <el-button @click="batchStatusDialog = false">取消</el-button>
        <el-button type="primary" :loading="batchLoading" @click="executeBatchStatus">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Domain">
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import DomainImport from './import.vue'

definePageMeta({
  layout: 'admin',
  title: '域名管理',
  middleware: 'auth'
})

useHead({
  title: '域名管理 - DMS 管理后台'
})

// refs
const queryRef = ref()
const domainRef = ref()

// 响应式数据
const domainList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const showImport = ref(false)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const selectedDomains = ref([])

// 批量操作相关
const batchCategoryDialog = ref(false)
const batchPriceDialog = ref(false)
const batchWhoisDialog = ref(false)
const batchStatusDialog = ref(false)
const batchForm = ref({
  categoryId: null,
  price: null,
  costPrice: null,
  salesStatus: null
})
const batchLoading = ref(false)
const options = ref({
  registrars: [],
  categories: [],
  tags: [],
  domainStatusOptions: [],
  salesStatusOptions: [],
  landingPageTypeOptions: []
})

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    search: null,
    categoryId: null,
    registrarId: null,
    domainStatus: null,
    salesStatus: null
  },
  rules: {
    domainName: [
      { required: true, message: '域名不能为空', trigger: 'blur' },
      { min: 1, max: 255, message: '域名长度在 1 到 255 个字符', trigger: 'blur' }
    ],
    domainStatus: [
      { required: true, message: '请选择域名状态', trigger: 'change' }
    ],
    salesStatus: [
      { required: true, message: '请选择销售状态', trigger: 'change' }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

// 获取域名列表
async function getList() {
  loading.value = true
  try {
    const response = await $fetch('/api/admin/domains/list', {
      query: {
        page: queryParams.value.pageNum,
        limit: queryParams.value.pageSize,
        search: queryParams.value.search,
        categoryId: queryParams.value.categoryId,
        registrarId: queryParams.value.registrarId,
        domainStatus: queryParams.value.domainStatus,
        salesStatus: queryParams.value.salesStatus
      }
    })
    
    if (response.code === 200) {
      domainList.value = response.data.domains
      total.value = response.data.pagination?.total || 0
    } else {
      ElMessage.error(response.message || '获取域名列表失败')
    }
  } catch (error) {
    console.error('获取域名列表失败:', error)
    ElMessage.error('获取域名列表失败')
  } finally {
    loading.value = false
  }
}

// 获取选项数据
async function getOptions() {
  try {
    const response = await $fetch('/api/admin/domains/options')
    if (response.code === 200) {
      options.value = response.data
    }
  } catch (error) {
    console.error('获取选项数据失败:', error)
  }
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    domainName: null,
    registrarId: null,
    creationDate: null,
    expiryDate: null,
    nameServers: null,
    purchasePrice: null,
    holderInfo: null,
    notes: null,
    domainStatus: 1,
    salesStatus: 1,
    categoryId: null,
    tagIds: []
  }
  if (domainRef.value) {
    domainRef.value.resetFields()
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
  selectedDomains.value = selection
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

// 新增按钮操作
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加域名'
}

// 批量导入按钮操作
function handleImport() {
  showImport.value = true
}

// 导入成功回调
function handleImportSuccess() {
  showImport.value = false
  ElMessage.success('域名导入成功')
  getList() // 刷新列表
}

// 修改按钮操作
function handleUpdate(row) {
  reset()
  
  // 设置表单数据
  form.value = {
    id: row.id,
    domainName: row.domainName,
    registrarId: row.registrarId,
    creationDate: row.creationDate,
    expiryDate: row.expiryDate,
    nameServers: row.nameServers,
    purchasePrice: row.purchasePrice,
    holderInfo: row.holderInfo,
    notes: row.notes,
    domainStatus: row.domainStatus,
    salesStatus: row.salesStatus,
    categoryId: row.categoryId,
    tagIds: row.tags ? row.tags.map(tagMap => tagMap.tag.id) : []
  }
  
  open.value = true
  title.value = '修改域名'
}

// 查看详情
function handleView(row) {
  ElMessage.info('详情功能开发中...')
}

// 提交按钮
function submitForm() {
  if (!domainRef.value) return
  
  domainRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await $fetch('/api/admin/domains/save', {
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
        console.error('操作失败:', error)
        ElMessage.error('操作失败')
      }
    }
  })
}

// 删除按钮操作
function handleDelete(row) {
  const domainIds = row?.id ? [row.id] : ids.value
  const domainNames = row?.domainName ? [row.domainName] : domainList.value.filter(item => domainIds.includes(item.id)).map(item => item.domainName)
  
  ElMessageBox.confirm(
    `是否确认删除域名 "${domainNames.join('、')}"？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const deletePromises = domainIds.map(id => 
        $fetch('/api/admin/domains/delete', { 
          method: 'POST',
          body: { id }
        })
      )
      
      const responses = await Promise.all(deletePromises)
      
      const hasError = responses.some(response => response.code !== 200)
      if (hasError) {
        ElMessage.error('部分域名删除失败')
      } else {
        ElMessage.success('删除成功')
      }
      getList()
    } catch (error) {
      console.error('删除域名失败:', error)
      ElMessage.error('删除域名失败')
      getList()
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

// 获取域名状态标签类型
function getDomainStatusType(status) {
  const statusMap = {
    1: 'success', // 正常
    2: 'danger',  // 过期
    3: 'warning', // 暂停
    4: 'info'     // 转出
  }
  return statusMap[status] || 'info'
}

// 获取域名状态标签文本
function getDomainStatusLabel(status) {
  const statusMap = {
    1: '正常',
    2: '过期',
    3: '暂停',
    4: '转出'
  }
  return statusMap[status] || '未知'
}

// 获取销售状态标签类型
function getSalesStatusType(status) {
  const statusMap = {
    1: 'primary', // 待售
    2: 'warning', // 询价
    3: 'danger',  // 谈判中
    4: 'success', // 已售
    5: 'info'     // 暂不出售
  }
  return statusMap[status] || 'info'
}

// 获取销售状态标签文本
function getSalesStatusLabel(status) {
  const statusMap = {
    1: '待售',
    2: '询价',
    3: '谈判中',
    4: '已售',
    5: '暂不出售'
  }
  return statusMap[status] || '未知'
}

// 批量操作命令处理
function handleBatchCommand(command) {
  switch (command) {
    case 'batchCategory':
      handleBatchCategory()
      break
    case 'batchPrice':
      handleBatchPrice()
      break
    case 'batchWhois':
      handleBatchWhois()
      break
    case 'batchStatus':
      handleBatchStatus()
      break
  }
}

// 批量移动分类
function handleBatchCategory() {
  batchForm.value.categoryId = null
  batchCategoryDialog.value = true
}

// 批量设置价格
function handleBatchPrice() {
  batchForm.value.price = null
  batchForm.value.costPrice = null
  batchPriceDialog.value = true
}

// 批量获取Whois
function handleBatchWhois() {
  ElMessageBox.confirm(
    `确认获取选中的 ${selectedDomains.value.length} 个域名的Whois信息？`,
    '批量获取Whois',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    await executeBatchWhois()
  })
}

// 批量修改销售状态
function handleBatchStatus() {
  batchForm.value.salesStatus = null
  batchStatusDialog.value = true
}

// 执行批量分类移动
async function executeBatchCategory() {
  if (!batchForm.value.categoryId && batchForm.value.categoryId !== null) {
    ElMessage.warning('请选择分类')
    return
  }

  batchLoading.value = true
  try {
    const response = await $fetch('/api/admin/domains/batch-category', {
      method: 'POST',
      body: {
        domainIds: selectedDomains.value.map(d => d.id),
        categoryId: batchForm.value.categoryId
      }
    })

    if (response.code === 200) {
      ElMessage.success(`成功移动 ${response.data.successCount} 个域名`)
      batchCategoryDialog.value = false
      getList()
    } else {
      ElMessage.error(response.message || '批量移动分类失败')
    }
  } catch (error) {
    console.error('批量移动分类失败:', error)
    ElMessage.error('批量移动分类失败')
  } finally {
    batchLoading.value = false
  }
}

// 执行批量设置价格
async function executeBatchPrice() {
  if (!batchForm.value.price && !batchForm.value.costPrice) {
    ElMessage.warning('请至少设置一个价格')
    return
  }

  batchLoading.value = true
  try {
    const response = await $fetch('/api/admin/domains/batch-price', {
      method: 'POST',
      body: {
        domainIds: selectedDomains.value.map(d => d.id),
        price: batchForm.value.price,
        costPrice: batchForm.value.costPrice
      }
    })

    if (response.code === 200) {
      ElMessage.success(`成功设置 ${response.data.successCount} 个域名的价格`)
      batchPriceDialog.value = false
      getList()
    } else {
      ElMessage.error(response.message || '批量设置价格失败')
    }
  } catch (error) {
    console.error('批量设置价格失败:', error)
    ElMessage.error('批量设置价格失败')
  } finally {
    batchLoading.value = false
  }
}

// 执行批量获取Whois
async function executeBatchWhois() {
  batchLoading.value = true
  let successCount = 0
  let errorCount = 0

  try {
    for (const domain of selectedDomains.value) {
      try {
        const response = await $fetch('/api/admin/whois/update', {
          method: 'POST',
          body: { domainId: domain.id }
        })
        
        if (response.code === 200) {
          successCount++
        } else {
          errorCount++
        }
      } catch (error) {
        errorCount++
      }
    }

    if (successCount > 0) {
      ElMessage.success(`成功获取 ${successCount} 个域名的Whois信息${errorCount > 0 ? `，失败 ${errorCount} 个` : ''}`)
      getList()
    } else {
      ElMessage.error('获取Whois信息失败')
    }
  } catch (error) {
    console.error('批量获取Whois失败:', error)
    ElMessage.error('批量获取Whois失败')
  } finally {
    batchLoading.value = false
  }
}

// 执行批量修改销售状态
async function executeBatchStatus() {
  if (!batchForm.value.salesStatus) {
    ElMessage.warning('请选择销售状态')
    return
  }

  batchLoading.value = true
  try {
    const response = await $fetch('/api/admin/domains/batch-status', {
      method: 'POST',
      body: {
        domainIds: selectedDomains.value.map(d => d.id),
        salesStatus: batchForm.value.salesStatus
      }
    })

    if (response.code === 200) {
      ElMessage.success(`成功修改 ${response.data.successCount} 个域名的销售状态`)
      batchStatusDialog.value = false
      getList()
    } else {
      ElMessage.error(response.message || '批量修改销售状态失败')
    }
  } catch (error) {
    console.error('批量修改销售状态失败:', error)
    ElMessage.error('批量修改销售状态失败')
  } finally {
    batchLoading.value = false
  }
}

// 页面加载时获取数据
onMounted(async () => {
  await getOptions()
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

.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.mr-1 {
  margin-right: 4px;
}

.dialog-footer {
  text-align: right;
}

.batch-info {
  margin: 16px 0;
}
</style> 