<template>
     <!-- 添加或修改域名对话框 -->
     <el-dialog :title="props.title" v-model="open" width="1000px" append-to-body class="domain-dialog">
      <el-form ref="domainRef" :model="form" :rules="rules" label-width="120px" style="max-height: 600px;">
        <!-- 基本信息 -->
        <el-divider content-position="left">
          <span style="color: #409eff; font-weight: 600">📋 基本信息</span>
        </el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="域名" prop="domainName">
              <el-input v-model="form.domainName" placeholder="请输入域名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="注册商" prop="registrarId">
              <el-select v-model="form.registrarId" placeholder="请选择注册商" clearable style="width: 100%">
                <el-option v-for="registrar in options.registrars" :key="registrar.id" :label="registrar.name"
                  :value="registrar.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="创建时间" prop="creationDate">
              <el-date-picker v-model="form.creationDate" type="date" placeholder="选择创建时间" format="YYYY-MM-DD"
                value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="到期时间" prop="expiryDate">
              <el-date-picker v-model="form.expiryDate" type="date" placeholder="选择到期时间" format="YYYY-MM-DD"
                value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="域名状态" prop="domainStatus">
              <el-select v-model="form.domainStatus" placeholder="请选择域名状态" style="width: 100%">
                <el-option v-for="status in options.domainStatusOptions" :key="status.value" :label="status.label"
                  :value="status.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="销售状态" prop="salesStatus">
              <el-select v-model="form.salesStatus" placeholder="请选择销售状态" style="width: 100%">
                <el-option v-for="status in options.salesStatusOptions" :key="status.value" :label="status.label"
                  :value="status.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" prop="categoryId">
              <el-select v-model="form.categoryId" placeholder="请选择分类" clearable style="width: 100%">
                <el-option v-for="category in options.categories" :key="category.id" :label="category.name"
                  :value="category.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="标签" prop="tagIds">
              <el-select v-model="form.tagIds" multiple placeholder="请选择标签" style="width: 100%">
                <el-option v-for="tag in options.tags" :key="tag.id" :label="tag.name" :value="tag.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 价格设置 -->
        <el-divider content-position="left">
          <span style="color: #67c23a; font-weight: 600">💰 价格设置</span>
        </el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="购买价格" prop="purchasePrice">
              <el-input-number v-model="form.purchasePrice" :precision="2" :min="0" placeholder="域名购买成本"
                style="width: 100%" />
            </el-form-item>
          </el-col>

        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="销售价格" prop="salesPrice">
              <el-input-number v-model="form.salesPrice" :precision="2" :min="0" placeholder="域名销售价格"
                style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="价格有效期" prop="priceExpiry">
              <el-date-picker v-model="form.priceExpiry" type="datetime" placeholder="选择价格有效期"
                format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </el-form-item>
          </el-col>

        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="折扣价格" prop="discount">
              <el-input-number v-model="form.discount" :precision="2" :min="0" placeholder="折扣价格"
                style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="折扣有效期" prop="discountExpiry">
              <el-date-picker v-model="form.discountExpiry" type="datetime" placeholder="选择折扣有效期"
                format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 域名描述 -->
        <el-divider content-position="left">
          <span style="color: #e6a23c; font-weight: 600">📝 域名描述</span>
        </el-divider>

        <el-form-item label="域名含义" prop="domainMeaning">
          <el-input v-model="form.domainMeaning" placeholder="简短描述域名的含义，如：数字、字母、行业相关等" maxlength="100"
            show-word-limit />
        </el-form-item>

        <el-form-item label="域名描述" prop="domainDescription">
          <div class="description-input">
            <el-input v-model="form.domainDescription" type="textarea" :rows="4" placeholder="详细描述域名的价值、用途、特点等"
              maxlength="500" show-word-limit style="width: 100%;" />
            <el-button type="primary" size="small" :icon="aiGenerating ? 'Loading' : 'MagicStick'"
                :loading="aiGenerating" @click="generateAIDescription" class="ai-btn">
                AI生成
              </el-button>
          </div>
        </el-form-item>

        <!-- 技术信息 -->
        <el-divider content-position="left">
          <span style="color: #606266; font-weight: 600">⚙️ 技术信息</span>
        </el-divider>

        <el-form-item label="域名服务器" prop="nameServers">
          <el-input v-model="form.nameServers"  placeholder="请输入域名服务器，多个用逗号分隔" />
        </el-form-item>

        <el-form-item label="持有人信息" prop="holderInfo">
          <el-input v-model="form.holderInfo" type="textarea" :rows="3" placeholder="请输入持有人信息" />
        </el-form-item>

        <!-- 备注信息 -->
        <el-divider content-position="left">
          <span style="color: #f56c6c; font-weight: 600">💬 备注信息</span>
        </el-divider>

        <el-form-item label="备注" prop="notes">
          <el-input v-model="form.notes" type="textarea" :rows="3" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
</template>

<script setup name="DomainEdit">
import { ElMessage } from 'element-plus'
import { SALES_STATUS_OPTIONS } from '~/utils/constants.js'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  domainData: {
    type: Object,
    default: null
  },
  options: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'success'])

// refs
const domainRef = ref()

// 响应式数据
const open = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const aiGenerating = ref(false)

// 直接使用传入的title属性


const data = reactive({
  form: {},
  rules: {
    domainName: [
      { required: true, message: "域名不能为空", trigger: "blur" },
      {
        min: 1,
        max: 255,
        message: "域名长度在 1 到 255 个字符",
        trigger: "blur",
      },
    ],
    domainStatus: [
      { required: true, message: "请选择域名状态", trigger: "change" },
    ],
    salesStatus: [
      { required: true, message: "请选择销售状态", trigger: "change" },
    ],
  },
});

const { form, rules } = toRefs(data);

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
    salesPrice: null,
    discount: null,
    discountExpiry: null,
    priceExpiry: null,
    domainMeaning: null,
    domainDescription: null,
    holderInfo: null,
    notes: null,
    domainStatus: 1,
    salesStatus: 1,
    categoryId: null,
    tagIds: [],
  };
  if (domainRef.value) {
    domainRef.value.resetFields();
  }
}

// 提交按钮
function submitForm() {
  if (!domainRef.value) return;

  domainRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await $fetch("/api/admin/domains/save", {
          method: "POST",
          body: form.value,
        });

        if (response.code === 200) {
          ElMessage.success(response.message || "操作成功");
          open.value = false;
          emit('success');
        } else {
          ElMessage.error(response.message || "操作失败");
        }
      } catch (error) {
        console.error("操作失败:", error);
        ElMessage.error("操作失败");
      }
    }
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
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


// AI生成域名描述
async function generateAIDescription() {
  if (!form.value.domainName) {
    ElMessage.warning("请先输入域名");
    return;
  }

  aiGenerating.value = true;
  try {
    const response = await $fetch("/api/admin/ai/generate-domain-description", {
      method: "POST",
      body: {
        domain: form.value.domainName,
        meaning: form.value.domainMeaning,
      },
    });

    if (response.code === 200) {
      form.value.domainDescription = response.data.description;
      ElMessage.success("AI描述生成成功");
    } else {
      ElMessage.error(response.message || "AI描述生成失败");
    }
  } catch (error) {
    console.error("AI描述生成失败:", error);
    ElMessage.error("AI描述生成失败");
  } finally {
    aiGenerating.value = false;
  }
}
// 监听弹窗开启，初始化数据
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    if (props.domainData) {
      // 编辑模式
      form.value = { ...props.domainData };
    } else {
      // 新增模式
      reset();
    }
  }
})

// 组件暴露的方法，供父组件调用
defineExpose({
  reset,
})
</script>
<style scoped>
/* 域名对话框样式 */
.domain-dialog .el-dialog__body {
  max-height: 70vh;
  overflow-y: auto;
}

.description-input {
  position: relative;
  width: 100%;
}

.description-input :deep(.el-textarea__inner) {
  padding-right: 80px !important;
}

.ai-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}
</style>