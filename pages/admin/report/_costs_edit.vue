<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="600px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="formRules"
      label-width="100px"
    >
      <!-- 域名选择 - 支持单个和批量 -->
      <el-form-item v-if="!batchMode" label="域名" prop="domainId">
        <el-select v-model="form.domainId" placeholder="请选择域名" style="width: 100%">
          <el-option
            v-for="domain in domainOptions"
            :key="domain.value"
            :label="domain.label"
            :value="domain.value"
          />
        </el-select>
      </el-form-item>
      
      <!-- 批量模式显示 -->
      <el-form-item v-if="batchMode" label="操作域名">
        <el-alert type="info" :closable="false">
          将为 {{ batchDomains.length }} 个域名添加成本记录
        </el-alert>
        <div style="margin-top: 8px; max-height: 150px; overflow-y: auto;">
          <el-tag
            v-for="domain in batchDomains"
            :key="domain.id"
            size="small"
            style="margin: 2px;"
          >
            {{ domain.domainName }}
          </el-tag>
        </div>
      </el-form-item>
      
      <el-form-item label="成本类型" prop="costType">
        <el-select v-model="form.costType" placeholder="请选择成本类型" style="width: 100%">
          <el-option
            v-for="type in costTypeOptions"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="金额" prop="amount">
        <el-input-number
          v-model="form.amount"
          placeholder="请输入金额"
          :min="0"
          :precision="2"
          style="width: 100%"
        />
      </el-form-item>
      
      <el-form-item label="成本日期" prop="costDate">
        <el-date-picker
          v-model="form.costDate"
          type="date"
          placeholder="请选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>
      
      <el-form-item label="续费年限" prop="renewalYears" v-if="form.costType === 'renewal'">
        <el-input-number
          v-model="form.renewalYears"
          placeholder="续费年限（仅续费类型）"
          :min="1"
          :max="10"
          style="width: 100%"
        />
      </el-form-item>
      
      <el-form-item label="备注" prop="notes">
        <el-input
          v-model="form.notes"
          type="textarea"
          placeholder="请输入备注"
          :rows="3"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

// Props定义
interface Props {
  modelValue: boolean
  editData?: any  // 编辑时的数据
  domainOptions: Array<{value: number, label: string}>
  costTypeOptions: Array<{value: string, label: string}>
  batchMode?: boolean  // 是否批量模式
  batchDomains?: Array<{id: number, domainName: string}>  // 批量模式的域名列表
}

const props = withDefaults(defineProps<Props>(), {
  batchMode: false,
  batchDomains: () => []
})

// Emits定义
interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const emit = defineEmits<Emits>()

// 响应式数据
const formRef = ref()
const loading = ref(false)

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const dialogTitle = computed(() => {
  if (props.batchMode) {
    return '批量添加成本记录'
  }
  return props.editData ? '编辑成本记录' : '新增成本记录'
})

// 表单数据
const form = reactive({
  id: undefined as number | undefined,
  domainId: undefined as number | undefined,
  domainIds: [] as number[],
  costType: '',
  amount: undefined as number | undefined,
  costDate: '',
  renewalYears: undefined as number | undefined,
  notes: ''
})
// 重置表单
const resetForm = () => {
  form.id = undefined
  form.domainId = undefined
  form.domainIds = []
  form.costType = ''
  form.amount = undefined
  form.costDate = ''
  form.renewalYears = undefined
  form.notes = ''
  formRef.value?.clearValidate()
}
// 表单验证规则
const formRules = computed(() => {
  const rules: any = {
    costType: [
      { required: true, message: '请选择成本类型', trigger: 'change' }
    ],
    amount: [
      { required: true, message: '请输入金额', trigger: 'blur' },
      { type: 'number', min: 0.01, message: '金额必须大于0', trigger: 'blur' }
    ],
    costDate: [
      { required: true, message: '请选择日期', trigger: 'change' }
    ]
  }
  
  // 非批量模式需要选择域名
  if (!props.batchMode) {
    rules.domainId = [
      { required: true, message: '请选择域名', trigger: 'change' }
    ]
  }
  
  return rules
})

// 监听编辑数据变化，填充表单
watch(() => props.editData, (newData) => {
  if (newData) {
    form.id = newData.id
    form.domainId = newData.domainId
    form.costType = newData.costType
    form.amount = newData.amount
    form.costDate = newData.costDate
    form.renewalYears = newData.renewalYears
    form.notes = newData.notes
  } else {
    resetForm()
  }
}, { immediate: true })

// 监听批量域名变化
watch(() => props.batchDomains, (domains) => {
  if (props.batchMode && domains) {
    form.domainIds = domains.map(d => d.id)
  }
}, { immediate: true })

// 监听弹窗显示，重置表单或设置默认值
watch(visible, (show) => {
  if (show && !props.editData) {
    resetForm()
    // 批量模式设置默认值
    if (props.batchMode) {
      form.costDate = new Date().toISOString().split('T')[0]
      form.domainIds = props.batchDomains.map(d => d.id)
    }
  }
})



// 关闭弹窗
const handleClose = () => {
  visible.value = false
  resetForm()
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    
    loading.value = true
    
    // 构建提交数据
    const submitData: any = {
      costType: form.costType,
      amount: form.amount,
      costDate: form.costDate,
      renewalYears: form.renewalYears,
      notes: form.notes
    }
    
    let action = ''
    if (props.batchMode) {
      // 批量模式
      action = 'batchCreate'
      submitData.domainIds = form.domainIds
    } else if (form.id) {
      // 编辑模式
      action = 'update'
      submitData.id = form.id
      submitData.domainId = form.domainId
    } else {
      // 新增模式
      action = 'create'
      submitData.domainId = form.domainId
    }
    
    await $fetch('/api/admin/report/costs/save', {
      method: 'POST',
      body: { action, data: submitData }
    })

    ElMessage.success(
      props.batchMode 
        ? `成功为 ${form.domainIds.length} 个域名添加成本记录`
        : form.id ? '更新成功' : '创建成功'
    )
    
    emit('success')
    handleClose()
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
