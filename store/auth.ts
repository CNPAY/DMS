import { defineStore } from 'pinia'
import type { User } from '~/types'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    isAuthenticated: false
  }),

  getters: {
    getCurrentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated
  },

  actions: {
    // 登录
    async login(credentials: { username: string; password: string }) {
      try {
        const response = await $fetch<{ user: User; token: string }>('/api/auth/login', {
          method: 'POST',
          body: credentials
        })
        
        this.user = response.user
        this.token = response.token
        this.isAuthenticated = true
        
        // 保存到 localStorage
        if (import.meta.client) {
          localStorage.setItem('token', response.token)
          localStorage.setItem('user', JSON.stringify(response.user))
        }
        
        return response
      } catch (error) {
        console.error('Login error:', error)
        throw error
      }
    },

    // 登出
    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      
      // 清除 localStorage
      if (import.meta.client) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
      
      // 重定向到登录页
      return navigateTo('/auth/login')
    },

    // 检查认证状态
    async checkAuth() {
      if (import.meta.client) {
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')
        
        if (token && userStr) {
          try {
            this.token = token
            this.user = JSON.parse(userStr)
            this.isAuthenticated = true
            
            // 验证 token 是否有效
            const response = await $fetch<{ user: User }>('/api/auth/me', {
              headers: {
                Authorization: `Bearer ${token}`
              }
            })
            
            this.user = response.user
          } catch {
            // Token 无效，清除状态
            this.logout()
          }
        }
      }
    },

    // 获取当前用户信息
    async getCurrentUserInfo() {
      if (!this.token) return null

      try {
        const response = await $fetch<{ user: User }>('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })
        
        this.user = response.user
        return response.user
      } catch (error) {
        console.error('Get user info error:', error)
        this.logout()
        return null
      }
    }
  }
}) 