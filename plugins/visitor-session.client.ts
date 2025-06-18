// 客户端会话ID持久化插件
export default defineNuxtPlugin(() => {
  // 检查是否有会话ID cookie
  const cookie = useCookie('visitor_session_id', {
    maxAge: 30 * 24 * 60 * 60, // 30天过期
    path: '/',
    sameSite: 'lax'
  })
  
  // 如果没有会话ID cookie，生成一个并设置
  if (!cookie.value) {
    // 生成随机会话ID
    const sessionId = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15)
    
    cookie.value = sessionId
    
    console.log('已创建新的访客会话ID:', sessionId)
  } else {
    console.log('使用现有的访客会话ID:', cookie.value)
  }
  
  // 暴露一个获取会话ID的方法
  return {
    provide: {
      getVisitorSessionId: () => cookie.value
    }
  }
}) 