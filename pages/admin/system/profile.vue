<template>
  <div class="profile-management">
    <!-- <div class="page-header">
      <h1>个人资料</h1>
      <p>管理个人信息、修改密码和安全设置</p>
    </div> -->

    <el-row :gutter="20">
      <!-- 基本信息 -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>个人资料</span>
            </div>
          </template>

          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-width="120px"
            class="profile-form"
          >
            <!-- 基本信息 -->
            <el-divider content-position="left">基本信息</el-divider>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="用户名" prop="username">
                  <el-input v-model="form.username" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="form.email" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="真实姓名" prop="realName">
                  <el-input v-model="form.realName" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="昵称" prop="nickname">
                  <el-input v-model="form.nickname" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="手机号码" prop="phone">
                  <el-input v-model="form.phone" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="个人简介" prop="bio">
              <el-input v-model="form.bio" type="textarea" :rows="3" />
            </el-form-item>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="公司名称" prop="company">
                  <el-input v-model="form.company" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="职位" prop="position">
                  <el-input v-model="form.position" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="所在地" prop="location">
                  <el-input v-model="form.location" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="个人网站" prop="website">
                  <el-input v-model="form.website" />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 联系方式 -->
            <el-divider content-position="left">联系方式</el-divider>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="微信" prop="wechat">
                  <el-input v-model="form.wechat" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="QQ" prop="qq">
                  <el-input v-model="form.qq" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Telegram" prop="telegram">
                  <el-input v-model="form.telegram" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="WhatsApp" prop="whatsapp">
                  <el-input v-model="form.whatsapp" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Skype" prop="skype">
                  <el-input v-model="form.skype" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="X" prop="twitter">
                  <el-input v-model="form.twitter" placeholder="@username" />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 偏好设置 -->
            <el-divider content-position="left">偏好设置</el-divider>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="界面语言" prop="language">
                  <el-select v-model="form.language" style="width: 100%">
                    <el-option label="简体中文" value="zh-CN" />
                    <el-option label="English" value="en-US" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="界面主题" prop="theme">
                  <el-select v-model="form.theme" style="width: 100%">
                    <el-option label="浅色" value="light" />
                    <el-option label="深色" value="dark" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="时区" prop="timezone">
                  <el-select v-model="form.timezone" style="width: 100%">
                    <el-option label="北京时间 (UTC+8)" value="Asia/Shanghai" />
                    <el-option label="UTC" value="UTC" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="通知设置" prop="notification">
                  <el-switch v-model="form.notification" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form item>
              <el-button type="primary" @click="handleSubmit" :loading="loading">保存</el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form>
          </el-form>
        </el-card>

        <!-- 密码修改 -->
        <el-card style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <span>修改密码</span>
            </div>
          </template>

          <el-form ref="passwordRef" :model="passwordForm" :rules="passwordRules" label-width="100px">
            <el-form-item label="当前密码" prop="currentPassword">
              <el-input 
                v-model="passwordForm.currentPassword" 
                type="password" 
                placeholder="请输入当前密码"
                show-password
              />
            </el-form-item>

            <el-form-item label="新密码" prop="newPassword">
              <el-input 
                v-model="passwordForm.newPassword" 
                type="password" 
                placeholder="请输入新密码"
                show-password
              />
            </el-form-item>

            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input 
                v-model="passwordForm.confirmPassword" 
                type="password" 
                placeholder="请再次输入新密码"
                show-password
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="updatePassword" :loading="passwordLoading">
                修改密码
              </el-button>
              <el-button @click="resetPasswordForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 头像和状态 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>头像设置</span>
            </div>
          </template>

          <div class="avatar-section">
            <div class="avatar-upload">
              <el-upload
                class="avatar-uploader"
                action="/api/admin/upload/image"
                :show-file-list="false"
                :before-upload="beforeAvatarUpload"
                :on-success="handleAvatarSuccess"
                :on-error="handleAvatarError"
                :headers="{
                  'Accept': 'application/json'
                }"
              >
                <img v-if="form.avatar" :src="form.avatar" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
              <div class="avatar-tips">
                <p>建议尺寸：200x200像素</p>
                <p>支持格式：JPG、PNG</p>
                <p>文件大小：不超过2MB</p>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 账户信息 -->
        <el-card style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <span>账户信息</span>
            </div>
          </template>

          <div class="account-info">
            <div class="info-item">
              <span class="info-label">用户ID：</span>
              <span class="info-value">{{ userInfo.id }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">注册时间：</span>
              <span class="info-value">{{ formatDate(userInfo.createdAt) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">最后登录：</span>
              <span class="info-value">{{ formatDate(userInfo.lastLoginAt) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">登录次数：</span>
              <span class="info-value">{{ userInfo.loginCount || 0 }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">账户状态：</span>
              <el-tag :type="userInfo.status === 'active' ? 'success' : 'danger'" size="small">
                {{ userInfo.status === 'active' ? '正常' : '停用' }}
              </el-tag>
            </div>
          </div>
        </el-card>

        <!-- 安全设置 -->
        <el-card style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <span>安全设置</span>
            </div>
          </template>

          <div class="security-settings">
            <div class="security-item">
              <div class="security-info">
                <div class="security-title">两步验证</div>
                <div class="security-desc">通过手机验证码增强账户安全</div>
              </div>
              <el-switch 
                v-model="securitySettings.twoFactorEnabled" 
                @change="updateSecuritySetting('twoFactor')"
              />
            </div>

            <div class="security-item">
              <div class="security-info">
                <div class="security-title">登录提醒</div>
                <div class="security-desc">新设备登录时发送邮件提醒</div>
              </div>
              <el-switch 
                v-model="securitySettings.loginNotification" 
                @change="updateSecuritySetting('loginNotification')"
              />
            </div>

            <div class="security-item">
              <div class="security-info">
                <div class="security-title">定期密码更新</div>
                <div class="security-desc">系统将提醒您定期更换密码</div>
              </div>
              <el-switch 
                v-model="securitySettings.passwordReminder" 
                @change="updateSecuritySetting('passwordReminder')"
              />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { ResponseData, UploadResponse, UserProfile } from '~/types/response'

definePageMeta({
  layout: 'admin',
  title: 'routes.userProfile',
  icon: 'user'
})

// 响应式数据
const formRef = ref<FormInstance>()
const passwordRef = ref()
const loading = ref(false)
const passwordLoading = ref(false)

// 用户信息
const userInfo = ref<{
  id: number
  createdAt: string
  lastLoginAt: string | null
  loginCount: number
  status: 'active' | 'inactive'
}>({
  id: 1,
  createdAt: '',
  lastLoginAt: '',
  loginCount: 0,
  status: 'active'
})

// 表单数据
const form = ref({
  username: '',
  email: '',
  realName: '',
  nickname: '',
  phone: '',
  bio: '',
  company: '',
  position: '',
  location: '',
  website: '',
  wechat: '',
  qq: '',
  telegram: '',
  whatsapp: '',
  skype: '',
  twitter: '',
  language: 'zh-CN',
  theme: 'light',
  timezone: 'Asia/Shanghai',
  notification: true,
  avatar: ''
})

// 密码修改表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 安全设置
const securitySettings = reactive({
  twoFactorEnabled: false,
  loginNotification: true,
  passwordReminder: false
})

// 表单验证规则
const rules = ref<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  website: [
    { type: 'url', message: '请输入正确的网址', trigger: 'blur' }
  ]
})

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
             validator: (rule: any, value: any, callback: any) => {
         if (value !== passwordForm.newPassword) {
           callback(new Error('两次输入的密码不一致'))
         } else {
           callback()
         }
       },
      trigger: 'blur'
    }
  ]
}

// 方法
const fetchProfile = async () => {
  try {
    const response = await $fetch('/api/admin/profile/profile')
    if (response.code === 200 && response.data) {
      form.value  = response.data;
      // 更新用户信息
      userInfo.value = {
        id: response.data.id,
        createdAt: response.data.createdAt,
        lastLoginAt: response.data.lastLoginAt || null,
        loginCount: response.data.loginCount || 0,
        status: response.data.status
      }
    } else {
      ElMessage.error(response.message || '获取个人资料失败')
    }
  } catch (error) {
    console.error('获取个人资料失败:', error)
    ElMessage.error('获取个人资料失败')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    loading.value = true
    const response = await $fetch('/api/admin/profile/update', {
      method: 'POST',
      body: form.value
    })
    
    if (response.code === 200) {
      ElMessage.success('保存成功')
      await fetchProfile() // 重新加载数据
    } else {
      ElMessage.error(response.message || '保存失败')
    }
  } catch (error) {
    console.error('保存个人资料失败:', error)
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}

const updatePassword = async () => {
  try {
    await passwordRef.value.validate()
    passwordLoading.value = true
    
    const response = await $fetch('/api/admin/profile/password', {
      method: 'POST',
      body: passwordForm
    })
    
    if (response.code === 200) {
      ElMessage.success(response.message || '密码修改成功')
      resetPasswordForm()
    } else {
      ElMessage.error(response.message || '修改密码失败')
    }
  } catch (error) {
    if (error !== false) {
      ElMessage.error('修改密码失败')
      console.error(error)
    }
  } finally {
    passwordLoading.value = false
  }
}

interface UploadFile {
  type: string
  size: number
  raw: File
}

const beforeAvatarUpload = (file: UploadFile) => {
  const isJPGOrPNG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPGOrPNG) {
    ElMessage.error('头像只能是 JPG 或 PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
    return false
  }
  return true
}

const handleAvatarSuccess = async (response: any) => {
  if (response.code === 200 && response.data?.url) {
    form.value.avatar = response.data.url
    // 更新用户资料
    await handleSubmit()
    ElMessage.success('头像上传成功')
  } else {
    ElMessage.error(response.message || '头像上传失败')
  }
}

const handleAvatarError = (error: any) => {
  console.error('头像上传失败:', error)
  ElMessage.error('头像上传失败')
}

const updateSecuritySetting = async (setting: string) => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('安全设置更新成功')
  } catch (error) {
    ElMessage.error('更新安全设置失败')
    console.error(error)
  }
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
    fetchProfile()
  }
}

const resetPasswordForm = () => {
  passwordRef.value?.resetFields()
  Object.assign(passwordForm, {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
}

const formatDate = (dateString: string | null): string => {
  if (!dateString) return '未知'
  return new Date(dateString).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  fetchProfile()
})
</script>

<style scoped>
.profile-management {
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.avatar-section {
  text-align: center;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
  width: 120px;
  height: 120px;
  margin: 0 auto 16px;
}

.avatar-uploader:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  text-align: center;
  line-height: 120px;
}

.avatar {
  width: 120px;
  height: 120px;
  object-fit: cover;
  display: block;
}

.avatar-tips {
  text-align: left;
}

.avatar-tips p {
  margin: 4px 0;
  font-size: 12px;
  color: #909399;
}

.account-info .info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.account-info .info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #606266;
  font-size: 14px;
}

.info-value {
  color: #303133;
  font-size: 14px;
  font-weight: 500;
}

.security-settings .security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f5f5f5;
}

.security-settings .security-item:last-child {
  border-bottom: none;
}

.security-info {
  flex: 1;
}

.security-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}

.security-desc {
  font-size: 12px;
  color: #909399;
}

:deep(.el-card__header) {
  padding: 18px 20px;
  border-bottom: 1px solid #EBEEF5;
}

:deep(.el-card__body) {
  padding: 20px;
}
</style>