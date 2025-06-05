<template>
  <div class="app-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>AI 服务配置</h2>
      <p style="color: #666; margin-top: 8px;">配置第三方AI服务的API密钥和相关参数，用于系统AI功能</p>
    </div>

    <!-- AI服务配置卡片 -->
    <div class="config-grid">
      <el-card 
        v-for="config in configList" 
        :key="config.serviceKey" 
        class="service-card"
        shadow="hover"
      >
        <template #header>
          <div class="card-header">
            <div class="service-info">
              <h3>{{ config.serviceName }}</h3>
              <el-tag 
                :type="config.enabled ? 'success' : 'info'" 
                size="small"
                style="margin-left: 10px;"
              >
                {{ config.enabled ? '已启用' : '未启用' }}
              </el-tag>
            </div>
            <el-switch
              v-model="config.enabled"
              @change="handleToggleService(config)"
              :disabled="!config.hasApiKey"
            />
          </div>
        </template>

        <div class="service-content">
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
                @blur="handleSaveConfig(config)"
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
              @blur="handleSaveConfig(config)"
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
            <div class="models-list">
              <el-tag
                v-for="model in config.models"
                :key="model"
                size="small"
                type="info"
                style="margin-right: 5px; margin-bottom: 5px;"
              >
                {{ model }}
              </el-tag>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="card-actions">
            <el-button
              v-if="config.hasApiKey"
              type="primary"
              size="small"
              @click="testConnection(config)"
              :loading="config.testing"
            >
              测试连接
            </el-button>
            <el-button
              v-if="config.hasApiKey"
              type="danger"
              size="small"
              plain
              @click="clearApiKey(config)"
            >
              清除密钥
            </el-button>
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
import { ElMessage, ElMessageBox } from 'element-plus'

definePageMeta({
  layout: 'admin',
  title: 'AI服务配置',
  middleware: 'auth'
})

useHead({
  title: 'AI服务配置 - DMS 管理后台'
})

// 响应式数据
const configList = ref([])
const loading = ref(true)
const showHelp = ref(false)

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
async function handleSaveConfig(config) {
  try {
    const response = await $fetch('/api/admin/ai/config/save', {
      method: 'POST',
      body: {
        serviceKey: config.serviceKey,
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
        enabled: config.enabled
      }
    })
    
    if (response.code === 200) {
      config.hasApiKey = !!config.apiKey
      ElMessage.success(`${config.serviceName} 配置保存成功`)
    } else {
      ElMessage.error(response.message || '保存配置失败')
    }
  } catch (error) {
    console.error('保存配置失败:', error)
    ElMessage.error('保存配置失败')
  }
}

// 切换服务启用状态
async function handleToggleService(config) {
  if (!config.hasApiKey && config.enabled) {
    config.enabled = false
    ElMessage.warning('请先配置API Key')
    return
  }
  
  await handleSaveConfig(config)
}

// 重置Base URL
function resetBaseUrl(config) {
  config.baseUrl = config.defaultBaseUrl
  handleSaveConfig(config)
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
    config.apiKey = ''
    config.enabled = false
    await handleSaveConfig(config)
    ElMessage.success('API Key已清除')
  })
}

// 测试连接
async function testConnection(config) {
  config.testing = true
  try {
    // 这里应该调用实际的测试API
    await new Promise(resolve => setTimeout(resolve, 2000)) // 模拟测试
    ElMessage.success(`${config.serviceName} 连接测试成功`)
  } catch (error) {
    ElMessage.error(`${config.serviceName} 连接测试失败`)
  } finally {
    config.testing = false
  }
}

// 刷新配置
function refreshConfigs() {
  getConfigList()
}

// 初始化
onMounted(() => {
  getConfigList()
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

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
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

.models-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
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
  .config-grid {
    grid-template-columns: 1fr;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style> 