<template>
  <div class="admin-dashboard">
    <!-- 等待 Element Plus 加载 -->
    <div v-if="!elementPlusReady" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载管理界面...</p>
    </div>
    
    <!-- 仪表盘内容 -->
    <div v-else class="dashboard-content">
      <div class="dashboard-header">
        <h1>DMS 管理仪表盘</h1>
        <p>欢迎使用域名资产管理系统</p>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-grid">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon domain-icon">
              <svg-icon icon-class="server" size="32px" />
            </div>
            <div class="stats-info">
              <div class="stats-number">0</div>
              <div class="stats-label">总域名数量</div>
            </div>
          </div>
        </el-card>

        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon portfolio-icon">
              <svg-icon icon-class="table" size="32px" />
            </div>
            <div class="stats-info">
              <div class="stats-number">0</div>
              <div class="stats-label">米表数量</div>
            </div>
          </div>
        </el-card>

        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon inquiry-icon">
              <svg-icon icon-class="message" size="32px" />
            </div>
            <div class="stats-info">
              <div class="stats-number">0</div>
              <div class="stats-label">待处理询盘</div>
            </div>
          </div>
        </el-card>

        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon value-icon">
              <svg-icon icon-class="money" size="32px" />
            </div>
            <div class="stats-info">
              <div class="stats-number">¥0</div>
              <div class="stats-label">总资产价值</div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 快捷操作 -->
      <div class="quick-actions">
        <h2>快捷操作</h2>
        <div class="actions-grid">
          <el-card class="action-card">
            <div class="action-content">
              <div class="action-icon">
                <svg-icon icon-class="plus" size="24px" type="element" />
              </div>
              <h3>添加域名</h3>
              <p>录入新的域名信息</p>
              <el-button type="primary" @click="navigateTo('/admin/domain/register')">
                立即添加
              </el-button>
            </div>
          </el-card>

          <el-card class="action-card">
            <div class="action-content">
              <div class="action-icon">
                <svg-icon icon-class="chart" size="24px" />
              </div>
              <h3>查看报表</h3>
              <p>分析域名投资数据</p>
              <el-button type="primary" @click="navigateTo('/admin/report/sales')">
                查看报表
              </el-button>
            </div>
          </el-card>

          <el-card class="action-card">
            <div class="action-content">
              <div class="action-icon">
                <svg-icon icon-class="build" size="24px" />
              </div>
              <h3>AI 助手</h3>
              <p>获取智能投资建议</p>
              <el-button type="primary" @click="navigateTo('/admin/ai/chatbot')">
                开始对话
              </el-button>
            </div>
          </el-card>

          <el-card class="action-card">
            <div class="action-content">
              <div class="action-icon">
                <svg-icon icon-class="system" size="24px" />
              </div>
              <h3>系统设置</h3>
              <p>配置系统参数</p>
              <el-button type="primary" @click="navigateTo('/admin/system/registrar')">
                前往设置
              </el-button>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 设置管理后台布局和认证保护
definePageMeta({
  layout: 'admin',
  title: '仪表盘',
  middleware: 'auth'
})

// 使用智能 UI 库管理器
const { isElementPlusLoaded } = useUILibrary()

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

// 设置页面标题
useHead({
  title: '仪表盘 - DMS 管理后台'
})
</script>

<style scoped lang="scss">
.admin-dashboard {
  min-height: 100%;
  padding: 15px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--text-color-secondary);
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--border-color);
    border-top: 4px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }
}

.dashboard-content {
  .dashboard-header {
    margin-bottom: 32px;
    
    h1 {
      font-size: 2rem;
      font-weight: 600;
      color: var(--text-color);
      margin: 0 0 8px 0;
    }
    
    p {
      color: var(--text-color-secondary);
      margin: 0;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
  
  .stats-card {
    .stats-content {
      display: flex;
      align-items: center;
      gap: 16px;
      
      .stats-icon {
        font-size: 2.5rem;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        background-color: var(--bg-color-secondary);
      }
      
      .stats-info {
        flex-grow: 1;
        
        .stats-number {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--text-color);
          margin-bottom: 4px;
        }
        
        .stats-label {
          color: var(--text-color-secondary);
          font-size: 0.9rem;
        }
      }
    }
  }
}

.quick-actions {
  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-color);
    margin: 0 0 20px 0;
  }
  
  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    
    .action-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      }
      
      .action-content {
        text-align: center;
        padding: 20px;
        
        .action-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }
        
        h3 {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--text-color);
          margin: 0 0 8px 0;
        }
        
        p {
          color: var(--text-color-secondary);
          margin: 0 0 20px 0;
          font-size: 0.9rem;
        }
      }
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 响应式设计
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .dashboard-content {
    .dashboard-header h1 {
      font-size: 1.6rem;
    }
  }
}
</style> 