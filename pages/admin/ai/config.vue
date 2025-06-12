<template>
  <div class="app-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <p style="color: #666; margin-top: 8px;">配置第三方AI服务的API密钥和相关参数，用于系统AI功能</p>
    </div>

    <!-- 供应商下拉+单卡片 -->
    <div class="single-config-card">
      <el-card class="service-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <div class="service-info">
              <el-select v-model="selectedServiceKey" placeholder="选择AI供应商" style="width: 200px" @change="onServiceChange">
                <el-option v-for="vendor in aiVendors" :key="vendor.serviceKey" :label="vendor.serviceName" :value="vendor.serviceKey" />
              </el-select>
              <el-tag type="success" size="small" style="margin-left: 10px;">当前供应商</el-tag>
            </div>
          </div>
        </template>

        <div v-if="config" class="service-content">
          <p class="service-description">{{ config.description }}</p>
          <!-- API Key 配置 -->
          <div class="config-item">
            <label class="config-label">API Key</label>
            <div class="api-key-input">
              <el-input
                v-model="config.apiKey"
                :type="config.showApiKey ? 'text' : 'password'"
                placeholder="请输入API Key"
                clearable
              >
                <template #suffix>
                  <el-button
                    :icon="config.showApiKey ? 'Hide' : 'View'"
                    text
                    @click="config.showApiKey = !config.showApiKey"
                  />
                </template>
              </el-input>
            </div>
          </div>
          <!-- Base URL 配置 -->
          <div class="config-item">
            <label class="config-label">Base URL</label>
            <el-input
              v-model="config.baseUrl"
              placeholder="API 基础地址"
              clearable
              @blur="handleSaveConfig"
            >
              <template #suffix>
                <el-button
                  v-if="config.baseUrl !== config.defaultBaseUrl"
                  text
                  size="small"
                  @click="resetBaseUrl(config)"
                >
                  重置
                </el-button>
              </template>
            </el-input>
          </div>
          <!-- 支持的模型 -->
          <div class="config-item">
            <label class="config-label">支持的模型</label>
            <div style="display: flex; align-items: center; gap: 10px;">
              <el-select v-model="config.model" :disabled="!config.models.length" placeholder="请先测试连接" style="flex:1;">
                <el-option v-for="model in config.models" :key="model" :label="model" :value="model" />
              </el-select>
              <el-button @click="testConnection" type="primary" :loading="config.testing">测试连接</el-button>
            </div>
            <span v-if="!config.models.length" style="color: #f56c6c; font-size: 13px;">请先测试连接以获取模型列表</span>
          </div>
          
        </div>
      </el-card>
    </div>

    <!-- 全局操作 -->
    <div class="global-actions">
      <el-button type="primary" @click="refreshConfigs">
        <el-icon><Refresh /></el-icon>
        刷新配置
      </el-button>
      <el-button @click="showHelp = true">
        <el-icon><QuestionFilled /></el-icon>
        配置帮助
      </el-button>
      <el-button
          type="primary"
          @click="handleSaveConfig"
          :disabled="!config?.apiKey || !config?.model"
        >
        <el-icon><DocumentChecked /></el-icon>
          保存
        </el-button>
    </div>

    <!-- 帮助对话框 -->
    <el-dialog title="AI服务配置帮助" v-model="showHelp" width="800px">
      <div class="help-content">
        <h4>如何获取API Key：</h4>
        <ul>
          <li><strong>OpenAI:</strong> 访问 <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI API Keys</a> 页面</li>
          <li><strong>Claude:</strong> 访问 <a href="https://console.anthropic.com/" target="_blank">Anthropic Console</a></li>
          <li><strong>Gemini:</strong> 访问 <a href="https://makersuite.google.com/app/apikey" target="_blank">Google AI Studio</a></li>
          <li><strong>月之暗面:</strong> 访问 <a href="https://platform.moonshot.cn/" target="_blank">Moonshot 控制台</a></li>
          <li><strong>智谱AI:</strong> 访问 <a href="https://open.bigmodel.cn/" target="_blank">智谱AI开放平台</a></li>
          <li><strong>通义千问:</strong> 访问 <a href="https://dashscope.aliyun.com/" target="_blank">阿里云 DashScope</a></li>
        </ul>
        
        <h4>安全提示：</h4>
        <ul>
          <li>API Key 将加密存储在系统中</li>
          <li>定期轮换API Key以提高安全性</li>
          <li>不要在公开场所分享API Key</li>
          <li>建议为AI服务设置使用额度限制</li>
        </ul>

        <h4>Base URL 说明：</h4>
        <p>如果您使用代理服务或私有部署，可以修改Base URL。大多数情况下使用默认值即可。</p>
      </div>
      <template #footer>
        <el-button @click="showHelp = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="AIConfig">
import { DocumentAdd, DocumentChecked } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

definePageMeta({
  layout: 'admin',
  title: 'AI服务配置',
  middleware: 'auth'
})

useHead({
  title: 'AI服务配置 - DMS 管理后台'
})

// 1. 静态AI供应商选项
const aiVendors = [
  {
    serviceKey: 'openai',
    serviceName: 'OpenAI',
    description: 'OpenAI GPT-4, GPT-3.5-turbo 等模型',
    defaultBaseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo']
  },
  {
    serviceKey: 'claude',
    serviceName: 'Anthropic Claude',
    description: 'Claude-3, Claude-2 等模型',
    defaultBaseUrl: 'https://api.anthropic.com',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku']
  },
  {
    serviceKey: 'gemini',
    serviceName: 'Google Gemini',
    description: 'Gemini Pro, Gemini Pro Vision 等模型',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1',
    models: ['gemini-pro', 'gemini-pro-vision']
  },
  {
    serviceKey: 'moonshot',
    serviceName: 'Moonshot (月之暗面)',
    description: 'Moonshot v1 系列模型',
    defaultBaseUrl: 'https://api.moonshot.cn/v1',
    models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k']
  },
  {
    serviceKey: 'qwen',
    serviceName: '通义千问 (Qwen)',
    description: '阿里云通义千问系列模型',
    defaultBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: ['qwen-turbo', 'qwen-plus', 'qwen-max']
  },
  {
    serviceKey: 'zhipu',
    serviceName: '智谱AI (GLM)',
    description: 'ChatGLM 系列模型',
    defaultBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    models: ['glm-4', 'glm-3-turbo']
  },
  {
    serviceKey: 'deepseek',
    serviceName: 'DeepSeek',
    description: 'DeepSeek 系列模型',
    defaultBaseUrl: 'https://api.deepseek.com',
    models: ['deepseek-chat', 'deepseek-reasoner']
  }
]

// 响应式数据
const configList = ref([])
const loading = ref(true)
const showHelp = ref(false)
const config = ref(null)
const selectedServiceKey = ref('')

// 获取AI服务配置列表
async function getConfigList() {
  loading.value = true
  try {
    const response = await $fetch('/api/admin/ai/config/list')
    if (response.code === 200) {
      configList.value = response.data.configs.map(config => ({
        ...config,
        showApiKey: false,
        testing: false
      }))
      // 默认选中已启用的服务商（如有多个只选第一个）
      const enabled = configList.value.find(c => c.enabled)
      selectedServiceKey.value = enabled ? enabled.serviceKey : configList.value[0]?.serviceKey || ''
    } else {
      ElMessage.error(response.message || '获取配置失败')
    }
  } catch (error) {
    console.error('获取AI服务配置失败:', error)
    ElMessage.error('获取AI服务配置失败')
  } finally {
    loading.value = false
  }
}

// 获取AI服务配置
async function getConfig() {
  loading.value = true
  try {
    const response = await $fetch('/api/admin/ai/config/list')
    if (response.code === 200) {
      config.value = response.data.config || {
        serviceKey: '',
        apiKey: '',
        baseUrl: '',
        models: [],
        serviceName: '',
        description: ''
      }
      selectedServiceKey.value = config.value.serviceKey
    } else {
      ElMessage.error(response.message || '获取配置失败')
    }
  } catch (error) {
    console.error('获取AI服务配置失败:', error)
    ElMessage.error('获取AI服务配置失败')
  } finally {
    loading.value = false
  }
}

// 保存配置
async function handleSaveConfig() {
  try {
    const response = await $fetch('/api/admin/ai/config/save', {
      method: 'POST',
      body: config.value
    })
    if (response.code === 200) {
      ElMessage.success('AI服务配置保存成功')
    } else {
      ElMessage.error(response.message || '保存配置失败')
    }
  } catch (error) {
    console.error('保存配置失败:', error)
    ElMessage.error('保存配置失败')
  }
}

// 重置Base URL
function resetBaseUrl(config) {
  config.baseUrl = config.defaultBaseUrl
  handleSaveConfig()
}

// 清除API Key
function clearApiKey(config) {
  ElMessageBox.confirm(
    '确定要清除此AI服务的API Key吗？清除后相关功能将无法使用。',
    '确认清除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    config.value.apiKey = ''
    config.value.enabled = false
    await handleSaveConfig()
    ElMessage.success('API Key已清除')
  })
}

// 测试连接
async function testConnection() {
  config.value.testing = true
  try {
    const response = await $fetch('/api/admin/ai/config/test', { method: 'POST',body: {
    serviceKey: config.value.serviceKey,
    apiKey: config.value.apiKey,
    baseUrl: config.value.baseUrl
  } })
    if (response.code === 200) {
      // 如果后端返回模型列表，自动填充
      if (response.data && Array.isArray(response.data.data)) {
        config.value.models = response.data.data.map(item => item.id)
        if (config.value.models.length > 0) {
          config.value.model = config.value.models[0]
        }
      }
      ElMessage.success(response.message ||'连接测试成功')
    } else {
      ElMessage.error(response.message || '连接测试失败')
    }
  } catch (error) {
    ElMessage.error('连接测试失败')
  } finally {
    config.value.testing = false
  }
}

// 刷新配置
function refreshConfigs() {
  getConfig()
}

function onServiceChange(val) {
  const vendor = aiVendors.find(v => v.serviceKey === val)
  if (vendor) {
    config.value.serviceKey = vendor.serviceKey
    config.value.serviceName = vendor.serviceName
    config.value.description = vendor.description
    config.value.baseUrl = vendor.defaultBaseUrl
    config.value.models = []
    config.value.model = ''
  }
}

// 初始化
onMounted(() => {
  getConfig()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.single-config-card {
  max-width: 500px;
  margin: 0 auto 30px auto;
}

.service-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.service-info {
  display: flex;
  align-items: center;
}

.service-info h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.service-content {
  padding-top: 10px;
}

.service-description {
  color: #606266;
  font-size: 14px;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.config-item {
  margin-bottom: 16px;
}

.config-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 8px;
}

.api-key-input {
  width: 100%;
}

.card-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.global-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  padding: 20px 0;
}

.help-content {
  line-height: 1.6;
}

.help-content h4 {
  color: #303133;
  margin: 20px 0 10px 0;
}

.help-content ul {
  margin: 10px 0;
  padding-left: 20px;
}

.help-content li {
  margin: 8px 0;
}

.help-content a {
  color: #409eff;
  text-decoration: none;
}

.help-content a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .single-config-card {
    max-width: 100%;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style> 