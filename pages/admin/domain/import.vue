<template>
  <el-dialog
    title="批量导入域名"
    v-model="visible"
    width="70%"
    append-to-body
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="import-container">
      <!-- 步骤指示器 -->
      <el-steps :active="currentStep" align-center class="steps" finish-status="success">
        <el-step title="选择数据源" description="上传文件或输入文本" />
        <el-step title="数据预览" description="查看解析结果" />
        <el-step title="列映射配置" description="设置字段映射" />
        <el-step title="导入设置" description="配置导入选项" />
        <el-step title="导入结果" description="查看导入统计" />
      </el-steps>

      <!-- 调试信息 -->
      <div class="debug-info" v-if="false">
        当前步骤: {{ currentStep }}
      </div>

      <!-- 步骤1: 选择数据源 -->
      <div v-if="currentStep === 0" class="step-content">
        <el-tabs v-model="importMethod" @tab-change="handleMethodChange">
          <!-- 文件上传 -->
          <el-tab-pane label="文件上传" name="file">
            <div class="upload-area">
              <el-upload
                ref="uploadRef"
                :auto-upload="false"
                :show-file-list="true"
                :on-change="handleFileChange"
                accept=".csv,.xlsx,.xls,.txt"
                drag
                class="upload-dragger"
              >
                <el-icon class="el-icon--upload">
                  <UploadFilled />
                </el-icon>
                <div class="el-upload__text">
                  将文件拖到此处，或<em>点击上传</em>
                </div>
                <div class="el-upload__tip">
                  支持 CSV、XLSX、TXT 格式文件，文件大小不超过 10MB
                </div>
              </el-upload>
            </div>
          </el-tab-pane>

          <!-- 文本输入 -->
          <el-tab-pane label="文本输入" name="text">
            <div class="text-input-area">
              <el-input
                v-model="textInput"
                type="textarea"
                :rows="12"
                placeholder="请粘贴域名数据，每行一条记录，列之间用空格或制表符分隔
                
示例格式：
1.com 15000 1200 第一 (域名 销售价格 成本 描述)
2.com 8000 800 数字二
abc.com 5000 500 字母域名
..."
                class="text-input"
              />
              <div class="input-tips">
                <el-alert
                  title="格式说明"
                  type="info"
                  :closable="false"
                  show-icon
                >
                  <ul>
                    <li>每行一条记录，列之间用空格或制表符分隔</li>
                    <li>建议每行的数据格式一致</li>
                    <li>建议格式：域名 销售价格 域名成本 描述</li>
                    <li>销售价格和域名成本为数字，可以只有一个价格</li>
                  </ul>
                </el-alert>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>

        <div class="step-actions">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="nextStep" :disabled="!canProceed">
            下一步
          </el-button>
        </div>
      </div>

      <!-- 步骤2: 数据预览 -->
      <div v-if="currentStep === 1" class="step-content">
        <div class="preview-header">
          <div class="preview-stats">
            <el-tag>总行数: {{ previewData.length }}</el-tag>
            <el-tag type="success">有效数据: {{ validRowCount }}</el-tag>
            <el-tag type="warning" v-if="invalidRowCount > 0">无效数据: {{ invalidRowCount }}</el-tag>
          </div>
        </div>

        <el-table :data="previewData.slice(0, 10)" border class="preview-table">
          <el-table-column type="index" label="行号" width="60" />
          <el-table-column
            v-for="(column, index) in tableColumns"
            :key="index"
            :label="`列 ${index + 1}`"
            :prop="`col${index}`"
            min-width="120"
          >
            <template #default="{ row }">
              <span :class="{ 'invalid-data': !isValidData(row, index) }">
                {{ row[`col${index}`] }}
              </span>
            </template>
          </el-table-column>
        </el-table>

        <div v-if="previewData.length > 10" class="preview-note">
          <el-alert title="仅显示前10行数据用于预览" type="info" :closable="false" />
        </div>

        <div class="step-actions">
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="nextStep" :disabled="validRowCount === 0">
            下一步
          </el-button>
        </div>
      </div>

      <!-- 步骤3: 列映射配置 -->
      <div v-if="currentStep === 2" class="step-content">
        <div class="mapping-header">
          <el-button type="primary" size="small" @click="autoDetectColumns">
            智能识别
          </el-button>
        </div>

        <div class="mapping-grid">
          <div v-for="(column, index) in tableColumns" :key="index" class="mapping-item">
            <div class="column-preview">
              <strong>列 {{ index + 1 }}</strong>
              <div class="sample-data">
                <div v-for="(sample, sIndex) in getColumnSamples(index)" :key="sIndex">
                  {{ sample }}
                </div>
              </div>
            </div>
            <div class="mapping-select">
              <el-select v-model="columnMapping[index]" placeholder="请选择字段">
                <el-option label="域名" value="domain" />
                <el-option label="销售价格" value="price" />
                <el-option label="域名成本" value="cost" />
                <el-option label="含义/描述" value="description" />
                <el-option label="分类" value="category" />
                <el-option label="忽略此列" value="ignore" />
              </el-select>
            </div>
          </div>
        </div>

        <div class="mapping-validation">
          <el-alert
            v-if="!columnMapping.includes('domain')"
            title="请至少选择一列作为域名字段"
            type="error"
            :closable="false"
          />
          <el-alert
            v-if="getDuplicateMappings().length > 0"
            :title="`重复映射字段: ${getDuplicateMappings().join(', ')}`"
            type="warning"
            :closable="false"
          />
        </div>

        <div class="step-actions">
          <el-button @click="prevStep">上一步</el-button>
          <el-button
            type="primary"
            @click="nextStep"
            :disabled="!columnMapping.includes('domain') || getDuplicateMappings().length > 0"
          >
            下一步
          </el-button>
        </div>
      </div>

      <!-- 步骤4: 导入设置 -->
      <div v-if="currentStep === 3" class="step-content">
        <div class="import-settings">
          <el-form :model="importConfig" label-width="120px" class="settings-form">
            <el-form-item label="重复处理">
              <el-radio-group v-model="importConfig.duplicateHandling">
                <el-radio value="skip">跳过重复域名</el-radio>
                <el-radio value="update">更新已存在域名</el-radio>
                <el-radio value="error">遇到重复停止导入</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="默认状态">
              <el-select v-model="importConfig.defaultStatus">
                <el-option v-for="status in SALES_STATUS_OPTIONS" :key="status.value" :label="status.label" :value="status.value" />
              </el-select>
            </el-form-item>

            <el-form-item label="默认分类">
              <el-select v-model="importConfig.defaultCategory" clearable placeholder="域名无分组不能被米表关联哦">
                <el-option
                  v-for="category in categories"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="价格单位">
              <el-select v-model="importConfig.priceUnit">
                <el-option label="元" value="CNY" />
                <el-option label="美元" value="USD" />
              </el-select>
            </el-form-item>

            <el-form-item label="数据验证">
              <el-checkbox v-model="importConfig.validateDomain">验证域名格式</el-checkbox>
              <el-checkbox v-model="importConfig.validatePrice">验证价格格式</el-checkbox>
            </el-form-item>
          </el-form>

          <div class="import-summary">
            <h5>导入摘要</h5>
            <div class="summary-items">
              <div class="summary-item">
                <span>总记录数:</span>
                <span>{{ validRowCount }}</span>
              </div>
              <div class="summary-item">
                <span>域名字段:</span>
                <span>列 {{ columnMapping.indexOf('domain') + 1 }}</span>
              </div>
              <div class="summary-item" v-if="columnMapping.includes('price')">
                <span>销售价格:</span>
                <span>列 {{ columnMapping.indexOf('price') + 1 }}</span>
              </div>
              <div class="summary-item" v-if="columnMapping.includes('cost')">
                <span>域名成本:</span>
                <span>列 {{ columnMapping.indexOf('cost') + 1 }}</span>
              </div>
              <div class="summary-item" v-if="columnMapping.includes('description')">
                <span>描述字段:</span>
                <span>列 {{ columnMapping.indexOf('description') + 1 }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="step-actions">
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="startImport" :loading="importing">
            开始导入
          </el-button>
        </div>
      </div>

      <!-- 步骤5: 导入结果 -->
      <div v-if="currentStep === 4" class="step-content">
        <div class="import-results">
          <div class="result-header">
            <h4>
              <span class="step-number">第5步</span>
              导入结果
            </h4>
            <el-tag :type="importResult.success ? 'success' : 'danger'" size="large">
              {{ importResult.success ? '导入完成' : '导入失败' }}
            </el-tag>
          </div>

          <div class="result-stats">
            <div class="stat-item success">
              <div class="stat-number">{{ importResult.successCount }}</div>
              <div class="stat-label">成功导入</div>
            </div>
            <div class="stat-item warning">
              <div class="stat-number">{{ importResult.skipCount }}</div>
              <div class="stat-label">跳过记录</div>
            </div>
            <div class="stat-item error">
              <div class="stat-number">{{ importResult.errorCount }}</div>
              <div class="stat-label">失败记录</div>
            </div>
          </div>

          <div v-if="importResult.errors.length > 0" class="error-details">
            <h5>错误详情</h5>
            <el-table :data="importResult.errors" border max-height="300">
              <el-table-column prop="row" label="行号" width="80" />
              <el-table-column prop="domain" label="域名" />
              <el-table-column prop="error" label="错误信息" />
            </el-table>
          </div>

          <div class="step-actions">
            <el-button @click="handleClose">关闭</el-button>
            <el-button type="primary" @click="resetImport">重新导入</el-button>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'
import { SALES_STATUS_OPTIONS } from '~/utils/constants.js'

// Props and Emits
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

// 响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const currentStep = ref(0)
const importMethod = ref('file')
const textInput = ref('')
const previewData = ref([])
const tableColumns = ref([])
const columnMapping = ref([])
const importing = ref(false)
const categories = ref([])

// 导入配置
const importConfig = reactive({
  duplicateHandling: 'skip',
  defaultStatus: 1,
  defaultCategory: null,
  priceUnit: 'CNY',
  validateDomain: true,
  validatePrice: true
})

// 导入结果
const importResult = reactive({
  success: false,
  successCount: 0,
  skipCount: 0,
  errorCount: 0,
  errors: []
})

// 计算属性
const canProceed = computed(() => {
  if (importMethod.value === 'file') {
    return previewData.value.length > 0
  } else {
    return textInput.value.trim().length > 0
  }
})

const validRowCount = computed(() => {
  return previewData.value.filter(row => isValidRow(row)).length
})

const invalidRowCount = computed(() => {
  return previewData.value.length - validRowCount.value
})

// 方法
function handleClose() {
  visible.value = false
  resetImport()
}

function resetImport() {
  currentStep.value = 0
  previewData.value = []
  tableColumns.value = []
  columnMapping.value = []
  textInput.value = ''
  importResult.success = false
  importResult.successCount = 0
  importResult.skipCount = 0
  importResult.errorCount = 0
  importResult.errors = []
}

function handleMethodChange() {
  previewData.value = []
  tableColumns.value = []
}

function handleFileChange(file) {
  const reader = new FileReader()
  
  reader.onload = (e) => {
    try {
      const data = e.target.result
      const extension = file.name.split('.').pop().toLowerCase()
      
      if (extension === 'csv') {
        parseCSV(data)
      } else if (extension === 'xlsx' || extension === 'xls') {
        parseXLSX(data)
      } else if (extension === 'txt') {
        parseTXT(data)
      }
    } catch (error) {
      ElMessage.error('文件解析失败: ' + error.message)
    }
  }

  if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
    reader.readAsArrayBuffer(file.raw)
  } else {
    reader.readAsText(file.raw, 'UTF-8')
  }
}

function parseCSV(data) {
  const lines = data.split('\n').filter(line => line.trim())
  const rows = lines.map(line => {
    // 处理CSV中的引号和逗号
    const columns = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        columns.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    columns.push(current.trim())
    
    const row = {}
    columns.forEach((col, index) => {
      row[`col${index}`] = col
    })
    return row
  })
  
  if (rows.length > 0) {
    const columnCount = Object.keys(rows[0]).length
    tableColumns.value = Array.from({ length: columnCount }, (_, i) => `col${i}`)
    columnMapping.value = new Array(columnCount).fill('ignore')
    previewData.value = rows
  }
}

function parseXLSX(data) {
  const workbook = XLSX.read(data, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 })
  
  const rows = jsonData.filter(row => row.some(cell => cell != null)).map(row => {
    const rowData = {}
    row.forEach((cell, index) => {
      rowData[`col${index}`] = cell != null ? String(cell).trim() : ''
    })
    return rowData
  })
  
  if (rows.length > 0) {
    const columnCount = Math.max(...rows.map(row => Object.keys(row).length))
    tableColumns.value = Array.from({ length: columnCount }, (_, i) => `col${i}`)
    columnMapping.value = new Array(columnCount).fill('ignore')
    previewData.value = rows
  }
}

function parseTXT(data) {
  const lines = data.split('\n').filter(line => line.trim())
  const rows = lines.map(line => {
    // 按空格或制表符分割
    const columns = line.trim().split(/\s+/)
    const row = {}
    columns.forEach((col, index) => {
      row[`col${index}`] = col
    })
    return row
  })
  
  if (rows.length > 0) {
    const columnCount = Math.max(...rows.map(row => Object.keys(row).length))
    tableColumns.value = Array.from({ length: columnCount }, (_, i) => `col${i}`)
    columnMapping.value = new Array(columnCount).fill('ignore')
    previewData.value = rows
  }
}

function parseTextInput() {
  if (!textInput.value.trim()) return
  
  const lines = textInput.value.trim().split('\n').filter(line => line.trim())
  const rows = lines.map(line => {
    const columns = line.trim().split(/\s+/)
    const row = {}
    columns.forEach((col, index) => {
      row[`col${index}`] = col
    })
    return row
  })
  
  if (rows.length > 0) {
    const columnCount = Math.max(...rows.map(row => Object.keys(row).length))
    tableColumns.value = Array.from({ length: columnCount }, (_, i) => `col${i}`)
    columnMapping.value = new Array(columnCount).fill('ignore')
    previewData.value = rows
  }
}

function isValidRow(row) {
  return Object.values(row).some(value => value && value.toString().trim())
}

function isValidData(row, columnIndex) {
  const value = row[`col${columnIndex}`]
  if (!value) return false
  
  const mapping = columnMapping.value[columnIndex]
  if (mapping === 'domain') {
    return /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/.test(value)
  } else if (mapping === 'price' || mapping === 'cost') {
    return /^\d+(\.\d+)?$/.test(value)
  }
  return true
}

function getColumnSamples(columnIndex) {
  return previewData.value
    .slice(0, 5)
    .map(row => row[`col${columnIndex}`])
    .filter(val => val)
}

function autoDetectColumns() {
  const newMapping = [...columnMapping.value]
  
  tableColumns.value.forEach((column, index) => {
    const samples = getColumnSamples(index)
    
    // 检测域名列
    const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/
    if (samples.some(sample => domainPattern.test(sample))) {
      newMapping[index] = 'domain'
      return
    }
    
    // 检测价格列
    const pricePattern = /^\d+(\.\d+)?$/
    if (samples.every(sample => sample && pricePattern.test(sample))) {
      // 如果已经有价格字段，这个设为成本
      if (newMapping.includes('price')) {
        newMapping[index] = 'cost'
      } else {
        newMapping[index] = 'price'
      }
      return
    }
    
    // 其他列默认为描述
    if (samples.length > 0 && !newMapping.includes('description')) {
      newMapping[index] = 'description'
    }
  })
  
  columnMapping.value = newMapping
  ElMessage.success('智能识别完成')
}

function getDuplicateMappings() {
  const mappings = columnMapping.value.filter(m => m !== 'ignore')
  const duplicates = []
  const seen = new Set()
  
  for (const mapping of mappings) {
    if (seen.has(mapping)) {
      duplicates.push(mapping)
    } else {
      seen.add(mapping)
    }
  }
  
  return duplicates
}

function nextStep() {
  if (currentStep.value === 0) {
    if (importMethod.value === 'text') {
      parseTextInput()
    }
    if (previewData.value.length === 0) {
      ElMessage.error('请先选择文件或输入数据')
      return
    }
  }
  
  currentStep.value++
}

function prevStep() {
  currentStep.value--
}

async function startImport() {
  importing.value = true
  
  try {
    // 准备导入数据
    const importData = prepareImportData()
    
    // 调用API进行导入
    const response = await $fetch('/api/admin/domains/import', {
      method: 'POST',
      body: {
        data: importData,
        config: importConfig
      }
    })
    
    // 更新结果
    Object.assign(importResult, response)
    
    ElMessage.success(`导入完成！成功 ${response.successCount} 条，跳过 ${response.skipCount} 条`)
    currentStep.value = 4
    
    // 通知父组件刷新数据
    emit('success')
    
  } catch (error) {
    ElMessage.error('导入失败: ' + error.message)
  } finally {
    importing.value = false
  }
}

function prepareImportData() {
  return previewData.value
    .filter(row => isValidRow(row))
    .map((row, index) => {
      const item = { rowIndex: index + 1 }
      
      columnMapping.value.forEach((mapping, colIndex) => {
        if (mapping !== 'ignore') {
          item[mapping] = row[`col${colIndex}`]
        }
      })
      
      return item
    })
}

// 获取分类列表
async function getCategories() {
  try {
    const response = await $fetch('/api/admin/categories/list')
    categories.value = response.data?.categories || []
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

// 初始化
watch(visible, (newVal) => {
  if (newVal) {
    getCategories()
  }
})
</script>

<style scoped>
.import-container {
  min-height: 500px;
}

.steps {
  margin-bottom: 30px;
}

.steps :deep(.el-step__head.is-process) {
  color: #409eff;
  border-color: #409eff;
}

.steps :deep(.el-step__head.is-finish) {
  color: #67c23a;
  border-color: #67c23a;
}

.steps :deep(.el-step__title.is-process) {
  color: #409eff;
  font-weight: bold;
}

.steps :deep(.el-step__title.is-finish) {
  color: #67c23a;
}

.step-content {
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.step-actions {
  margin-top: auto;
  padding-top: 20px;
  text-align: right;
  border-top: 1px solid #e6e6e6;
}

/* 步骤1样式 */
.upload-area {
  margin: 20px 0;
}

.upload-dragger {
  width: 100%;
}

.text-input-area {
  margin: 20px 0;
}

.text-input {
  font-family: 'Courier New', monospace;
}

.input-tips {
  margin-top: 10px;
}

.input-tips ul {
  margin: 0;
  padding-left: 20px;
}

/* 步骤2样式 */
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.preview-stats {
  display: flex;
  gap: 10px;
}

.preview-table {
  margin-bottom: 10px;
}

.invalid-data {
  color: #f56c6c;
  text-decoration: line-through;
}

.preview-note {
  margin: 10px 0;
}

/* 步骤3样式 */
.mapping-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.mapping-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.mapping-item {
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  padding: 15px;
}

.column-preview {
  margin-bottom: 15px;
}

.sample-data {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}

.sample-data div {
  padding: 2px 0;
  border-bottom: 1px solid #f0f0f0;
}

.mapping-validation {
  margin-bottom: 20px;
}

/* 步骤4样式 */
.import-settings {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.settings-form {
  margin: 20px 0;
}

.import-summary {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
  flex: 0.5
}

.summary-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
}

/* 步骤5样式 */
.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  border-radius: 8px;
}

.stat-item.success {
  background: #f0f9ff;
  color: #059669;
}

.stat-item.warning {
  background: #fffbeb;
  color: #d97706;
}

.stat-item.error {
  background: #fef2f2;
  color: #dc2626;
}

.stat-number {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
}

.error-details {
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .mapping-grid {
    grid-template-columns: 1fr;
  }
  
  .summary-items {
    grid-template-columns: 1fr;
  }
  
  .result-stats {
    grid-template-columns: 1fr;
  }
}
</style>
