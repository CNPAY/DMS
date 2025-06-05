import { getToken } from '~/utils/auth'

export default defineNuxtRouteMiddleware((to) => {
  // 检查是否有登录凭证
  const token =  getToken() || ''
  debugger
  // 如果没有token且不是登录页面，则重定向到登录页面
  if (!token && to.path !== '/admin/login') {
    return navigateTo('/admin/login')
  }
  
  // 如果已登录且访问登录页面，则重定向到管理后台
  if (token && to.path === '/admin/login') {
    return navigateTo('/admin/dashboard')
  }
}) 