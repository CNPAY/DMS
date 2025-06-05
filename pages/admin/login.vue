<template>
  <div class="login-container">
    <div class="login-wrapper">
      <div class="login-form-container">
        <div class="login-header">
          <h1 class="login-title">{{ $t('auth.welcome') }}</h1>
          <p class="login-subtitle">{{ $t('auth.loginToManage') }}</p>
        </div>

        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="email">
            <el-input
              v-model="loginForm.email"
              :placeholder="$t('auth.email')"
              size="large"
              prefix-icon="User"
              clearable
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              :placeholder="$t('auth.password')"
              size="large"
              prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              :loading="loading"
              type="primary"
              size="large"
              class="login-button"
              @click="handleLogin"
            >
              {{ loading ? $t('auth.loggingIn') : $t('auth.login') }}
            </el-button>
          </el-form-item>
        </el-form>

        <div class="login-footer">
          <p class="demo-hint">{{ $t('auth.demoHint') }}</p>
          <p class="demo-credentials">
            {{ $t('auth.email') }}: admin@dms.com<br>
            {{ $t('auth.password') }}: admin123
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import useUserStore from '@/store/modules/user'

// 页面元信息
definePageMeta({
  layout: 'admin-login',
  auth: false
})

// 响应式数据
const loginFormRef = ref<FormInstance>()
const loading = ref(false)
const userStore = useUserStore()
const { t } = useI18n()

// 表单数据
const loginForm = reactive({
  email: 'admin@dms.com',
  password: 'admin123'
})

// 表单验证规则
const loginRules: FormRules = {
  email: [
    { required: true, message: t('auth.emailRequired'), trigger: 'blur' },
    { type: 'email', message: t('auth.emailInvalid'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('auth.passwordRequired'), trigger: 'blur' },
    { min: 6, message: t('auth.passwordMinLength'), trigger: 'blur' }
  ]
}

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()
    loading.value = true

    const response = await $fetch<{
      success: boolean
      message: string
      user: any
      token: string
    }>('/api/auth/login', {
      method: 'POST',
      body: {
        email: loginForm.email,
        password: loginForm.password
      }
    })

    if (response.success) {
      // 保存用户信息到store
      await userStore.setUserInfo(response.user,response.token)
      
      ElMessage.success(response.message || t('auth.loginSuccess'))
      
      // 跳转到管理后台
      await navigateTo('/admin/dashboard')
    }
  } catch (error: any) {
    console.error('Login error:', error)
    ElMessage.error(error.data?.message || t('auth.loginFailed'))
  } finally {
    loading.value = false
  }
}

// 页面标题
useHead({
  title: t('auth.login') + ' - DMS'
})
</script>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding:  0px;
}

.login-wrapper {
  width: 100%;
  max-width: 400px;
}

.login-form-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;

  .login-title {
    font-size: 28px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 8px 0;
  }

  .login-subtitle {
    font-size: 16px;
    color: #7f8c8d;
    margin: 0;
  }
}

.login-form {
  .el-form-item {
    margin-bottom: 20px;
  }

  .login-button {
    width: 100%;
    height: 44px;
    font-size: 16px;
    font-weight: 500;
  }
}

.login-footer {
  margin-top: 30px;
  text-align: center;

  .demo-hint {
    font-size: 14px;
    color: #95a5a6;
    margin: 0 0 10px 0;
  }

  .demo-credentials {
    font-size: 12px;
    color: #7f8c8d;
    background: #f8f9fa;
    padding: 12px;
    border-radius: 8px;
    margin: 0;
    line-height: 1.5;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .login-container {
    padding: 0px;
  }

  .login-form-container {
    padding: 30px 24px;
  }

  .login-header .login-title {
    font-size: 24px;
  }
}
</style> 