import { getToken } from '~/utils/auth'
import useUserStore from '~/store/modules/user'

export default defineNuxtRouteMiddleware(async (to) => {
  const userStore = useUserStore()
  // 检查是否有登录凭证
  const token = getToken() || ''
  
  // 如果没有token且不是登录页面，则重定向到登录页面
  if (!token && to.path !== '/admin/login') {
    return navigateTo('/admin/login')
  }
  
  // 如果有token，但没有用户信息，则获取用户信息
  if (token && !userStore.id) {
    try {
      await userStore.getInfo()
    }
    catch (error) {
      // 获取用户信息失败，可能是token过期，清除token并重定向到登录页
      userStore.logOut()
      return navigateTo('/admin/login')
    }
  }

  // 如果已登录且访问登录页面，则重定向到管理后台
  if (token && to.path === '/admin/login') {
    return navigateTo('/admin/')
  }
}) 