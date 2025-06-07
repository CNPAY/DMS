<template>
  <div class="backup-management">
    <div class="page-header">
      <h1>系统备份管理</h1>
      <p>管理数据库备份、文件备份和自动备份计划</p>
    </div>

    <!-- 备份概览 -->
    <div class="backup-overview">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="overview-card">
            <div class="stat-item">
              <div class="stat-icon database">
                <i class="el-icon-database"></i>
              </div>
              <div class="stat-content">
                <div class="stat-title">数据库备份</div>
                <div class="stat-value">{{ dbBackups.length }}</div>
                <div class="stat-desc">最近备份: {{ lastDbBackup || '暂无' }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="overview-card">
            <div class="stat-item">
              <div class="stat-icon files">
                <i class="el-icon-folder"></i>
              </div>
              <div class="stat-content">
                <div class="stat-title">文件备份</div>
                <div class="stat-value">{{ fileBackups.length }}</div>
                <div class="stat-desc">最近备份: {{ lastFileBackup || '暂无' }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="overview-card">
            <div class="stat-item">
              <div class="stat-icon storage">
                <i class="el-icon-pie-chart"></i>
              </div>
              <div class="stat-content">
                <div class="stat-title">存储空间</div>
                <div class="stat-value">{{ formatSize(totalBackupSize) }}</div>
                <div class="stat-desc">剩余空间: {{ formatSize(freeSpace) }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 操作区域 -->
    <div class="backup-actions">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>备份操作</span>
          </div>
        </template>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="action-section">
              <h3>数据库备份</h3>
              <p>备份所有数据库表和数据</p>
              <el-button 
                type="primary" 
                icon="Download"
                :loading="dbBackupLoading"
                @click="createDbBackup"
              >
                创建数据库备份
              </el-button>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="action-section">
              <h3>文件备份</h3>
              <p>备份上传文件和系统配置</p>
              <el-button 
                type="success" 
                icon="FolderAdd"
                :loading="fileBackupLoading"
                @click="createFileBackup"
              >
                创建文件备份
              </el-button>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 自动备份设置 -->
    <div class="auto-backup-settings">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>自动备份设置</span>
          </div>
        </template>
        
        <el-form ref="settingsRef" :model="settings" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="启用自动备份">
                <el-switch v-model="settings.autoBackupEnabled" />
              </el-form-item>
              <el-form-item label="备份频率" v-if="settings.autoBackupEnabled">
                <el-select v-model="settings.backupFrequency" style="width: 100%">
                  <el-option label="每天" value="daily" />
                  <el-option label="每周" value="weekly" />
                  <el-option label="每月" value="monthly" />
                </el-select>
              </el-form-item>
              <el-form-item label="备份时间" v-if="settings.autoBackupEnabled">
                <el-time-picker 
                  v-model="settings.backupTime" 
                  format="HH:mm"
                  value-format="HH:mm"
                  placeholder="选择备份时间"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="保留份数">
                <el-input-number 
                  v-model="settings.keepBackups" 
                  :min="1" 
                  :max="100"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="备份类型">
                <el-checkbox-group v-model="settings.backupTypes">
                  <el-checkbox label="database">数据库</el-checkbox>
                  <el-checkbox label="files">文件</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveSettings">保存设置</el-button>
                <el-button @click="resetSettings">重置</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
    </div>

    <!-- 备份列表 -->
    <div class="backup-list">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>备份历史</span>
            <el-button type="text" icon="Refresh" @click="loadBackups">刷新</el-button>
          </div>
        </template>

        <el-table :data="allBackups" v-loading="loading">
          <el-table-column prop="name" label="备份名称" min-width="200">
            <template #default="{ row }">
              <div class="backup-name">
                <i :class="getBackupIcon(row.type)"></i>
                <span>{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="120">
            <template #default="{ row }">
              <el-tag :type="row.type === 'database' ? 'primary' : 'success'" size="small">
                {{ row.type === 'database' ? '数据库' : '文件' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="size" label="大小" width="120">
            <template #default="{ row }">
              {{ formatSize(row.size) }}
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag 
                :type="row.status === 'completed' ? 'success' : 
                       row.status === 'running' ? 'warning' : 'danger'"
                size="small"
              >
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button 
                link 
                type="primary" 
                icon="Download"
                :disabled="row.status !== 'completed'"
                @click="downloadBackup(row)"
              >
                下载
              </el-button>
              <el-button 
                link 
                type="warning" 
                icon="RefreshRight"
                :disabled="row.status !== 'completed' || row.type !== 'database'"
                @click="restoreBackup(row)"
              >
                恢复
              </el-button>
              <el-button 
                link 
                type="danger" 
                icon="Delete"
                @click="deleteBackup(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

definePageMeta({
  layout: 'admin',
  title: 'routes.systemBackup',
  icon: 'folder'
})

// 响应式数据
const loading = ref(false)
const dbBackupLoading = ref(false)
const fileBackupLoading = ref(false)
const dbBackups = ref([])
const fileBackups = ref([])
const totalBackupSize = ref(0)
const freeSpace = ref(0)

// 自动备份设置
const settingsRef = ref()
const settings = ref({
  autoBackupEnabled: false,
  backupFrequency: 'daily',
  backupTime: '02:00',
  keepBackups: 10,
  backupTypes: ['database']
})

// 计算属性
const allBackups = computed(() => {
  return [...dbBackups.value, ...fileBackups.value].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
})

const lastDbBackup = computed(() => {
  const latest = dbBackups.value[0]
  return latest ? formatDate(latest.createdAt) : null
})

const lastFileBackup = computed(() => {
  const latest = fileBackups.value[0]
  return latest ? formatDate(latest.createdAt) : null
})

// 方法
const loadBackups = async () => {
  loading.value = true
  try {
    const [dbResponse, fileResponse, statsResponse] = await Promise.all([
      $fetch('/api/admin/system/backup/database'),
      $fetch('/api/admin/system/backup/files'), 
      $fetch('/api/admin/system/backup/stats')
    ])
    
    dbBackups.value = dbResponse.backups || []
    fileBackups.value = fileResponse.backups || []
    totalBackupSize.value = statsResponse.totalSize || 0
    freeSpace.value = statsResponse.freeSpace || 0
  } catch (error) {
    ElMessage.error('加载备份列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const loadSettings = async () => {
  try {
    const response = await $fetch('/api/admin/system/backup/settings')
    if (response.settings) {
      settings.value = { ...settings.value, ...response.settings }
    }
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

const createDbBackup = async () => {
  dbBackupLoading.value = true
  try {
    await $fetch('/api/admin/system/backup/database', { method: 'POST' })
    ElMessage.success('数据库备份已开始创建')
    loadBackups()
  } catch (error) {
    ElMessage.error('创建数据库备份失败')
    console.error(error)
  } finally {
    dbBackupLoading.value = false
  }
}

const createFileBackup = async () => {
  fileBackupLoading.value = true
  try {
    await $fetch('/api/admin/system/backup/files', { method: 'POST' })
    ElMessage.success('文件备份已开始创建')
    loadBackups()
  } catch (error) {
    ElMessage.error('创建文件备份失败')
    console.error(error)
  } finally {
    fileBackupLoading.value = false
  }
}

const downloadBackup = (backup) => {
  window.open(`/api/admin/system/backup/download/${backup.id}`, '_blank')
}

const restoreBackup = async (backup) => {
  try {
    await ElMessageBox.confirm(
      '恢复备份将覆盖当前数据，此操作不可撤销。确定要继续吗？',
      '确认恢复',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await $fetch(`/api/admin/system/backup/restore/${backup.id}`, { method: 'POST' })
    ElMessage.success('备份恢复成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('恢复备份失败')
      console.error(error)
    }
  }
}

const deleteBackup = async (backup) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除备份 "${backup.name}" 吗？此操作不可撤销。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await $fetch(`/api/admin/system/backup/${backup.id}`, { method: 'DELETE' })
    ElMessage.success('备份删除成功')
    loadBackups()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除备份失败')
      console.error(error)
    }
  }
}

const saveSettings = async () => {
  try {
    await $fetch('/api/admin/system/backup/settings', {
      method: 'POST',
      body: settings.value
    })
    ElMessage.success('设置保存成功')
  } catch (error) {
    ElMessage.error('保存设置失败')
    console.error(error)
  }
}

const resetSettings = () => {
  settings.value = {
    autoBackupEnabled: false,
    backupFrequency: 'daily',
    backupTime: '02:00',
    keepBackups: 10,
    backupTypes: ['database']
  }
}

// 工具函数
const formatSize = (bytes) => {
  if (!bytes) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const getBackupIcon = (type) => {
  return type === 'database' ? 'el-icon-database' : 'el-icon-folder'
}

const getStatusText = (status) => {
  const statusMap = {
    completed: '完成',
    running: '进行中',
    failed: '失败'
  }
  return statusMap[status] || status
}

// 生命周期
onMounted(() => {
  loadBackups()
  loadSettings()
})
</script>

<style scoped>
.backup-management {
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

.backup-overview,
.backup-actions,
.auto-backup-settings,
.backup-list {
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

.stat-icon.database {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.files {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.storage {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
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

.action-section {
  text-align: center;
  padding: 20px;
  border: 1px dashed #DCDFE6;
  border-radius: 6px;
}

.action-section h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
}

.action-section p {
  margin: 0 0 16px 0;
  color: #606266;
  font-size: 14px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.backup-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.backup-name i {
  font-size: 16px;
  color: #409EFF;
}

:deep(.el-card__header) {
  padding: 18px 20px;
  border-bottom: 1px solid #EBEEF5;
}

:deep(.el-card__body) {
  padding: 20px;
}
</style> 