<template>
  <div class="app-container">
    <!-- 搜索面板 -->
    <el-card v-show="showSearch" class="search-panel">
      <el-form ref="queryRef" :model="queryParams" class="search-form" :inline="true" label-width="80px">
        <el-row :gutter="16">
          <!-- 基础搜索 -->
          <el-form-item label="域名" prop="search" style="width: 300px">
            <el-input v-model="queryParams.search" placeholder="请输入域名关键词" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          
          <el-form-item label="含义" prop="domainMeaning" style="width: 300px">
            <el-input v-model="queryParams.domainMeaning" placeholder="请输入域名含义" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          
          <el-form-item label="域名状态" prop="domainStatus" style="width: 300px">
            <el-select v-model="queryParams.domainStatus" placeholder="请选择域名状态" clearable style="width: 100%">
              <el-option v-for="status in options.domainStatusOptions" :key="status.value" 
                         :label="status.label" :value="status.value" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="销售状态" prop="salesStatus" style="width: 300px">
            <el-select v-model="queryParams.salesStatus" placeholder="请选择销售状态" clearable style="width: 100%">
              <el-option v-for="status in options.salesStatusOptions" :key="status.value" 
                         :label="status.label" :value="status.value" />
            </el-select>
          </el-form-item>

          <!-- 分类和标签 -->
          <el-form-item label="注册商" prop="registrarId" style="width: 300px">
            <el-select v-model="queryParams.registrarId" placeholder="请选择注册商" clearable style="width: 100%">
              <el-option v-for="registrar in options.registrars" :key="registrar.id" 
                         :label="registrar.name" :value="registrar.id" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="分类" prop="categoryId" style="width: 300px">
            <el-select v-model="queryParams.categoryId" placeholder="请选择分类" clearable style="width: 100%">
              <el-option v-for="category in options.categories" :key="category.id" 
                         :label="category.name" :value="category.id" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="标签" prop="tagIds" class="tag-select" style="width: 300px">
            <el-select v-model="queryParams.tagIds" placeholder="请选择标签" clearable multiple 
                      collapse-tags collapse-tags-tooltip style="width: 100%">
              <el-option v-for="tag in options.tags" :key="tag.id" 
                         :label="tag.name" :value="tag.id" />
            </el-select>
          </el-form-item>

   
          <!-- 第三行：价格范围 -->
            <el-form-item label="购买价格">
              <div class="price-range">
                <el-input v-model="queryParams.purchasePriceMin" :precision="2" :min="0" 
                                placeholder="最低价" class="price-input" />
                <span class="range-separator">-</span>
                <el-input v-model="queryParams.purchasePriceMax" :precision="2" :min="0" 
                                placeholder="最高价" class="price-input" />
              </div>
            </el-form-item>
        
            <el-form-item label="销售价格">
              <div class="price-range">
                <el-input v-model="queryParams.salesPriceMin" :precision="2" :min="0" 
                                placeholder="最低价" class="price-input" />
                <span class="range-separator">-</span>
                <el-input v-model="queryParams.salesPriceMax" :precision="2" :min="0" 
                                placeholder="最高价" class="price-input" />
              </div>
            </el-form-item>
            <el-form-item label="折扣价格">
              <div class="price-range">
                <el-input v-model="queryParams.discountMin" :precision="2" :min="0" 
                                placeholder="最低价" class="price-input" />
                <span class="range-separator">-</span>
                <el-input v-model="queryParams.discountMax" :precision="2" :min="0" 
                                placeholder="最高价" class="price-input" />
              </div>
            </el-form-item>

          <!-- 第四行：时间范围 -->
            <el-form-item label="创建时间" prop="creationDateRange" style="width: 300px">
              <el-date-picker v-model="queryParams.creationDateRange" type="daterange" 
                             range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
                             format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
       
            <el-form-item label="到期时间" prop="expiryDateRange" style="width: 300px">
              <el-date-picker v-model="queryParams.expiryDateRange" type="daterange" 
                             range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
                             format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
        
            <!-- 操作按钮 -->
            <el-form-item label=" " class="search-buttons" label-width="0px" style="width: 300px">
              <div class="button-group">
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
                <el-button icon="Download" @click="handleExport">导出</el-button>
              </div>
            </el-form-item>
        </el-row>
      </el-form>
    </el-card>

    <!-- 工具栏 -->
    <el-row class="mb8" style="display: flex; justify-content: space-between; align-items: center">
      <div style="display: flex; gap: 10px; flex-wrap: wrap">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
        <el-button type="success" plain icon="Upload" @click="handleImport">批量导入</el-button>
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">删除</el-button>

        <!-- 批量操作按钮 -->
        <el-dropdown v-if="selectedDomains.length > 0" @command="handleBatchCommand">
          <el-button type="warning" plain>
            批量操作({{ selectedDomains.length }})
            <el-icon><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="batchCategory" icon="FolderOpened">移动分类</el-dropdown-item>
              <el-dropdown-item command="batchPrice" icon="PriceTag">设置价格</el-dropdown-item>
              <el-dropdown-item command="batchCost" icon="Money">域名成本</el-dropdown-item>
              <el-dropdown-item command="batchWhois" icon="Search">Whois填充</el-dropdown-item>
              <el-dropdown-item command="batchStatus" icon="Switch">修改销售状态</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div style="display: flex; gap: 10px">
        <el-button circle @click="showSearch = !showSearch">
          <el-icon>
            <Search />
          </el-icon>
        </el-button>
        <el-button circle @click="getList">
          <el-icon>
            <Refresh />
          </el-icon>
        </el-button>
      </div>
    </el-row>

    <!-- 数据表格 -->
    <el-card>
      <el-table v-loading="loading" :data="domainList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />

        <el-table-column label="域名" align="center" prop="domainName" min-width="200">
          <template #default="{ row }">
            <el-link type="primary" @click="handleView(row)">{{
              row.domainName
              }}</el-link>
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

        <el-table-column label="含义" align="center" prop="domainMeaning" min-width="200">
          <template #default="{ row }">
            <span v-if="row.domainMeaning">{{ row.domainMeaning }}</span>
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
              <el-tag v-for="tagMap in row.tags.slice(0, 2)" :key="tagMap.tag.id" type="info" size="small" class="mr-1">
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

        <el-table-column label="销售价格" align="center" width="100">
          <template #default="{ row }">
            <span v-if="row.salesPrice">¥{{ row.salesPrice }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>

        <el-table-column label="折扣价格" align="center" width="100">
          <template #default="{ row }">
            <span v-if="row.discount">¥{{ row.discount }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>

        <el-table-column label="到期时间" align="center" width="120">
          <template #default="{ row }">
            <span v-if="row.expiryDate">{{
              dayjs(row.expiryDate).format("YYYY-MM-DD")
              }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" align="center" fixed="right" width="260">
          <template #default="scope">
            <el-dropdown @command="(command) => handleStatusChange(scope.row, command)">
              <el-button link type="primary" icon="Edit">
                状态<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item 
                    v-for="status in SALES_STATUS_OPTIONS" 
                    :key="status.value"
                    :command="status.value"
                    :disabled="scope.row.salesStatus === status.value"
                  >
                    {{ status.label }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
            <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination v-show="total > 0" :current-page="queryParams.pageNum" :page-size="queryParams.pageSize"
          :page-sizes="[20, 30, 50, 100, 200, 500, 1000]" :total="total" background
          layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </el-card>

         <DomainEdit 
         ref="domainEditRef"
       v-model="open" 
       :title="title"
       :domain-data="currentDomain"
       :options="options"
       @success="handleEditSuccess"
     />

    <!-- 批量导入域名对话框 -->
    <DomainImport v-model="showImport" @success="handleImportSuccess" />

    <!-- 批量移动分类对话框 -->
    <el-dialog title="批量移动分类" v-model="batchCategoryDialog" width="500px">
      <el-form :model="batchForm" label-width="100px">
        <el-form-item label="目标分类">
          <el-select v-model="batchForm.categoryId" placeholder="请选择分类" clearable style="width: 100%">
            <el-option label="无分类" :value="null" />
            <el-option v-for="category in options.categories" :key="category.id" :label="category.name"
              :value="category.id" />
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
    <el-dialog title="批量设置价格" v-model="batchPriceDialog" width="700px">
      <el-form :model="batchForm" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="销售价格">
              <el-input-number v-model="batchForm.salesPrice" :precision="2" :min="0" placeholder="设置销售价格" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="价格有效期">
              <el-date-picker 
                v-model="batchForm.priceExpiry" 
                type="datetime" 
                placeholder="选择价格有效期"
                format="YYYY-MM-DD HH:mm:ss" 
                value-format="YYYY-MM-DD HH:mm:ss" 
                style="width: 100%" 
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="折扣价格">
              <el-input-number v-model="batchForm.discount" :precision="2" :min="0" placeholder="设置折扣价格" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="折扣有效期">
              <el-date-picker 
                v-model="batchForm.discountExpiry" 
                type="datetime" 
                placeholder="选择折扣有效期"
                format="YYYY-MM-DD HH:mm:ss" 
                value-format="YYYY-MM-DD HH:mm:ss" 
                style="width: 100%" 
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="购买价格">
          <el-input-number v-model="batchForm.purchasePrice" :precision="2" :min="0" placeholder="设置购买价格"
            style="width: 100%" />
        </el-form-item>
        
        <el-form-item label="跳过空白字段">
          <el-switch
            v-model="batchForm.skipEmpty"
            active-text=""
            inactive-text=""
            active-color="#67c23a"
            inactive-color="#f56c6c"
            style="--el-switch-on-color: #67c23a; --el-switch-off-color: #f56c6c"
          />
        </el-form-item>
      </el-form>
      <div class="batch-info">
        <el-alert :type="batchForm.skipEmpty ? 'info' : 'warning'" :closable="false">
          <span v-if="batchForm.skipEmpty">
            将为 {{ selectedDomains.length }} 个域名设置相关信息（空白字段将跳过）
          </span>
          <span v-else>
            将为 {{ selectedDomains.length }} 个域名设置相关信息（空白字段将被清空）
          </span>
        </el-alert>
      </div>
      <template #footer>
        <el-button @click="batchPriceDialog = false">取消</el-button>
        <el-button type="primary" :loading="batchLoading" @click="executeBatchPrice">确定</el-button>
      </template>
    </el-dialog>

    <!-- 批量添加成本记录弹窗组件 -->
    <CostsEdit
      v-model="batchCostDialog"
      :batch-mode="true"
      :batch-domains="selectedDomains"
      :domain-options="[]"
      :cost-type-options="costTypeOptions"
      @success="handleBatchCostSuccess"
    />

    <!-- 批量修改销售状态对话框 -->
    <el-dialog title="批量修改销售状态" v-model="batchStatusDialog" width="500px">
      <el-form :model="batchForm" label-width="100px">
        <el-form-item label="销售状态">
          <el-select v-model="batchForm.salesStatus" placeholder="请选择销售状态" style="width: 100%">
            <el-option v-for="status in options.salesStatusOptions" :key="status.value" :label="status.label"
              :value="status.value" />
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
import { ElMessage, ElMessageBox } from "element-plus";
import dayjs from "dayjs";
import DomainImport from "./import.vue";
import DomainEdit from "./_edit.vue";
import CostsEdit from "../report/_costs_edit.vue";
import { SALES_STATUS_OPTIONS } from '~/utils/constants.js'

definePageMeta({
  layout: "admin",
  title: "域名管理",
  middleware: "auth",
});

useHead({
  title: "域名管理 - DMS 管理后台",
});

// refs
const queryRef = ref();
const domainRef = ref();

// 响应式数据
const domainList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const showImport = ref(false);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const selectedDomains = ref([]);
const currentDomain = ref(null);
const domainEditRef = ref(null);

// 批量操作相关
const batchCategoryDialog = ref(false);
const batchPriceDialog = ref(false);
const batchCostDialog = ref(false);
const batchWhoisDialog = ref(false);
const batchStatusDialog = ref(false);
const batchForm = ref({
  categoryId: null,
  salesPrice: null,
  discount: null,
  discountExpiry: null,
  priceExpiry: null,
  purchasePrice: null,
  salesStatus: null,
  skipEmpty: true, // 默认跳过空白字段
});

// 成本类型选项
const costTypeOptions = ref([
  { value: 'purchase', label: '购买成本' },
  { value: 'renewal', label: '续费成本' },
  { value: 'transfer', label: '转移成本' },
  { value: 'other', label: '其他成本' }
]);

const batchLoading = ref(false);

// AI生成相关
const aiGenerating = ref(false);
const options = ref({
  registrars: [],
  categories: [],
  tags: [],
  domainStatusOptions: [
    { value: 1, label: '有效' },
    { value: 2, label: '已过期' },
    { value: 3, label: '待续费' },
    { value: 4, label: '已删除' },
  ],
  salesStatusOptions: [
    { value: 1, label: '未上架' },
    { value: 2, label: '已上架' },
    { value: 3, label: '已售出' },
    { value: 4, label: '暂停销售' },
  ],
  landingPageTypeOptions: [],
});

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    search: null,
    domainMeaning: null,
    categoryId: null,
    registrarId: null,
    domainStatus: null,
    salesStatus: null,
    tagIds: [],
    purchasePriceMin: null,
    purchasePriceMax: null,
    salesPriceMin: null,
    salesPriceMax: null,
    discountMin: null,
    discountMax: null,
    creationDateRange: null,
    expiryDateRange: null,
  },
});

const { queryParams } = toRefs(data);

// 获取域名列表
async function getList() {
  loading.value = true;
  try {
    // 构建查询参数，过滤空值
    const queryData = {
      page: queryParams.value.pageNum,
      limit: queryParams.value.pageSize,
    };

    // 添加非空的筛选条件
    if (queryParams.value.search) queryData.search = queryParams.value.search;
    if (queryParams.value.domainMeaning) queryData.domainMeaning = queryParams.value.domainMeaning;
    if (queryParams.value.categoryId) queryData.categoryId = queryParams.value.categoryId;
    if (queryParams.value.registrarId) queryData.registrarId = queryParams.value.registrarId;
    if (queryParams.value.domainStatus) queryData.domainStatus = queryParams.value.domainStatus;
    if (queryParams.value.salesStatus) queryData.salesStatus = queryParams.value.salesStatus;
    if (queryParams.value.tagIds && queryParams.value.tagIds.length > 0) {
      queryData.tagIds = queryParams.value.tagIds.join(',');
    }
    
    // 价格范围筛选
    if (queryParams.value.purchasePriceMin) queryData.purchasePriceMin = queryParams.value.purchasePriceMin;
    if (queryParams.value.purchasePriceMax) queryData.purchasePriceMax = queryParams.value.purchasePriceMax;
    if (queryParams.value.salesPriceMin) queryData.salesPriceMin = queryParams.value.salesPriceMin;
    if (queryParams.value.salesPriceMax) queryData.salesPriceMax = queryParams.value.salesPriceMax;
    if (queryParams.value.discountMin) queryData.discountMin = queryParams.value.discountMin;
    if (queryParams.value.discountMax) queryData.discountMax = queryParams.value.discountMax;
    
    // 时间范围筛选
    if (queryParams.value.creationDateRange && queryParams.value.creationDateRange.length === 2) {
      queryData.creationDateStart = queryParams.value.creationDateRange[0];
      queryData.creationDateEnd = queryParams.value.creationDateRange[1];
    }
    if (queryParams.value.expiryDateRange && queryParams.value.expiryDateRange.length === 2) {
      queryData.expiryDateStart = queryParams.value.expiryDateRange[0];
      queryData.expiryDateEnd = queryParams.value.expiryDateRange[1];
    }

    const response = await $fetch("/api/admin/domains/list", {
      query: queryData,
    });

    if (response.code === 200) {
      domainList.value = response.data.domains;
      total.value = response.data.pagination?.total || 0;
    } else {
      ElMessage.error(response.message || "获取域名列表失败");
    }
  } catch (error) {
    console.error("获取域名列表失败:", error);
    ElMessage.error("获取域名列表失败");
  } finally {
    loading.value = false;
  }
}

// 获取选项数据
async function getOptions() {
  try {
    const response = await $fetch("/api/admin/domains/options");
    if (response.code === 200) {
      options.value = response.data;
    }
  } catch (error) {
    console.error("获取选项数据失败:", error);
  }
}

// 搜索按钮操作
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

// 重置按钮操作
function resetQuery() {
  // 手动重置所有查询参数到初始值
  queryParams.value = {
    pageNum: 1,
    pageSize: 20,
    search: null,
    domainMeaning: null,
    categoryId: null,
    registrarId: null,
    domainStatus: null,
    salesStatus: null,
    tagIds: [],
    purchasePriceMin: null,
    purchasePriceMax: null,
    salesPriceMin: null,
    salesPriceMax: null,
    discountMin: null,
    discountMax: null,
    creationDateRange: null,
    expiryDateRange: null,
  };
  
  // 重置表单验证状态
  if (queryRef.value) {
    queryRef.value.resetFields();
  }
  
  // 执行查询
  handleQuery();
}

// 导出功能
function handleExport() {
  ElMessage.info("导出功能开发中...");
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.id);
  selectedDomains.value = selection;
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
}

// 新增按钮操作
function handleAdd() {
  currentDomain.value = null;
  open.value = true;
  title.value = "添加域名";
}

// 批量导入按钮操作
function handleImport() {
  showImport.value = true;
}

// 导入成功回调
function handleImportSuccess() {
  showImport.value = false;
  ElMessage.success("域名导入成功");
  getList(); // 刷新列表
}

// 修改按钮操作
function handleUpdate(row) {
  currentDomain.value = {
    id: row.id,
    domainName: row.domainName,
    registrarId: row.registrarId,
    creationDate: row.creationDate,
    expiryDate: row.expiryDate,
    nameServers: row.nameServers,
    purchasePrice: row.purchasePrice,
    salesPrice: row.salesPrice || null,
    discount: row.discount || null,
    discountExpiry: row.discountExpiry || null,
    priceExpiry: row.priceExpiry || null,
    domainMeaning: row.domainMeaning || null,
    domainDescription: row.domainDescription || null,
    holderInfo: row.holderInfo,
    notes: row.notes,
    domainStatus: row.domainStatus,
    salesStatus: row.salesStatus,
    categoryId: row.categoryId,
    tagIds: row.tags ? row.tags.map((tagMap) => tagMap.tag.id) : [],
    clickBehavior: row.clickBehavior || null,
    seoTitle: row.seoTitle || null,
    seoKeywords: row.seoKeywords || null,
    seoDescription: row.seoDescription || null,
  };

  open.value = true;
  title.value = "修改域名";
}

// 查看详情
function handleView(row) {
  ElMessage.info("详情功能开发中...");
}

// 编辑成功回调
function handleEditSuccess() {
  open.value = false;
  currentDomain.value = null;
  getList();
}

// 删除按钮操作
function handleDelete(row) {
  const domainIds = row?.id ? [row.id] : ids.value;
  const domainNames = row?.domainName
    ? [row.domainName]
    : domainList.value
      .filter((item) => domainIds.includes(item.id))
      .map((item) => item.domainName);

  ElMessageBox.confirm(
    `是否确认删除域名 "${domainNames.join("、")}"？`,
    "警告",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(async () => {
      try {
        const deletePromises = domainIds.map((id) =>
          $fetch("/api/admin/domains/delete", {
            method: "POST",
            body: { id },
          })
        );

        const responses = await Promise.all(deletePromises);

        const hasError = responses.some((response) => response.code !== 200);
        if (hasError) {
          ElMessage.error("部分域名删除失败");
        } else {
          ElMessage.success("删除成功");
        }
        getList();
      } catch (error) {
        console.error("删除域名失败:", error);
        ElMessage.error("删除域名失败");
        getList();
      }
    })
    .catch(() => {
      ElMessage.info("已取消删除");
    });
}


// 改变页面大小
function handleSizeChange(val) {
  queryParams.value.pageSize = val;
  getList();
}

// 改变当前页码
function handleCurrentChange(val) {
  queryParams.value.pageNum = val;
  getList();
}

// 获取域名状态标签类型
function getDomainStatusType(status) {
  const statusMap = {
    1: "success", // 正常
    2: "danger", // 过期
    3: "warning", // 暂停
    4: "info", // 转出
  };
  return statusMap[status] || "info";
}

// 获取域名状态标签文本
function getDomainStatusLabel(status) {
  const statusMap = {
    1: "正常",
    2: "过期",
    3: "暂停",
    4: "转出",
  };
  return statusMap[status] || "未知";
}

// 获取销售状态标签类型
function getSalesStatusType(status) {
  const statusMap = {
    1: "primary", // 待售
    2: "warning", // 已上架
    3: "success", // 已售出
    4: "info", // 暂停销售
  };
  return statusMap[status] || "info";
}

// 获取销售状态标签文本
function getSalesStatusLabel(status) {
  return SALES_STATUS_OPTIONS.find(option => option.value === status)?.label || "未知";
}

// 批量操作命令处理
function handleBatchCommand(command) {
  switch (command) {
    case "batchCategory":
      handleBatchCategory();
      break;
    case "batchPrice":
      handleBatchPrice();
      break;
    case "batchCost":
      handleBatchCost();
      break;
    case "batchWhois":
      handleBatchWhois();
      break;
    case "batchStatus":
      handleBatchStatus();
      break;
  }
}

// 批量移动分类
function handleBatchCategory() {
  batchForm.value.categoryId = null;
  batchCategoryDialog.value = true;
}

// 批量设置价格
function handleBatchPrice() {
  batchForm.value.salesPrice = null;
  batchForm.value.discount = null;
  batchForm.value.discountExpiry = null;
  batchForm.value.priceExpiry = null;
  batchForm.value.purchasePrice = null;
  batchForm.value.skipEmpty = true; // 重置为默认值
  batchPriceDialog.value = true;
}

// 批量添加成本记录
function handleBatchCost() {
  // 重置表单
  batchCostDialog.value = true;
}

// 批量获取Whois
function handleBatchWhois() {
  ElMessageBox.confirm(
    `确认获取选中的 ${selectedDomains.value.length} 个域名的Whois信息？`,
    "批量获取Whois",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  ).then(async () => {
    await executeBatchWhois();
  });
}

// 批量修改销售状态
function handleBatchStatus() {
  batchForm.value.salesStatus = null;
  batchStatusDialog.value = true;
}

// 执行批量分类移动
async function executeBatchCategory() {
  if (!batchForm.value.categoryId && batchForm.value.categoryId !== null) {
    ElMessage.warning("请选择分类");
    return;
  }

  batchLoading.value = true;
  try {
    const response = await $fetch("/api/admin/domains/batch-category", {
      method: "POST",
      body: {
        domainIds: selectedDomains.value.map((d) => d.id),
        categoryId: batchForm.value.categoryId,
      },
    });

    if (response.code === 200) {
      ElMessage.success(`成功移动 ${response.data.successCount} 个域名`);
      batchCategoryDialog.value = false;
      getList();
    } else {
      ElMessage.error(response.message || "批量移动分类失败");
    }
  } catch (error) {
    console.error("批量移动分类失败:", error);
    ElMessage.error("批量移动分类失败");
  } finally {
    batchLoading.value = false;
  }
}

// 执行批量设置价格
async function executeBatchPrice() {
  // 检查是否有任何字段被设置
  const hasAnyValue = batchForm.value.salesPrice || 
                     batchForm.value.discount || 
                     batchForm.value.discountExpiry || 
                     batchForm.value.priceExpiry || 
                     batchForm.value.purchasePrice;
  
  // 如果跳过空白字段模式下没有设置任何值，给出提示
  if (!hasAnyValue && batchForm.value.skipEmpty) {
    ElMessage.warning("未设置任何字段，将不会进行任何更新");
    // 不return，允许继续执行
  }
  // 如果不跳过空白字段模式，即使没有设置值也是有效操作（清空字段）

  batchLoading.value = true;
  try {
    const response = await $fetch("/api/admin/domains/batch-price", {
      method: "POST",
      body: {
        domainIds: selectedDomains.value.map((d) => d.id),
        salesPrice: batchForm.value.salesPrice,
        discount: batchForm.value.discount,
        discountExpiry: batchForm.value.discountExpiry,
        priceExpiry: batchForm.value.priceExpiry,
        purchasePrice: batchForm.value.purchasePrice,
        skipEmpty: batchForm.value.skipEmpty,
      },
    });

    if (response.code === 200) {
      ElMessage.success(`成功设置 ${response.data.successCount} 个域名的价格`);
      batchPriceDialog.value = false;
      getList();
    } else {
      ElMessage.error(response.message || "批量设置价格失败");
    }
  } catch (error) {
    console.error("批量设置价格失败:", error);
    ElMessage.error("批量设置价格失败");
  } finally {
    batchLoading.value = false;
  }
}

// 执行批量获取Whois
async function executeBatchWhois() {
  batchLoading.value = true;
  let successCount = 0;
  let errorCount = 0;

  try {
    for (const domain of selectedDomains.value) {
      try {
        const response = await $fetch("/api/admin/whois/update", {
          method: "POST",
          body: { domainId: domain.id },
        });

        if (response.code === 200) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }

    if (successCount > 0) {
      ElMessage.success(
        `成功获取 ${successCount} 个域名的Whois信息${errorCount > 0 ? `，失败 ${errorCount} 个` : ""
        }`
      );
      getList();
    } else {
      ElMessage.error("获取Whois信息失败");
    }
  } catch (error) {
    console.error("批量获取Whois失败:", error);
    ElMessage.error("批量获取Whois失败");
  } finally {
    batchLoading.value = false;
  }
}

// 执行批量修改销售状态
async function executeBatchStatus() {
  if (!batchForm.value.salesStatus) {
    ElMessage.warning("请选择销售状态");
    return;
  }

  batchLoading.value = true;
  try {
    const response = await $fetch("/api/admin/domains/batch-status", {
      method: "POST",
      body: {
        domainIds: selectedDomains.value.map((d) => d.id),
        salesStatus: batchForm.value.salesStatus,
      },
    });

    if (response.code === 200) {
      ElMessage.success(
        `成功修改 ${response.data.successCount} 个域名的销售状态`
      );
      batchStatusDialog.value = false;
      getList();
    } else {
      ElMessage.error(response.message || "批量修改销售状态失败");
    }
  } catch (error) {
    console.error("批量修改销售状态失败:", error);
    ElMessage.error("批量修改销售状态失败");
  } finally {
    batchLoading.value = false;
  }
}

// 单个域名状态更改
async function handleStatusChange(row, status) {
  try {
    const response = await $fetch("/api/admin/domains/batch-status", {
      method: "POST",
      body: {
        domainIds: [row.id],
        salesStatus: status,
      },
    });

    if (response.code === 200) {
      ElMessage.success("状态更新成功");
      getList();
    } else {
      ElMessage.error(response.message || "状态更新失败");
    }
  } catch (error) {
    console.error("状态更新失败:", error);
    ElMessage.error("状态更新失败");
  }
}

// 显示批量状态对话框
function showBatchStatusDialog() {
  if (selectedDomains.value.length === 0) {
    ElMessage.warning("请选择要操作的域名");
    return;
  }
  batchForm.value.salesStatus = null;
  batchStatusDialog.value = true;
}

// 批量成本成功回调
function handleBatchCostSuccess() {
  batchCostDialog.value = false;
  // 不需要刷新域名列表，因为成本记录不影响域名表格数据
}

// 页面加载时获取数据
onMounted(async () => {
  await getOptions();
  getList();
});
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

/* 搜索面板样式 */
.search-panel {
  margin-bottom: 16px;
}

.search-form {
  padding: 8px 0;
}

.search-form .el-row {
  margin-bottom: 8px;
}

.search-form .el-row:last-child {
  margin-bottom: 0;
}

.search-form .el-form-item {
  margin-bottom: 16px;
}

.search-form .el-form-item__label {
  width: 80px !important;
  text-align: right;
  font-weight: 500;
  color: #606266;
}

/* 价格范围样式 */
.price-range {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.price-input {
  flex: 1;
  width: 95px!important;
}

.range-separator {
  color: #909399;
  font-weight: 500;
  padding: 0 4px;
  flex-shrink: 0;
}



.button-group {
  display: flex;
  gap: 8px;
  flex-direction: row;
  justify-content: space-between;
  width: 300px;
}

.button-group .el-button {
  min-width: 80px;
}

/* 输入框和选择器样式统一 */
.search-form .el-input,
.search-form .el-select,
.search-form .el-date-editor {
  width: 100%;
}

.search-form .el-input__inner,
.search-form .el-select__selector {
  height: 32px;
  line-height: 32px;
}

/* 标签多选框样式 */
.search-form .el-select--multiple .el-select__tags {
  max-height: 60px;
  overflow-y: auto;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .search-form .el-form-item__label {
    width: 70px !important;
  }
}

@media (max-width: 768px) {
  .search-form .el-form-item__label {
    width: 60px !important;
    font-size: 13px;
  }
  
  .button-group {
    justify-content: flex-start;
  }
  
  .button-group .el-button {
    min-width: 70px;
    font-size: 13px;
  }
}


</style>

