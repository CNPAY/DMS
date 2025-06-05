<template>
  <div class="page-container">
    <div class="page-header">
      <h1>销售报表</h1>
      <p>分析域名投资数据和销售业绩</p>
    </div>
    
    <div class="coming-soon">
      <el-card>
        <div class="content">
          <svg-icon icon-class="chart" size="48px" color="#67c23a" />
          <h2>功能开发中</h2>
          <p>销售报表功能正在开发中，敬请期待...</p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  title: '销售报表',
  middleware: 'auth'
})

useHead({
  title: '销售报表 - DMS 管理后台'
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