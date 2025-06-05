<template>
  <div class="page-container">
    <div class="page-header">
      <h1>AI 助手</h1>
      <p>获取智能投资建议和域名分析</p>
    </div>
    
    <div class="coming-soon">
      <el-card>
        <div class="content">
          <svg-icon icon-class="build" size="48px" color="#e6a23c" />
          <h2>功能开发中</h2>
          <p>AI 智能助手功能正在开发中，敬请期待...</p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  title: 'AI 助手',
  middleware: 'auth'
})

useHead({
  title: 'AI 助手 - DMS 管理后台'
})
</script>

<style scoped lang="scss">
.page-container {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
  
  h1 {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-color);
    margin: 0 0 8px 0;
  }
  
  p {
    color: var(--text-color-secondary);
    margin: 0;
  }
}

.coming-soon {
  .content {
    text-align: center;
    padding: 60px 20px;
    
    h2 {
      font-size: 20px;
      color: var(--text-color);
      margin: 16px 0 8px 0;
    }
    
    p {
      color: var(--text-color-secondary);
      margin: 0;
    }
  }
}
</style> 