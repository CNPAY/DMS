  <template>
    <div class="whois-page">
      <!-- 标题和搜索 -->
      <div class="header-section">
        <h1>WHOIS 域名查询</h1>
        <div class="search-form">
          <el-input 
            v-model="queryDomain" 
            placeholder="请输入域名，如：google.com"
            clearable 
            size="large"
            :loading="loading"
            @keyup.enter="handleQuery"
          >
            <template #append>
              <el-button 
                type="primary" 
                :loading="loading" 
                @click="handleQuery"
                :disabled="!queryDomain?.trim()"
              >
                查询
              </el-button>
            </template>
          </el-input>
        </div>
      </div>

      <!-- 查询结果 -->
      <div v-if="whoisData || error" class="result-container">
        <!-- 错误信息 -->
        <div v-if="error" class="error-box">
          <el-alert :title="error" type="error" :closable="false" />
        </div>

        <!-- WHOIS信息 -->
        <div v-if="whoisData" class="whois-info">
          <!-- 域名状态 -->
          <div class="status-card">
            <div class="status-header">
              <span class="domain-name">{{ whoisData.domain }}</span>
              <el-tag :type="whoisData.apiData.data.status === 0 ? 'success' : 'primary'" size="large">
                {{ whoisData.apiData.data.status === 0 ? '可注册' : '已注册' }}
              </el-tag>
            </div>

            <!-- 域名特征 -->
            <div v-if="whoisData.apiData.data.tags?.length" class="tags-section">
              <span class="section-label">域名特征</span>
              <div class="tags-list">
                <el-tag v-for="(tag, index) in whoisData.apiData.data.tags" :key="index"
                  :type="getTagType(tag.color)" size="small">
                  {{ tag.desc }}
                </el-tag>
              </div>
            </div>

            <!-- 保护状态 -->
            <div v-if="whoisData.apiData.data.statusTags?.length" class="tags-section">
              <span class="section-label">保护状态</span>
              <div class="tags-list">
                <el-tag v-for="(statusTag, index) in whoisData.apiData.data.statusTags" :key="index"
                  :type="getTagType(statusTag.color)" size="small" effect="dark">
                  {{ statusTag.desc }}
                </el-tag>
              </div>
            </div>
        </div>

          <!-- 注册信息（仅已注册域名） -->
          <div v-if="whoisData.apiData.data.status === 1" class="registration-details">
            <!-- 域名信息 -->
            <div v-if="whoisData.apiData.data.formatted.domain" class="info-section">
              <h3>域名信息</h3>
              <div class="info-list">
                <div v-if="whoisData.apiData.data.formatted.domain.created_date" class="info-item">
                  <span class="label">注册日期</span>
                  <span class="value">{{ formatDate(whoisData.apiData.data.formatted.domain.created_date) }}</span>
                </div>
                <div v-if="whoisData.apiData.data.formatted.domain.expired_date" class="info-item">
                  <span class="label">到期日期</span>
                  <span class="value" :class="getExpiryClass(whoisData.apiData.data.formatted.domain.expired_date)">
                    {{ formatDate(whoisData.apiData.data.formatted.domain.expired_date) }}
                  </span>
                </div>
                <div v-if="whoisData.apiData.data.formatted.domain.updated_date" class="info-item">
                  <span class="label">更新日期</span>
                  <span class="value">{{ formatDate(whoisData.apiData.data.formatted.domain.updated_date) }}</span>
                </div>
                <div v-if="whoisData.apiData.data.formatted.domain.dnssec !== undefined" class="info-item">
                  <span class="label">DNSSEC</span>
                  <el-tag :type="whoisData.apiData.data.formatted.domain.dnssec ? 'success' : 'info'" size="small">
                    {{ whoisData.apiData.data.formatted.domain.dnssec ? '已启用' : '未启用' }}
                  </el-tag>
                </div>
                <div v-if="whoisData.apiData.data.formatted.domain.whois_server" class="info-item">
                  <span class="label">WHOIS</span>
                  <span class="value code">{{ whoisData.apiData.data.formatted.domain.whois_server }}</span>
                </div>
              </div>
            </div>

            <!-- 注册商信息 -->
            <div v-if="whoisData.apiData.data.formatted.registrar" class="info-section">
              <h3>注册商信息</h3>
              <div class="info-list">
                <div class="info-item">
                  <span class="label">注册商</span>
                  <span class="value">{{ whoisData.apiData.data.formatted.registrar.registrar_name || '未知' }}</span>
                </div>
                <div v-if="whoisData.apiData.data.formatted.registrar.referral_url" class="info-item">
                  <span class="label">网址</span>
                  <a :href="whoisData.apiData.data.formatted.registrar.referral_url" target="_blank" class="link">
                    {{ whoisData.apiData.data.formatted.registrar.referral_url }}
                  </a>
                </div>
                <div v-if="whoisData.apiData.data.formatted.registrar.registrar_ianaid" class="info-item">
                  <span class="label">IANA ID</span>
                  <span class="value">{{ whoisData.apiData.data.formatted.registrar.registrar_ianaid }}</span>
                </div>
                <div v-if="whoisData.apiData.data.formatted.registrar.registrar_email" class="info-item">
                  <span class="label">邮箱</span>
                  <span class="value">{{ whoisData.apiData.data.formatted.registrar.registrar_email }}</span>
                </div>
                <div v-if="whoisData.apiData.data.formatted.registrar.registrar_phone" class="info-item">
                  <span class="label">电话</span>
                  <span class="value">{{ whoisData.apiData.data.formatted.registrar.registrar_phone }}</span>
                </div>
              </div>
            </div>

            <!-- DNS 服务器 -->
            <div v-if="whoisData.apiData.data.formatted.domain?.name_servers?.length" class="info-section">
              <h3>DNS 服务器 ({{ whoisData.apiData.data.formatted.domain.name_servers.length }}个)</h3>
              <div class="dns-list">
                <div v-for="(ns, index) in whoisData.apiData.data.formatted.domain.name_servers" :key="ns" class="dns-item">
                  <span class="dns-index">{{ index + 1 }}</span>
                  <span class="dns-name">{{ ns.toUpperCase() }}</span>
                </div>
              </div>
            </div>

            <!-- 注册人信息 -->
            <div v-if="whoisData.apiData.data.formatted.registrant" class="info-section">
              <h3>注册人信息</h3>
              <div class="privacy-info">
                <el-icon><Lock /></el-icon>
                <span>详细信息已受隐私保护（GDPR等隐私法规）</span>
              </div>
            </div>

            <!-- 原始WHOIS数据 -->
            <div class="info-section">
              <el-collapse>
                <el-collapse-item name="raw">
                  <template #title>
                    <span>原始WHOIS数据</span>
                  </template>
                  <div class="raw-data" v-html="formatRawWhoisData(whoisData.apiData.data.result)"></div>
                </el-collapse-item>
              </el-collapse>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Monitor,
  Document,
  Plus,
  CopyDocument,
  InfoFilled,
  User,
  UserFilled,
  Tools,
  CreditCard,
  Star,
  Lock,
  OfficeBuilding,
  Calendar,
  Connection,
  DataLine,
  Check,
  Lightning,
  Lock as Shield
} from '@element-plus/icons-vue'

// 类型定义
interface WhoisTag {
  color: string
  desc: string
  group: string
}

interface WhoisStatusTag {
  color: string
  desc: string
}

// 响应式数据
const loading = ref(false)
const whoisData = ref<any>(null)
const error = ref('')
const queryDomain = ref('')

// 快速查询示例
const quickExamples = ['google.com', 'github.com', 'baidu.com', 'apple.com']

// 计算属性
const canAutoFill = computed(() => {
  return whoisData.value &&
    whoisData.value.apiData?.data?.status === 1 &&
    whoisData.value.apiData?.data?.formatted?.registrar
})

// WHOIS查询 - 直接调用天狐API
const handleQuery = async () => {
  try {
    // 简单验证
    if (!queryDomain.value || !queryDomain.value.trim()) {
      ElMessage.error('请输入域名')
      return
    }

    // 域名格式验证
    const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/
    if (!domainPattern.test(queryDomain.value.trim())) {
      ElMessage.error('域名格式不正确')
      return
    }

    loading.value = true
    error.value = ''
    whoisData.value = null

    const domain = queryDomain.value.trim().toLowerCase()

    // 直接调用天狐API
    const apiUrl = `https://api.tian.hu/whois.php?action=searchWhois&domain=${encodeURIComponent(domain)}`

    const response = await $fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'DMS-WhoisClient/1.0',
      },
      timeout: 30000,
    })

    // 保存完整的API响应数据
    whoisData.value = {
      domain: domain,
      queryTime: new Date().toISOString(),
      apiData: response as any,
    }

    ElMessage.success('查询成功')
  } catch (err: any) {
    console.error('WHOIS查询失败:', err)

    // 处理网络错误
    if (err.name === 'FetchError') {
      error.value = 'WHOIS服务暂时不可用，请稍后重试'
    } else if (err.code === 'TIMEOUT') {
      error.value = 'WHOIS查询超时，请稍后重试'
    } else {
      error.value = err.message || 'WHOIS查询失败'
    }
  } finally {
    loading.value = false
  }
}

// 自动填充到域名管理
const handleAutoFill = async () => {
  if (!whoisData.value || whoisData.value.apiData?.data?.status !== 1) {
    return
  }

  try {
    const data = whoisData.value.apiData.data
    const domain = data.formatted.domain
    const registrar = data.formatted.registrar

    // 构造域名数据
    const domainData = {
      domainName: whoisData.value.domain,
      creationDate: domain?.created_date ? new Date(domain.created_date).toISOString().split('T')[0] : null,
      expiryDate: domain?.expired_date ? new Date(domain.expired_date).toISOString().split('T')[0] : null,
      nameServers: domain?.name_servers?.join('\n') || '',
      notes: `WHOIS查询导入 - ${formatDateTime(whoisData.value.queryTime)}`,
    }

    // 添加注册商信息到备注
    if (registrar?.registrar_name) {
      domainData.notes += `\n注册商: ${registrar.registrar_name}`
    }

    // 添加域名特征标签到备注
    if (data.tags?.length) {
      const tagDescs = data.tags.map((tag: any) => tag.desc).join(', ')
      domainData.notes += `\n域名特征: ${tagDescs}`
    }

    await ElMessageBox.confirm(
      '是否将查询到的域名信息自动填充到域名管理模块？',
      '确认操作',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'info',
      }
    )

    // 跳转到域名新增页面，并传递数据
    await navigateTo({
      path: '/admin/domains',
      query: {
        action: 'add',
        data: JSON.stringify(domainData),
      },
    })

    ElMessage.success('已跳转到域名管理页面')
  } catch (err: any) {
    if (err !== 'cancel') {
      console.error('自动填充失败:', err)
      ElMessage.error('自动填充失败')
    }
  }
}

// 复制查询结果
const handleCopyData = async () => {
  if (!whoisData.value) return

  try {
    const data = whoisData.value.apiData.data
    const isAvailable = data.status === 0

    const textParts = [
      `域名: ${whoisData.value.domain}`,
      `状态: ${isAvailable ? '可注册' : '已注册'}`,
    ]

    if (!isAvailable && data.formatted) {
      const domain = data.formatted.domain
      const registrar = data.formatted.registrar

      if (registrar?.registrar_name) {
        textParts.push(`注册商: ${registrar.registrar_name}`)
      }
      if (domain?.created_date) {
        textParts.push(`注册日期: ${formatDate(domain.created_date)}`)
      }
      if (domain?.expired_date) {
        textParts.push(`到期日期: ${formatDate(domain.expired_date)}`)
      }
      if (domain?.name_servers?.length) {
        textParts.push(`DNS服务器: ${domain.name_servers.join(', ')}`)
      }
      if (data.tags?.length) {
        const tagDescs = data.tags.map((tag: any) => tag.desc).join(', ')
        textParts.push(`域名特征: ${tagDescs}`)
      }
    }

    textParts.push(`查询时间: ${formatDateTime(whoisData.value.queryTime)}`)

    const text = textParts.join('\n')
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
    ElMessage.error('复制失败')
  }
}

// 工具函数
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  try {
    return new Date(dateString).toLocaleDateString('zh-CN')
  } catch {
    return dateString
  }
}

const formatDateTime = (dateString: string) => {
  if (!dateString) return '-'
  try {
    return new Date(dateString).toLocaleString('zh-CN')
  } catch {
    return dateString
  }
}

const getExpiryClass = (expiryDate: string) => {
  if (!expiryDate) return ''

  const now = new Date()
  const expiry = new Date(expiryDate)
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'text-red-600 font-semibold' // 已过期
  if (diffDays <= 30) return 'text-orange-600 font-semibold' // 30天内到期
  if (diffDays <= 90) return 'text-yellow-600' // 90天内到期
  return ''
}

// 根据颜色获取标签类型
const getTagType = (color: string) => {
  const colorMap: Record<string, string> = {
    'green': 'success',
    'red': 'danger',
    'blue': 'primary',
    'orange': 'warning',
    'black': 'info',
    'gray': 'info',
    'grey': 'info',
  }
  return colorMap[color.toLowerCase()] || 'info'
}

// 格式化原始WHOIS数据，转换HTML标签
const formatRawWhoisData = (rawData: string) => {
  if (!rawData) return ''

  // 简单的HTML清理和格式化
  return rawData
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\r\n/g, '\n')
    .replace(/\n/g, '<br>')
}

// 页面元数据
definePageMeta({
  title: 'WHOIS查询',
  layout: 'admin',
})
</script>

<style scoped>
.whois-page {
  min-height: 100vh;
  background: #f5f6fa;
  padding: 20px;
}

.header-section {
  max-width: 800px;
  padding: 20px;
  border-radius: 8px;
  margin: 0 auto;
  text-align: center;
  background-color: white;
  margin-bottom: 20px;
}

.header-section h1 {
  font-size: 28px;
  color: #2c3e50;
  margin-bottom: 20px;
}

.search-form {
  max-width: 500px;
  margin: 0 auto;
}

.result-container {
  max-width: 800px;
  margin: 0 auto;
}

.error-box {
  margin-bottom: 20px;
}

.whois-info {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.status-card {
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.domain-name {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  font-family: monospace;
}

.tags-section {
  margin-top: 16px;
}

.section-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.registration-details {
  background: #f8f9fa;
}

.info-section {
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
}

.info-section:last-child {
  border-bottom: none;
}

.info-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #495057;
  margin: 0 0 12px 0;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-size: 14px;
  font-weight: 500;
  color: #6c757d;
  min-width: 100px;
  margin-right: 16px;
}

.value {
  font-size: 14px;
  color: #495057;
  flex: 1;
}

.value.code {
  font-family: monospace;
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
}

.link {
  color: #007bff;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.dns-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 8px;
}

.dns-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
}

.dns-index {
  font-size: 12px;
  font-weight: 600;
  color: #6c757d;
  margin-right: 12px;
  min-width: 20px;
}

.dns-name {
  font-family: monospace;
  font-size: 13px;
  color: #495057;
  font-weight: 500;
}

.privacy-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  color: #856404;
  font-size: 14px;
}

.raw-data {
  background: #f8f9fa;
  color: #495057;
  padding: 16px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.5;
  overflow: auto;
  max-height: 300px;
  border: 1px solid #e9ecef;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .whois-page {
    padding: 12px;
  }
  
  .header-section h1 {
    font-size: 24px;
  }
  
  .status-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .domain-name {
    font-size: 20px;
  }
  
  .info-section {
    padding: 16px;
  }
  
  .dns-list {
    grid-template-columns: 1fr;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .label {
    min-width: auto;
    margin-right: 0;
  }
}


</style>