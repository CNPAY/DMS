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
              <span>基本信息</span>
            </div>
          </template>

          <el-form ref="profileRef" :model="profileForm" :rules="profileRules" label-width="100px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="用户名" prop="username">
                  <el-input v-model="profileForm.username" placeholder="请输入用户名" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="手机号码" prop="phone">
                  <el-input v-model="profileForm.phone" placeholder="请输入手机号码" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="真实姓名" prop="realName">
                  <el-input v-model="profileForm.realName" placeholder="请输入真实姓名" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="个人简介" prop="bio">
              <el-input 
                v-model="profileForm.bio" 
                type="textarea" 
                :rows="3"
                placeholder="请输入个人简介"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="updateProfile" :loading="profileLoading">
                保存资料
              </el-button>
              <el-button @click="resetProfileForm">重置</el-button>
            </el-form-item>
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
                action="#"
                :show-file-list="false"
                :before-upload="beforeAvatarUpload"
                :on-success="handleAvatarSuccess"
                :on-error="handleAvatarError"
              >
                <img v-if="profileForm.avatar" :src="profileForm.avatar" class="avatar" />
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

definePageMeta({
  layout: 'admin',
  title: 'routes.userProfile',
  icon: 'user'
})

// 响应式数据
const profileRef = ref()
const passwordRef = ref()
const profileLoading = ref(false)
const passwordLoading = ref(false)

// 用户信息
const userInfo = ref({
  id: 1,
  createdAt: '2023-01-01T00:00:00Z',
  lastLoginAt: '2025-01-27T10:30:00Z',
  loginCount: 156,
  status: 'active'
})

// 个人资料表单
const profileForm = reactive({
  username: 'admin',
  email: 'admin@dms.com',
  phone: '',
  realName: '',
  bio: '',
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
const profileRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

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
const loadUserProfile = async () => {
  try {
    // 模拟加载用户资料
    // const response = await $fetch('/api/admin/profile')
    // Object.assign(profileForm, response.profile)
    // Object.assign(securitySettings, response.securitySettings)
  } catch (error) {
    ElMessage.error('加载用户资料失败')
    console.error(error)
  }
}

const updateProfile = async () => {
  try {
    await profileRef.value.validate()
    profileLoading.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('个人资料更新成功')
  } catch (error) {
    if (error !== false) {
      ElMessage.error('更新个人资料失败')
      console.error(error)
    }
  } finally {
    profileLoading.value = false
  }
}

const updatePassword = async () => {
  try {
    await passwordRef.value.validate()
    passwordLoading.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('密码修改成功')
    resetPasswordForm()
  } catch (error) {
    if (error !== false) {
      ElMessage.error('修改密码失败')
      console.error(error)
    }
  } finally {
    passwordLoading.value = false
  }
}

const beforeAvatarUpload = (file) => {
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

const handleAvatarSuccess = (response, file) => {
  profileForm.avatar = URL.createObjectURL(file.raw)
  ElMessage.success('头像上传成功')
}

const handleAvatarError = () => {
  ElMessage.error('头像上传失败')
}

const updateSecuritySetting = async (setting) => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('安全设置更新成功')
  } catch (error) {
    ElMessage.error('更新安全设置失败')
    console.error(error)
  }
}

const resetProfileForm = () => {
  profileRef.value?.resetFields()
}

const resetPasswordForm = () => {
  passwordRef.value?.resetFields()
  Object.assign(passwordForm, {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadUserProfile()
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