<template>
    <div class="notification-management">
      <div class="page-header">
        <h1>系统通知管理</h1>
        <p>管理系统通知、消息推送和邮件通知</p>
      </div>
  
      <!-- 操作栏 -->
      <div class="action-bar">
        <el-button type="primary" icon="Plus" @click="showCreateDialog">
          发送通知
        </el-button>
        <el-button type="success" icon="Document" @click="showTemplateManager">
          通知模板
        </el-button>
        <el-button type="info" icon="Setting" @click="showNotificationSettings">
          通知设置
        </el-button>
      </div>
  
      <!-- 统计概览 -->
      <div class="notification-overview">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="overview-card">
              <div class="stat-item">
                <div class="stat-icon total">
                  <i class="el-icon-bell"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-title">总通知数</div>
                  <div class="stat-value">{{ totalNotifications }}</div>
                  <div class="stat-desc">历史发送总数</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="overview-card">
              <div class="stat-item">
                <div class="stat-icon pending">
                  <i class="el-icon-clock"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-title">待发送</div>
                  <div class="stat-value">{{ pendingNotifications }}</div>
                  <div class="stat-desc">排队等待发送</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="overview-card">
              <div class="stat-item">
                <div class="stat-icon success">
                  <i class="el-icon-circle-check"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-title">发送成功</div>
                  <div class="stat-value">{{ successNotifications }}</div>
                  <div class="stat-desc">今日成功发送</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="overview-card">
              <div class="stat-item">
                <div class="stat-icon failed">
                  <i class="el-icon-circle-close"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-title">发送失败</div>
                  <div class="stat-value">{{ failedNotifications }}</div>
                  <div class="stat-desc">今日发送失败</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
  
      <!-- 筛选和搜索 -->
      <div class="filter-section">
        <el-card>
          <el-row :gutter="20" align="middle">
            <el-col :span="6">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索通知标题或内容"
                prefix-icon="Search"
                clearable
              />
            </el-col>
            <el-col :span="4">
              <el-select v-model="filterType" placeholder="通知类型" clearable>
                <el-option label="全部类型" value="" />
                <el-option label="系统通知" value="system" />
                <el-option label="邮件通知" value="email" />
                <el-option label="短信通知" value="sms" />
                <el-option label="推送通知" value="push" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-select v-model="filterStatus" placeholder="发送状态" clearable>
                <el-option label="全部状态" value="" />
                <el-option label="待发送" value="pending" />
                <el-option label="发送中" value="sending" />
                <el-option label="发送成功" value="success" />
                <el-option label="发送失败" value="failed" />
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-col>
            <el-col :span="4">
              <el-button type="primary" icon="Search" @click="searchNotifications">
                搜索
              </el-button>
              <el-button icon="Refresh" @click="resetFilters">
                重置
              </el-button>
            </el-col>
          </el-row>
        </el-card>
      </div>
  
      <!-- 通知列表 -->
      <div class="notification-list">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>通知记录</span>
              <el-button type="text" icon="Refresh" @click="loadNotifications">刷新</el-button>
            </div>
          </template>
  
          <el-table :data="notifications" v-loading="loading" stripe>
            <el-table-column prop="title" label="通知标题" min-width="200">
              <template #default="{ row }">
                <div class="notification-title">
                  <i :class="getTypeIcon(row.type)"></i>
                  <span>{{ row.title }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="getTypeColor(row.type)" size="small">
                  {{ getTypeText(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="recipients" label="接收者" width="120">
              <template #default="{ row }">
                {{ row.recipients?.length || 0 }} 人
              </template>
            </el-table-column>
            <el-table-column prop="content" label="内容预览" min-width="200">
              <template #default="{ row }">
                <span class="content-preview">{{ truncateText(row.content, 50) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag 
                  :type="getStatusColor(row.status)" 
                  size="small"
                  :icon="getStatusIcon(row.status)"
                >
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="创建时间" width="160">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column prop="sentAt" label="发送时间" width="160">
              <template #default="{ row }">
                {{ row.sentAt ? formatDate(row.sentAt) : '-' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button 
                  link 
                  type="primary" 
                  icon="View"
                  @click="viewNotification(row)"
                >
                  查看
                </el-button>
                <el-button 
                  link 
                  type="warning" 
                  icon="RefreshRight"
                  v-if="row.status === 'failed'"
                  @click="resendNotification(row)"
                >
                  重发
                </el-button>
                <el-button 
                  link 
                  type="danger" 
                  icon="Delete"
                  @click="deleteNotification(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
  
          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </div>
  
      <!-- 发送通知对话框 -->
      <el-dialog
        v-model="createDialogVisible"
        title="发送通知"
        width="800px"
        :before-close="handleCreateDialogClose"
      >
        <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="100px">
          <el-form-item label="通知类型" prop="type">
            <el-radio-group v-model="createForm.type">
              <el-radio label="system">系统通知</el-radio>
              <el-radio label="email">邮件通知</el-radio>
              <el-radio label="sms">短信通知</el-radio>
              <el-radio label="push">推送通知</el-radio>
            </el-radio-group>
          </el-form-item>
  
          <el-form-item label="通知标题" prop="title">
            <el-input v-model="createForm.title" placeholder="请输入通知标题" maxlength="100" show-word-limit />
          </el-form-item>
  
          <el-form-item label="接收者" prop="recipients">
            <el-select
              v-model="createForm.recipients"
              multiple
              filterable
              placeholder="选择接收者或输入邮箱"
              style="width: 100%"
            >
              <el-option label="所有用户" value="all" />
              <el-option label="管理员" value="admin" />
              <el-option label="普通用户" value="user" />
            </el-select>
          </el-form-item>
  
          <el-form-item label="通知内容" prop="content">
            <el-input
              v-model="createForm.content"
              type="textarea"
              :rows="6"
              placeholder="请输入通知内容"
              maxlength="1000"
              show-word-limit
            />
          </el-form-item>
  
          <el-form-item label="发送时间" prop="sendTime">
            <el-radio-group v-model="createForm.sendType">
              <el-radio label="immediate">立即发送</el-radio>
              <el-radio label="scheduled">定时发送</el-radio>
            </el-radio-group>
            <el-date-picker
              v-if="createForm.sendType === 'scheduled'"
              v-model="createForm.sendTime"
              type="datetime"
              placeholder="选择发送时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="margin-left: 20px;"
            />
          </el-form-item>
  
          <el-form-item label="优先级">
            <el-select v-model="createForm.priority" placeholder="选择优先级">
              <el-option label="低" value="low" />
              <el-option label="普通" value="normal" />
              <el-option label="高" value="high" />
              <el-option label="紧急" value="urgent" />
            </el-select>
          </el-form-item>
        </el-form>
  
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="createDialogVisible = false">取消</el-button>
            <el-button type="primary" :loading="createLoading" @click="createNotification">
              {{ createForm.sendType === 'immediate' ? '立即发送' : '定时发送' }}
            </el-button>
          </div>
        </template>
      </el-dialog>
  
      <!-- 通知详情对话框 -->
      <el-dialog
        v-model="viewDialogVisible"
        title="通知详情"
        width="600px"
      >
        <div v-if="currentNotification" class="notification-detail">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="通知标题">
              {{ currentNotification.title }}
            </el-descriptions-item>
            <el-descriptions-item label="通知类型">
              <el-tag :type="getTypeColor(currentNotification.type)" size="small">
                {{ getTypeText(currentNotification.type) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="发送状态">
              <el-tag :type="getStatusColor(currentNotification.status)" size="small">
                {{ getStatusText(currentNotification.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="接收者数量">
              {{ currentNotification.recipients?.length || 0 }} 人
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatDate(currentNotification.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="发送时间">
              {{ currentNotification.sentAt ? formatDate(currentNotification.sentAt) : '未发送' }}
            </el-descriptions-item>
          </el-descriptions>
  
          <div class="content-section">
            <h4>通知内容：</h4>
            <div class="content-text">{{ currentNotification.content }}</div>
          </div>
  
          <div v-if="currentNotification.recipients" class="recipients-section">
            <h4>接收者列表：</h4>
            <el-tag 
              v-for="recipient in currentNotification.recipients" 
              :key="recipient"
              size="small"
              style="margin-right: 8px; margin-bottom: 8px;"
            >
              {{ recipient }}
            </el-tag>
          </div>
        </div>
  
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="viewDialogVisible = false">关闭</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive, onMounted, computed } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  
  definePageMeta({
    layout: 'admin',
    title: 'routes.notificationConfig',
    icon: 'bell'
  })
  
  // 响应式数据
  const loading = ref(false)
  const createLoading = ref(false)
  const notifications = ref([])
  const createDialogVisible = ref(false)
  const viewDialogVisible = ref(false)
  const currentNotification = ref(null)
  const createFormRef = ref()
  
  // 筛选条件
  const searchKeyword = ref('')
  const filterType = ref('')
  const filterStatus = ref('')
  const dateRange = ref([])
  
  // 分页
  const currentPage = ref(1)
  const pageSize = ref(20)
  const total = ref(0)
  
  // 统计数据
  const totalNotifications = ref(1248)
  const pendingNotifications = ref(23)
  const successNotifications = ref(156)
  const failedNotifications = ref(8)
  
  // 创建表单
  const createForm = reactive({
    type: 'system',
    title: '',
    content: '',
    recipients: [],
    sendType: 'immediate',
    sendTime: '',
    priority: 'normal'
  })
  
  // 表单验证规则
  const createRules = {
    type: [
      { required: true, message: '请选择通知类型', trigger: 'change' }
    ],
    title: [
      { required: true, message: '请输入通知标题', trigger: 'blur' },
      { min: 2, max: 100, message: '标题长度为2-100个字符', trigger: 'blur' }
    ],
    content: [
      { required: true, message: '请输入通知内容', trigger: 'blur' },
      { min: 5, max: 1000, message: '内容长度为5-1000个字符', trigger: 'blur' }
    ],
    recipients: [
      { required: true, message: '请选择接收者', trigger: 'change' }
    ]
  }
  
  // 方法
  const loadNotifications = async () => {
    loading.value = true
    try {
      // 模拟数据
      const mockData = [
        {
          id: 1,
          title: '系统维护通知',
          content: '系统将于今晚22:00-24:00进行维护升级，期间服务可能会暂时中断，请用户提前做好相关准备。',
          type: 'system',
          status: 'success',
          recipients: ['admin@dms.com', 'user1@example.com'],
          createdAt: '2025-01-27T10:00:00Z',
          sentAt: '2025-01-27T10:01:00Z'
        },
        {
          id: 2,
          title: '新功能上线通知',
          content: '我们很高兴地宣布，新的域名管理功能已正式上线！',
          type: 'email',
          status: 'pending',
          recipients: ['all'],
          createdAt: '2025-01-27T09:30:00Z',
          sentAt: null
        },
        {
          id: 3,
          title: '安全提醒',
          content: '检测到您的账户在新设备登录，如非本人操作请及时修改密码。',
          type: 'sms',
          status: 'failed',
          recipients: ['admin'],
          createdAt: '2025-01-27T08:45:00Z',
          sentAt: '2025-01-27T08:46:00Z'
        }
      ]
      
      notifications.value = mockData
      total.value = mockData.length
    } catch (error) {
      ElMessage.error('加载通知列表失败')
      console.error(error)
    } finally {
      loading.value = false
    }
  }
  
  const createNotification = async () => {
    try {
      await createFormRef.value.validate()
      createLoading.value = true
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      ElMessage.success('通知发送成功')
      createDialogVisible.value = false
      resetCreateForm()
      loadNotifications()
    } catch (error) {
      if (error !== false) {
        ElMessage.error('发送通知失败')
        console.error(error)
      }
    } finally {
      createLoading.value = false
    }
  }
  
  const viewNotification = (notification: any) => {
    currentNotification.value = notification
    viewDialogVisible.value = true
  }
  
  const resendNotification = async (notification: any) => {
    try {
      await ElMessageBox.confirm(
        `确定要重新发送通知 "${notification.title}" 吗？`,
        '确认重发',
        { type: 'warning' }
      )
      
      ElMessage.success('通知重发成功')
      loadNotifications()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('重发通知失败')
      }
    }
  }
  
  const deleteNotification = async (notification: any) => {
    try {
      await ElMessageBox.confirm(
        `确定要删除通知 "${notification.title}" 吗？此操作不可撤销。`,
        '确认删除',
        { type: 'warning' }
      )
      
      ElMessage.success('通知删除成功')
      loadNotifications()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除通知失败')
      }
    }
  }
  
  const searchNotifications = () => {
    ElMessage.info('搜索功能开发中...')
    loadNotifications()
  }
  
  const resetFilters = () => {
    searchKeyword.value = ''
    filterType.value = ''
    filterStatus.value = ''
    dateRange.value = []
    loadNotifications()
  }
  
  const showCreateDialog = () => {
    createDialogVisible.value = true
  }
  
  const showTemplateManager = () => {
    ElMessage.info('通知模板管理功能开发中...')
  }
  
  const showNotificationSettings = () => {
    ElMessage.info('通知设置功能开发中...')
  }
  
  const handleCreateDialogClose = () => {
    resetCreateForm()
  }
  
  const resetCreateForm = () => {
    createFormRef.value?.resetFields()
    Object.assign(createForm, {
      type: 'system',
      title: '',
      content: '',
      recipients: [],
      sendType: 'immediate',
      sendTime: '',
      priority: 'normal'
    })
  }
  
  const handleSizeChange = (size: number) => {
    pageSize.value = size
    loadNotifications()
  }
  
  const handleCurrentChange = (page: number) => {
    currentPage.value = page
    loadNotifications()
  }
  
  // 工具函数
  const getTypeIcon = (type: string) => {
    const iconMap = {
      system: 'el-icon-bell',
      email: 'el-icon-message',
      sms: 'el-icon-chat-dot-round',
      push: 'el-icon-position'
    }
    return iconMap[type] || 'el-icon-bell'
  }
  
  const getTypeColor = (type: string) => {
    const colorMap = {
      system: 'primary',
      email: 'success',
      sms: 'warning',
      push: 'info'
    }
    return colorMap[type] || 'primary'
  }
  
  const getTypeText = (type: string) => {
    const textMap = {
      system: '系统',
      email: '邮件',
      sms: '短信',
      push: '推送'
    }
    return textMap[type] || type
  }
  
  const getStatusColor = (status: string) => {
    const colorMap = {
      pending: 'warning',
      sending: 'primary',
      success: 'success',
      failed: 'danger'
    }
    return colorMap[status] || 'info'
  }
  
  const getStatusIcon = (status: string) => {
    const iconMap = {
      pending: 'Clock',
      sending: 'Loading',
      success: 'Check',
      failed: 'Close'
    }
    return iconMap[status] || 'InfoFilled'
  }
  
  const getStatusText = (status: string) => {
    const textMap = {
      pending: '待发送',
      sending: '发送中',
      success: '成功',
      failed: '失败'
    }
    return textMap[status] || status
  }
  
  const truncateText = (text: string, length: number) => {
    if (!text) return ''
    return text.length > length ? text.substring(0, length) + '...' : text
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }
  
  // 生命周期
  onMounted(() => {
    loadNotifications()
  })
  </script>
  
  <style scoped>
  .notification-management {
    padding: 20px;
  }
  
  .page-header {
    margin-bottom: 20px;
  }
  
  .page-header h1 {
    margin: 0 0 8px 0;
    font-size: 24px;
    color: #303133;
  }
  
  .page-header p {
    margin: 0;
    color: #606266;
    font-size: 14px;
  }
  
  .action-bar {
    margin-bottom: 20px;
  }
  
  .notification-overview,
  .filter-section,
  .notification-list {
    margin-bottom: 20px;
  }
  
  .overview-card {
    height: 120px;
  }
  
  .stat-item {
    display: flex;
    align-items: center;
    height: 100%;
  }
  
  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    font-size: 24px;
    color: white;
  }
  
  .stat-icon.total {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  .stat-icon.pending {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }
  
  .stat-icon.success {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }
  
  .stat-icon.failed {
    background: linear-gradient(135deg, #fd746c 0%, #ff9068 100%);
  }
  
  .stat-content {
    flex: 1;
  }
  
  .stat-title {
    font-size: 14px;
    color: #909399;
    margin-bottom: 4px;
  }
  
  .stat-value {
    font-size: 28px;
    font-weight: bold;
    color: #303133;
    margin-bottom: 4px;
  }
  
  .stat-desc {
    font-size: 12px;
    color: #C0C4CC;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .notification-title {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .notification-title i {
    font-size: 16px;
    color: #409EFF;
  }
  
  .content-preview {
    color: #606266;
    line-height: 1.4;
  }
  
  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
  
  .notification-detail .content-section,
  .notification-detail .recipients-section {
    margin-top: 20px;
  }
  
  .notification-detail h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: #303133;
  }
  
  .notification-detail .content-text {
    padding: 12px;
    background: #f8f9fa;
    border-radius: 4px;
    border-left: 3px solid #409EFF;
    line-height: 1.6;
    color: #606266;
  }
  
  :deep(.el-card__header) {
    padding: 18px 20px;
    border-bottom: 1px solid #EBEEF5;
  }
  
  :deep(.el-card__body) {
    padding: 20px;
  }
  
  :deep(.el-descriptions__label) {
    font-weight: 500;
  }
  </style>