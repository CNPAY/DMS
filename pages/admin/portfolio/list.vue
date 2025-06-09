<template>
  <div class="app-container">
    <!-- 搜索面板 -->
    <el-card v-show="showSearch" class="search-panel">
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="100px">
        <el-form-item label="米表名称" prop="name" style="width: 280px">
          <el-input v-model="queryParams.name" placeholder="请输入米表名称" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="URL标识符" prop="slug" style="width: 280px">
          <el-input v-model="queryParams.slug" placeholder="请输入URL标识符" clearable @keyup.enter="handleQuery" />
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
      <el-table v-loading="loading" :data="portfolioList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="米表信息" align="center" min-width="200">
          <template #default="{ row }">
            <div style="font-weight: 600; text-align: left;">
              <div >
                {{ row.name }}
                <el-tag v-if="row.isDefault" type="success" size="small" style="margin-left: 8px">默认</el-tag>
              </div>
              <div style="font-size: 12px; color: #666;">
                <a :href="`/${row.slug}`" target="_blank" style="color: blue; text-decoration: none;">
                  /{{ row.slug }}
                </a>
              </div>

            </div>
          </template>
        </el-table-column>
        <el-table-column label="数据" align="center" min-width="200">
          <template #default="{ row }">
          <div style="font-size: 11px; color: #999; margin-top: 2px;">
              {{ row.domainCount || 0 }} 个域名 | {{ row.inquiryCount || 0 }} 个线索
            </div>
          </template>
        </el-table-column>
        <el-table-column label="主题风格" align="center" min-width="140">
          <template #default="{ row }">
            <div style="text-align: center;">
              <el-tag :type="getTemplateTagType(row.layoutTemplate)" style="margin-bottom: 4px;">
                {{ getTemplateLabel(row.layoutTemplate) }}
              </el-tag>
              <div style="font-size: 12px; color: #666;">
                {{ getThemeLabel(row.colorTheme) }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
          <template #default="{ row }">
            <span>{{ formatDate(row.createdAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding" fixed="right" width="300">
          <template #default="scope">
            <div>
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
              <el-button link type="success" icon="Link" @click="handleAssociate(scope.row)">关联</el-button>
              <el-button 
              v-if="!scope.row.isDefault"
                link 
                type="warning" 
                icon="Star" 
                @click="handleSetDefault(scope.row)"
              >
              设为默认
            </el-button>
            <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
            </div>
            <div>
              <el-button link type="warning" icon="Discount" @click="handlePromotion(scope.row)">促销</el-button>
            </div>
           
           
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
    
    <!-- 米表编辑组件 -->
    <PortfolioEdit 
      v-model="open" 
      :portfolio-data="currentEditData"
      @success="handleEditSuccess"
    />

    <!-- 关联域名对话框 -->
    <el-dialog title="关联域名" v-model="associateOpen" width="600px" append-to-body>
      <div style="margin-bottom: 20px; padding: 12px; background-color: #f5f7fa; border-radius: 4px; color: #666;">
        <strong>米表：</strong>{{ associateForm.portfolioName }}
      </div>
      
      <el-form ref="associateRef" :model="associateForm" label-width="120px">
        <el-form-item label="关联分类" prop="categories">
          <el-select class="category-select" v-model="associateForm.categories" multiple placeholder="选择要关联的域名分类" style="width: 100%">
            <el-option
              v-for="category in domainCategories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
          <div style="font-size: 12px; color: #999; margin-top: 4px;">
            选择分类后，查询米表域名时将自动包含该分类下的所有域名
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitAssociate">确 定</el-button>
          <el-button @click="cancelAssociate">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 促销设置对话框 -->
    <PromotionDialog
      v-model="promotionVisible"
      :portfolio-id="currentPromotionData?.id"
      :portfolio-name="currentPromotionData?.name"
      @success="handlePromotionSuccess"
    />
  </div>
</template>



<script setup name="Portfolio">
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import PortfolioEdit from './Edit.vue'
import PromotionDialog from './components/PromotionDialog.vue'
import { 
  getTemplateLabel,
  getTemplateTagType,
  getThemeLabel
} from '~/utils/constants.js'

definePageMeta({
  layout: 'admin',
  title: '米表管理',
  middleware: 'auth'
})

useHead({
  title: '米表管理 - DMS 管理后台'
})

// refs
const queryRef = ref()
const portfolioRef = ref()

// 响应式数据
const portfolioList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const open = ref(false)
const currentEditData = ref(null)
const staticPagesList = ref([])
const staticPagesLoading = ref(false)
const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    slug: null
  },
  rules: {
    name: [
      { required: true, message: '米表名称不能为空', trigger: 'blur' },
      { min: 2, max: 50, message: '名称长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    slug: [
      { required: true, message: 'URL标识符不能为空', trigger: 'blur' },
      { pattern: /^[a-zA-Z0-9-_]+$/, message: 'URL标识符只能包含字母、数字、横线和下划线', trigger: 'blur' }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

// 域名分类和域名数据
const domainCategories = ref([])
const availableDomains = ref([])

// 关联对话框相关数据
const associateOpen = ref(false)
const associateForm = ref({
  portfolioId: null,
  portfolioName: '',
  categories: []
})
const associateRef = ref()

// 促销对话框数据
const promotionVisible = ref(false)
const currentPromotionData = ref(null)

function formatDate(date) {
  return new Date(date).toLocaleString('zh-CN')
}

// 获取米表列表
async function getList() {
  loading.value = true
  try {
    const response = await $fetch('/api/admin/portfolio/list', {
      query: {
        page: queryParams.value.pageNum,
        pageSize: queryParams.value.pageSize,
        keyword: queryParams.value.name || queryParams.value.slug
      }
    })
    
    if (response.code === 200) {
      portfolioList.value = response.data.list
      total.value = response.data.total || 0
    } else {
      ElMessage.error(response.message || '获取米表列表失败')
    }
  } catch (error) {
    console.error('获取米表列表失败:', error)
    ElMessage.error('获取米表列表失败')
  } finally {
    loading.value = false
  }
}

// 获取选项数据
async function loadOptions() {
  try {
    const response = await $fetch('/api/admin/portfolio/options')
    if (response.code === 200) {
      domainCategories.value = response.data.categories || []
      availableDomains.value = response.data.domains || []
    }
  } catch (error) {
    console.error('获取选项数据失败:', error)
  }
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
  portfolioRef.value?.reset()
  getStaticPages() // 获取静态页面列表
  currentEditData.value = null
  open.value = true
  title.value = '添加米表'
}
 
// 获取静态页面列表
async function getStaticPages() {
  staticPagesLoading.value = true
  try {
    const response = await $fetch('/api/admin/static-pages/list', {
      query: {
        page: 1,
        limit: 100, // 获取所有页面用于选择
        status: 'published' // 只获取已发布的页面
      }
    })
    
    if (response.code === 200) {
      staticPagesList.value = response.data.staticPages || []
    }
  } catch (error) {
    console.error('获取静态页面列表失败:', error)
  } finally {
    staticPagesLoading.value = false
  }
}

// 关联按钮操作
async function handleAssociate(row) {
  try {
    // 获取详细信息
    const response = await $fetch(`/api/admin/portfolio/${row.id}`)
    if (response.code === 200) {
      const data = response.data
      associateForm.value = {
        portfolioId: data.id,
        portfolioName: data.name,
        categories: data.relatedCategories?.map(c => c.id) || []
      }
      associateOpen.value = true
    }
  } catch (error) {
    ElMessage.error('获取米表详情失败')
  }
}

// 设为默认米表按钮操作
async function handleSetDefault(row) {
  try {
    await ElMessageBox.confirm(
      `确认将"${row.name}"设为默认米表吗？设置后将取消其他米表的默认状态。`,
      '确认设置',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await $fetch('/api/admin/portfolio/set-default', {
      method: 'POST',
      body: { 
        portfolioId: row.id
      }
    })
    
    if (response.code === 200) {
      ElMessage.success('设置成功')
      getList() // 刷新列表
    } else {
      ElMessage.error(response.message || '设置失败')
    }
  } catch (error) {
    if (error === 'cancel') return
    console.error('设置默认米表失败:', error)
    ElMessage.error('设置失败')
  }
}

// 关联保存按钮
function submitAssociate() {
  associateRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        const response = await $fetch('/api/admin/portfolio/associate', {
          method: 'POST',
          body: {
            portfolioId: associateForm.value.portfolioId,
            categories: associateForm.value.categories
          }
        })
        
        if (response.code === 200) {
          ElMessage.success('关联成功')
          associateOpen.value = false
          getList()
        } else {
          ElMessage.error(response.message || '关联失败')
        }
      } catch (error) {
        console.error('关联失败:', error)
        ElMessage.error('关联失败')
      }
    }
  })
}

// 关联取消按钮
function cancelAssociate() {
  associateOpen.value = false
  associateForm.value = {
    portfolioId: null,
    portfolioName: '',
    categories: []
  }
}

// 删除按钮操作
async function handleDelete(row) {
  const portfolioIds = row?.id || ids.value
  const portfolioNames = Array.isArray(portfolioIds) 
    ? portfolioList.value.filter(item => portfolioIds.includes(item.id)).map(item => item.name).join('、')
    : row?.name

  try {
    await ElMessageBox.confirm(
      `是否确认删除米表"${portfolioNames}"？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await $fetch('/api/admin/portfolio/delete', {
      method: 'POST',
      body: { 
        ids: Array.isArray(portfolioIds) ? portfolioIds : [portfolioIds]
      }
    })
    
    if (response.code === 200) {
      ElMessage.success('删除成功')
    } else {
      ElMessage.error(response.message || '删除失败')
    }

    getList()
  } catch (error) {
    if (error === 'cancel') return
    console.error('删除米表失败:', error)
    ElMessage.error('删除失败')
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

// 促销按钮操作
const handlePromotion = (row) => {
  currentPromotionData.value = row
  promotionVisible.value = true
}

// 促销成功回调
const handlePromotionSuccess = () => {
  getList() // 刷新列表
}

// 修改按钮操作
async function handleUpdate(row) {
  portfolioRef.value?.reset()
  getStaticPages() // 获取静态页面列表
  
  let editData = null
  if (row) {
    // 直接设置表单数据
    editData = { 
      id: row.id,
      name: row.name,
      slug: row.slug,
      isDefault: row.isDefault,
      layoutTemplate: row.layoutTemplate,
      enableGrouping: row.enableGrouping,
      enableWaterfall: row.enableWaterfall,
      colorTheme: row.colorTheme,
      logoUrl: row.logoUrl,
      backgroundUrl: row.backgroundUrl,
      textTheme: row.textTheme || 'auto',
      backgroundOverlay: row.backgroundOverlay || false,
      headerInfo: row.headerInfo,
      headerPages: row.headerPages ? JSON.parse(row.headerPages) : [],
      headerRichText: row.headerRichText,
      footerInfo: row.footerInfo,
      footerPages: row.footerPages ? JSON.parse(row.footerPages) : [],
      footerRichText: row.footerRichText,
      // SEO配置
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      seoKeywords: row.seoKeywords,
      ogTitle: row.ogTitle,
      ogDescription: row.ogDescription,
      ogImage: row.ogImage,
      twitterCard: row.twitterCard || 'summary',
      analyticsCode: row.analyticsCode,
      showPrice: row.showPrice,
      showDescription: row.showDescription,
      showTags: row.showTags,
      enableSearchArea: row.enableSearchArea !== undefined ? row.enableSearchArea : true
    }
  } 
  currentEditData.value = editData
  open.value = true
  title.value = '修改米表'
}

// 编辑成功回调
function handleEditSuccess() {
  getList()
}

// 初始化
getList()
loadOptions()
</script>

<style scoped lang="scss">
.dialog-footer {
  text-align: right;
}

:deep(.category-select) {
  .el-select__wrapper {
    background:none;
  }
}
</style> 