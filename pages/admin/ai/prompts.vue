<template>
  <div class="app-container">
    <!-- 搜索面板 -->
    <el-card v-show="showSearch" class="search-panel">
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="100px">
        <el-form-item label="关键词" prop="search" style="width: 280px">
          <el-input
            v-model="queryParams.search"
            placeholder="请输入场景名称或代码"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        
        <el-form-item label="场景类型" prop="sceneCode" style="width: 280px">
          <el-select
            v-model="queryParams.sceneCode"
            placeholder="请选择场景类型"
            clearable
          >
            <el-option
              v-for="scene in sceneOptions"
              :key="scene.code"
              :label="scene.name"
              :value="scene.code"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态" prop="hasCustomPrompt" style="width: 280px">
          <el-select
            v-model="queryParams.hasCustomPrompt"
            placeholder="请选择状态"
            clearable
          >
            <el-option label="已定制" :value="true" />
            <el-option label="系统默认" :value="false" />
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
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
        <el-button type="warning" plain icon="MagicStick" @click="initPrompts">初始化</el-button>
      </div>
      <div style="display: flex; gap: 10px;">
        <el-button circle @click="showSearch = !showSearch">
          <el-icon><Search /></el-icon>
        </el-button>
        <el-button circle @click="getPromptList">
          <el-icon><Refresh /></el-icon>
        </el-button>
      </div>
    </el-row>

    <!-- 数据表格 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="promptList"
        @selection-change="handleSelectionChange"
      >
          <el-table-column type="selection" width="55" align="center" />
          
          <el-table-column label="场景信息" align="center" min-width="200">
            <template #default="{ row }">
              <div style="text-align: left;">
                <div style="font-weight: bold;">{{ row.sceneName }}</div>
                <div style="color: #666; font-size: 12px;">{{ row.sceneCode }}</div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="当前提示词" align="center" min-width="300">
            <template #default="{ row }">
              <div class="prompt-preview" style="text-align: left;">
                <el-tag 
                  v-if="row.isActiveCustom" 
                  type="warning" 
                  size="small" 
                  style="margin-bottom: 5px;"
                >
                  自定义
                </el-tag>
                <el-tag 
                  v-else 
                  type="info" 
                  size="small" 
                  style="margin-bottom: 5px;"
                >
                  系统默认
                </el-tag>
                <div class="prompt-text" style="color: #666; font-size: 13px; line-height: 1.4;">
                  {{ truncateText(row.currentPrompt, 100) }}
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="优选模型" align="center" width="120">
            <template #default="{ row }">
              <el-tag v-if="row.modelPreference" size="small" type="success">
                {{ getModelLabel(row.modelPreference) }}
              </el-tag>
              <span v-else class="text-gray-400">未设置</span>
            </template>
          </el-table-column>
          
          <el-table-column label="状态" align="center" width="100">
            <template #default="{ row }">
              <el-tag 
                :type="row.hasCustomPrompt ? 'warning' : 'info'" 
                size="small"
              >
                {{ row.hasCustomPrompt ? '已定制' : '默认' }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="更新时间" align="center" prop="updatedAt" width="160">
            <template #default="{ row }">
              <span>{{ formatDateTime(row.updatedAt) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" align="center" class-name="small-padding" fixed="right" width="220">
            <template #default="scope">
              <el-button link type="primary" icon="View" @click="handleView(scope.row)">详情</el-button>
              <el-button link type="primary" icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
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

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="getDialogTitle"
      width="900px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <!-- 场景类型选择 -->
        <el-form-item label="场景类型">
          <el-radio-group v-model="sceneType" @change="handleSceneTypeChange">
            <el-radio value="preset">
              <el-icon><Setting /></el-icon>
              修改预设场景
            </el-radio>
            <el-radio value="custom">
              <el-icon><Plus /></el-icon>
              创建新场景
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="场景代码" prop="sceneCode">
              <!-- 预设场景选择 -->
              <el-select
                v-if="sceneType === 'preset'"
                v-model="formData.sceneCode"
                placeholder="请选择预设场景"
                filterable
                style="width: 100%;"
                @change="handleSceneChange"
              >
                <el-option
                  v-for="scene in sceneOptions"
                  :key="scene.code"
                  :label="`${scene.name} (${scene.code})`"
                  :value="scene.code"
                >
                  <span style="float: left">{{ scene.name }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ scene.code }}</span>
                </el-option>
              </el-select>
              
              <!-- 自定义场景输入 -->
              <el-input
                v-else
                v-model="formData.sceneCode"
                placeholder="请输入新场景代码（如：my-custom-scene）"
                @input="handleCustomSceneInput"
              />
              
              <div style="color: #909399; font-size: 12px; margin-top: 4px;">
                <el-icon><InfoFilled /></el-icon>
                {{ sceneType === 'preset' ? '选择系统预设的AI应用场景' : '输入唯一的场景标识符，建议使用英文和短横线' }}
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="场景名称" prop="sceneName">
              <el-input
                v-model="formData.sceneName"
                placeholder="请输入场景名称"
                :disabled="sceneType === 'preset' && formData.sceneCode && !isEdit"
              />
              <div style="color: #909399; font-size: 12px; margin-top: 4px;">
                <el-icon><InfoFilled /></el-icon>
                {{ sceneType === 'preset' ? '预设场景名称（可在编辑时修改）' : '自定义场景的显示名称' }}
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 预设场景的提示词配置 -->
        <template v-if="sceneType === 'preset'">
          <el-form-item label="系统默认提示词" prop="systemPromptDefault">
            <div style="margin-bottom: 8px;">
              <el-tag type="primary" size="small">
                <el-icon><Setting /></el-icon>
                预设场景
              </el-tag>
              <span style="color: #409EFF; font-size: 12px; margin-left: 8px;">
                您可以自定义预设场景的提示词
              </span>
            </div>
            <el-input
              v-model="formData.systemPromptDefault"
              type="textarea"
              :rows="6"
              placeholder="请输入系统默认提示词..."
              show-word-limit
              maxlength="2000"
            />
          </el-form-item>

          <el-form-item label="用户自定义提示词">
            <el-input
              v-model="formData.userPromptCustom"
              type="textarea"
              :rows="6"
              placeholder="可选：输入用户自定义提示词，留空则使用系统默认提示词..."
              show-word-limit
              maxlength="2000"
            />
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="启用自定义">
                <el-switch
                  v-model="formData.isActiveCustom"
                  :disabled="!formData.userPromptCustom"
                />
                <div style="color: #666; font-size: 12px; margin-top: 5px;">
                  只有设置了自定义提示词才能启用
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="优选AI模型">
                <el-select
                  v-model="formData.modelPreference"
                  placeholder="选择优选模型"
                  clearable
                  style="width: 100%;"
                >
                  <el-option
                    v-for="model in modelOptions"
                    :key="model.value"
                    :label="model.label"
                    :value="model.value"
                  >
                    <div>
                      <div>{{ model.label }}</div>
                      <div style="color: #8492a6; font-size: 12px;">{{ model.description }}</div>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </template>

        <!-- 自定义场景的提示词配置 -->
        <template v-else>
          <el-form-item label="提示词内容" prop="systemPromptDefault">
            <div style="margin-bottom: 8px;">
              <el-tag type="success" size="small">
                <el-icon><Plus /></el-icon>
                自定义场景
              </el-tag>
              <span style="color: #67C23A; font-size: 12px; margin-left: 8px;">
                您正在创建全新的AI应用场景
              </span>
            </div>
            <el-input
              v-model="formData.systemPromptDefault"
              type="textarea"
              :rows="8"
              placeholder="请输入您的自定义提示词内容..."
              show-word-limit
              maxlength="2000"
            />
          </el-form-item>

          <el-form-item label="优选AI模型">
            <el-select
              v-model="formData.modelPreference"
              placeholder="选择优选模型"
              clearable
              style="width: 100%;"
            >
              <el-option
                v-for="model in modelOptions"
                :key="model.value"
                :label="model.label"
                :value="model.value"
              >
                <div>
                  <div>{{ model.label }}</div>
                  <div style="color: #8492a6; font-size: 12px;">{{ model.description }}</div>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
        </template>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 查看对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="查看提示词详情"
      width="800px"
    >
      <div v-if="viewData" class="view-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="场景代码">{{ viewData.sceneCode }}</el-descriptions-item>
          <el-descriptions-item label="场景名称">{{ viewData.sceneName }}</el-descriptions-item>
          <el-descriptions-item label="优选模型">
            {{ viewData.modelPreference ? getModelLabel(viewData.modelPreference) : '未设置' }}
          </el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="viewData.isActiveCustom ? 'warning' : 'info'">
              {{ viewData.isActiveCustom ? '使用自定义' : '使用系统默认' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">
            {{ formatDateTime(viewData.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间" :span="2">
            {{ formatDateTime(viewData.updatedAt) }}
          </el-descriptions-item>
        </el-descriptions>

        <div style="margin-top: 20px;">
          <h4>系统默认提示词：</h4>
          <el-input
            :model-value="viewData.systemPromptDefault"
            type="textarea"
            :rows="8"
            readonly
          />
        </div>

        <div v-if="viewData.userPromptCustom" style="margin-top: 20px;">
          <h4>用户自定义提示词：</h4>
          <el-input
            :model-value="viewData.userPromptCustom"
            type="textarea"
            :rows="8"
            readonly
          />
        </div>

        <div style="margin-top: 20px;">
          <h4>当前生效提示词：</h4>
          <el-input
            :model-value="viewData.currentPrompt"
            type="textarea"
            :rows="8"
            readonly
          />
        </div>
      </div>

      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleEditFromView">编辑此提示词</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="AIPrompts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDateTime } from '~/utils/date'

definePageMeta({
  layout: 'admin',
  title: 'AI提示词管理',
  middleware: 'auth'
})

useHead({
  title: 'AI提示词管理 - DMS 管理后台'
})

// 响应式数据
const loading = ref(true)
const showSearch = ref(true)
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)
const selectedRows = ref([])
const multiple = ref(true)
const total = ref(0)
const promptList = ref([])
const viewData = ref(null)
const sceneOptions = ref([])
const modelOptions = ref([])

// 搜索表单
const queryParams = ref({
  search: '',
  sceneCode: '',
  hasCustomPrompt: null,
  pageNum: 1,
  pageSize: 10
})

// 表单数据
const formData = ref({
  id: null,
  sceneCode: '',
  sceneName: '',
  systemPromptDefault: '',
  userPromptCustom: '',
  isActiveCustom: false,
  modelPreference: ''
})

// 场景类型（preset: 预设场景, custom: 自定义场景）
const sceneType = ref('preset')

// 表单验证规则
const formRules = {
  sceneCode: [
    { required: true, message: '请选择或输入场景代码', trigger: 'blur' },
    { max: 100, message: '场景代码不能超过100个字符', trigger: 'blur' }
  ],
  sceneName: [
    { required: true, message: '请输入场景名称', trigger: 'blur' },
    { max: 200, message: '场景名称不能超过200个字符', trigger: 'blur' }
  ],
  systemPromptDefault: [
    { required: true, message: '请输入系统默认提示词', trigger: 'blur' }
  ]
}

const formRef = ref()

// 计算属性
const isNewScene = computed(() => {
  return sceneType.value === 'custom'
})

const getDialogTitle = computed(() => {
  if (isEdit.value) {
    return isNewScene.value ? '编辑自定义场景' : '编辑预设场景'
  } else {
    return isNewScene.value ? '创建自定义场景' : '配置预设场景'
  }
})

// 获取提示词列表
async function getPromptList() {
  loading.value = true
  try {
    const params = {
      page: queryParams.value.pageNum,
      pageSize: queryParams.value.pageSize,
      search: queryParams.value.search,
      sceneCode: queryParams.value.sceneCode,
      hasCustomPrompt: queryParams.value.hasCustomPrompt
    }

    const response = await $fetch('/api/admin/ai/prompts/list', { params })
    if (response.code === 200) {
      promptList.value = response.data.list
      total.value = response.data.total
    } else {
      ElMessage.error(response.message || '获取提示词列表失败')
    }
  } catch (error) {
    console.error('获取提示词列表失败:', error)
    ElMessage.error('获取提示词列表失败')
  } finally {
    loading.value = false
  }
}

// 获取选项数据
async function getOptions() {
  try {
    const response = await $fetch('/api/admin/ai/prompts/options')
    if (response.code === 200) {
      sceneOptions.value = response.data.scenes
      modelOptions.value = response.data.models
    }
  } catch (error) {
    console.error('获取选项数据失败:', error)
  }
}

// 搜索处理
function handleQuery() {
  queryParams.value.pageNum = 1
  getPromptList()
}

// 重置搜索
function resetQuery() {
  queryParams.value = {
    search: '',
    sceneCode: '',
    hasCustomPrompt: null,
    pageNum: 1,
    pageSize: 10
  }
  handleQuery()
}

// 分页处理
function handleSizeChange() {
  queryParams.value.pageNum = 1
  getPromptList()
}

function handleCurrentChange() {
  getPromptList()
}

// 选择处理
function handleSelectionChange(selection) {
  selectedRows.value = selection
  multiple.value = !selection.length
}

// 新增
function handleAdd() {
  resetForm()
  isEdit.value = false
  dialogVisible.value = true
}

// 编辑
function handleEdit(row) {
  resetForm()
  isEdit.value = true
  
  // 只复制需要的字段，避免包含额外的计算字段
  formData.value = {
    id: row.id,
    sceneCode: row.sceneCode,
    sceneName: row.sceneName,
    systemPromptDefault: row.systemPromptDefault,
    userPromptCustom: row.userPromptCustom || '',
    isActiveCustom: row.isActiveCustom || false,
    modelPreference: row.modelPreference || ''
  }
  
  // 判断是预设场景还是自定义场景
  const isPresetScene = sceneOptions.value.some(scene => scene.code === row.sceneCode)
  sceneType.value = isPresetScene ? 'preset' : 'custom'
  
  dialogVisible.value = true
}

// 查看
function handleView(row) {
  viewData.value = row
  viewDialogVisible.value = true
}

// 从查看对话框编辑
function handleEditFromView() {
  viewDialogVisible.value = false
  handleEdit(viewData.value)
}

// 删除
function handleDelete(row) {
  // 如果传入了row参数，则删除单个记录
  if (row) {
    ElMessageBox.confirm(
      `确定要删除提示词 "${row.sceneName}" 吗？此操作不可逆。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      deletePrompts([row.id])
    })
  } else {
    // 批量删除
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请选择要删除的提示词')
      return
    }

    const names = selectedRows.value.map(row => row.sceneName).join('、')
    ElMessageBox.confirm(
      `确定要删除这 ${selectedRows.value.length} 个提示词吗？\n${names}`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      const ids = selectedRows.value.map(row => row.id)
      deletePrompts(ids)
    })
  }
}

// 删除提示词
async function deletePrompts(ids) {
  try {
    const response = await $fetch('/api/admin/ai/prompts/delete', {
      method: 'POST',
      body: { ids }
    })

    if (response.code === 200) {
      ElMessage.success(response.message)
      selectedRows.value = []
      getPromptList()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    console.error('删除提示词失败:', error)
    ElMessage.error('删除提示词失败')
  }
}

// 场景类型变化处理
function handleSceneTypeChange(type) {
  // 切换场景类型时清空相关字段
  formData.value.sceneCode = ''
  formData.value.sceneName = ''
  if (!isEdit.value) {
    formData.value.systemPromptDefault = ''
  }
  
  // 如果切换到自定义场景，清空预设场景相关字段
  if (type === 'custom') {
    formData.value.userPromptCustom = ''
    formData.value.isActiveCustom = false
  }
}

// 预设场景选择处理
function handleSceneChange(sceneCode) {
  const scene = sceneOptions.value.find(s => s.code === sceneCode)
  
  if (scene) {
    // 自动填充场景名称
    formData.value.sceneName = scene.name
    
    // 如果没有设置过系统默认提示词，提供模板建议
    if (!isEdit.value && !formData.value.systemPromptDefault) {
      providePromptSuggestion(sceneCode)
    }
  }
}

// 自定义场景代码输入处理
function handleCustomSceneInput() {
  // 可以在这里添加格式验证或建议
}

// 根据场景类型提供提示词建议
function providePromptSuggestion(sceneCode) {
  const promptSuggestions = {
    'domain-analysis': '你是一个域名分析专家。请分析以下域名的商业价值、品牌潜力、记忆度和市场前景...',
    'tag-suggestion': '你是一个域名标签专家。请为以下域名推荐合适的标签，考虑行业、长度、类型等特征...',
    'description-generation': '你是一个域名描述撰写专家。请为以下域名撰写吸引人的描述，突出其价值和应用场景...',
    'pricing-suggestion': '你是一个域名估值专家。请根据域名的特征、市场情况和历史数据，给出合理的价格建议...',
    'inquiry-analysis': '你是一个客户沟通专家。请分析以下线索内容，提取关键信息并评估客户意向...',
    'reply-suggestion': '你是一个销售沟通专家。请根据客户线索内容，提供专业、友好的回复建议...'
  }
  
  if (promptSuggestions[sceneCode]) {
    formData.value.systemPromptDefault = promptSuggestions[sceneCode]
  }
}

// 提交表单
async function handleSubmit() {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitLoading.value = true

    // 构建提交数据，只包含需要的字段
    const submitData = {
      id: formData.value.id,
      sceneCode: formData.value.sceneCode,
      sceneName: formData.value.sceneName,
      systemPromptDefault: formData.value.systemPromptDefault,
      userPromptCustom: sceneType.value === 'custom' ? '' : (formData.value.userPromptCustom || ''),
      isActiveCustom: sceneType.value === 'custom' ? false : (formData.value.isActiveCustom || false),
      modelPreference: formData.value.modelPreference || ''
    }

    const response = await $fetch('/api/admin/ai/prompts/save', {
      method: 'POST',
      body: submitData
    })

    if (response.code === 200) {
      ElMessage.success(response.message)
      dialogVisible.value = false
      getPromptList()
    } else {
      ElMessage.error(response.message || '保存失败')
    }
  } catch (error) {
    console.error('保存提示词失败:', error)
    if (error.statusCode === 409) {
      ElMessage.error('场景代码已存在，请使用不同的场景代码')
    } else {
      ElMessage.error('保存提示词失败')
    }
  } finally {
    submitLoading.value = false
  }
}

// 重置表单
function resetForm() {
  formData.value = {
    id: null,
    sceneCode: '',
    sceneName: '',
    systemPromptDefault: '',
    userPromptCustom: '',
    isActiveCustom: false,
    modelPreference: ''
  }
  sceneType.value = 'preset'
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 初始化默认提示词
async function initPrompts() {
  ElMessageBox.confirm(
    '确定要初始化默认提示词吗？这将创建系统预设的AI场景提示词。',
    '确认初始化',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(async () => {
    try {
      // 这里可以批量创建默认提示词
      ElMessage.info('功能开发中，敬请期待')
    } catch (error) {
      ElMessage.error('初始化失败')
    }
  })
}

// 工具函数
function truncateText(text, length) {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

function getModelLabel(modelValue) {
  const model = modelOptions.value.find(m => m.value === modelValue)
  return model ? model.label : modelValue
}

// 初始化
onMounted(() => {
  Promise.all([
    getOptions(),
    getPromptList()
  ])
})

// 监听自定义提示词变化，自动启用/禁用开关
watch(() => formData.value.userPromptCustom, (newVal) => {
  if (!newVal) {
    formData.value.isActiveCustom = false
  }
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}
.prompt-preview {
  display: flex;
  flex-direction: column;
}

.prompt-text {
  color: #606266;
  font-size: 13px;
  line-height: 1.4;
  margin-top: 5px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.view-content h4 {
  color: #303133;
  margin: 20px 0 10px 0;
  font-weight: 600;
}

.view-content h4:first-of-type {
  margin-top: 10px;
}
</style> 