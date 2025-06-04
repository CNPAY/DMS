<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1 class="logo">
          <NuxtLink to="/admin">DMS 管理后台</NuxtLink>
        </h1>
      </div>
      
      <nav class="sidebar-nav">
        <!-- 等待 Element Plus 加载 -->
        <div v-if="!elementPlusReady" class="loading-placeholder">
          <div class="loading-text">正在加载管理界面...</div>
        </div>
        
        <!-- Element Plus 菜单 -->
        <ClientOnly>
          <el-menu
            v-if="elementPlusReady"
            :default-active="activeMenu"
            mode="vertical"
            :collapse="false"
            router
          >
            <el-menu-item index="/admin">
              <el-icon><House /></el-icon>
              <span>仪表盘</span>
            </el-menu-item>
            
            <el-sub-menu index="domains">
              <template #title>
                <el-icon><Grid /></el-icon>
                <span>域名管理</span>
              </template>
              <el-menu-item index="/admin/domains">域名列表</el-menu-item>
              <el-menu-item index="/admin/domains/create">添加域名</el-menu-item>
              <el-menu-item index="/admin/categories">域名分类</el-menu-item>
              <el-menu-item index="/admin/tags">域名标签</el-menu-item>
            </el-sub-menu>
            
            <el-sub-menu index="portfolios">
              <template #title>
                <el-icon><Collection /></el-icon>
                <span>米表管理</span>
              </template>
              <el-menu-item index="/admin/portfolios">米表列表</el-menu-item>
              <el-menu-item index="/admin/portfolios/create">创建米表</el-menu-item>
            </el-sub-menu>
            
            <el-menu-item index="/admin/inquiries">
              <el-icon><Message /></el-icon>
              <span>询盘管理</span>
            </el-menu-item>
            
            <el-menu-item index="/admin/registrars">
              <el-icon><Shop /></el-icon>
              <span>注册商管理</span>
            </el-menu-item>
            
            <el-menu-item index="/admin/watched-domains">
              <el-icon><View /></el-icon>
              <span>域名关注</span>
            </el-menu-item>
            
            <el-sub-menu index="reports">
              <template #title>
                <el-icon><TrendCharts /></el-icon>
                <span>数据报表</span>
              </template>
              <el-menu-item index="/admin/reports/sales">销售报表</el-menu-item>
              <el-menu-item index="/admin/reports/costs">成本报表</el-menu-item>
              <el-menu-item index="/admin/reports/traffic">访问统计</el-menu-item>
            </el-sub-menu>
            
            <el-sub-menu index="ai">
              <template #title>
                <el-icon><Cpu /></el-icon>
                <span>AI 辅助</span>
              </template>
              <el-menu-item index="/admin/ai/prompts">提示词管理</el-menu-item>
              <el-menu-item index="/admin/ai/chat">AI 聊天</el-menu-item>
            </el-sub-menu>
            
            <el-menu-item index="/admin/settings">
              <el-icon><Setting /></el-icon>
              <span>系统设置</span>
            </el-menu-item>
          </el-menu>
        </ClientOnly>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部导航栏 -->
      <header class="top-bar">
        <div class="top-bar-left">
          <h2 class="page-title">{{ pageTitle }}</h2>
        </div>
        <div class="top-bar-right">
          <ClientOnly>
            <el-dropdown v-if="elementPlusReady">
              <span class="user-info">
                <el-icon><User /></el-icon>
                {{ currentUser?.username || '用户' }}
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <!-- 降级用户菜单 -->
            <div v-else class="fallback-user-menu">
              <span class="user-info">用户</span>
              <button @click="logout" class="logout-btn">退出</button>
            </div>
          </ClientOnly>
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="page-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
// 使用智能 UI 库管理器
const { isElementPlusLoaded } = useUILibrary()

// 当前激活的菜单项
const route = useRoute()
const activeMenu = computed(() => route.path)

// 检查 Element Plus 是否准备就绪
const elementPlusReady = ref(false)

// 监听 Element Plus 加载状态
watch(() => isElementPlusLoaded(), (loaded) => {
  elementPlusReady.value = loaded
}, { immediate: true })

// 轮询检查 Element Plus 是否加载完成（备用方案）
onMounted(() => {
  const checkInterval = setInterval(() => {
    if (isElementPlusLoaded()) {
      elementPlusReady.value = true
      clearInterval(checkInterval)
    }
  }, 100)
  
  // 最多等待 5 秒
  setTimeout(() => {
    clearInterval(checkInterval)
  }, 5000)
})

// 页面标题映射
const pageTitleMap: Record<string, string> = {
  '/admin': '仪表盘',
  '/admin/domains': '域名列表',
  '/admin/domains/create': '添加域名',
  '/admin/categories': '域名分类',
  '/admin/tags': '域名标签',
  '/admin/portfolios': '米表列表',
  '/admin/portfolios/create': '创建米表',
  '/admin/inquiries': '询盘管理',
  '/admin/registrars': '注册商管理',
  '/admin/watched-domains': '域名关注',
  '/admin/reports/sales': '销售报表',
  '/admin/reports/costs': '成本报表',
  '/admin/reports/traffic': '访问统计',
  '/admin/ai/prompts': '提示词管理',
  '/admin/ai/chat': 'AI 聊天',
  '/admin/settings': '系统设置'
}

const pageTitle = computed(() => {
  return pageTitleMap[route.path] || '管理后台'
})

// 获取当前用户信息
const authStore = useAuthStore()
const currentUser = computed(() => authStore.getCurrentUser)

// 退出登录
const logout = async () => {
  await authStore.logout()
}

// 检查登录状态
onMounted(() => {
  authStore.checkAuth()
})

// 设置页面标题
useHead({
  title: `${pageTitle.value} - DMS 管理后台`
})
</script>

<style scoped lang="scss">
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-color-secondary);
}

.sidebar {
  width: 250px;
  background-color: var(--bg-color);
  border-right: 1px solid var(--border-color);
  flex-shrink: 0;
  
  .sidebar-header {
    padding: 20px;
    border-bottom: 1px solid var(--border-color);
    
    .logo a {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--primary-color);
      text-decoration: none;
    }
  }
  
  .sidebar-nav {
    padding: 10px 0;
    
    // 加载占位符样式
    .loading-placeholder {
      padding: 20px;
      text-align: center;
      
      .loading-text {
        color: var(--text-color-secondary);
        font-size: 0.9rem;
        animation: pulse 1.5s infinite;
      }
    }
  }
}

.main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.top-bar {
  height: 60px;
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  
  .page-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-color);
    margin: 0;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 6px;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: var(--bg-color-secondary);
    }
  }
  
  // 降级用户菜单样式
  .fallback-user-menu {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .logout-btn {
      padding: 6px 12px;
      background-color: var(--primary-color);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
      
      &:hover {
        background-color: #2563eb;
      }
    }
  }
}

.page-content {
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
}

// 动画
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

// 响应式设计
@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
  }
  
  .main-content {
    width: 100%;
  }
  
  .top-bar {
    padding: 0 15px;
    
    .page-title {
      font-size: 1.1rem;
    }
  }
  
  .page-content {
    padding: 15px;
  }
}
</style> 