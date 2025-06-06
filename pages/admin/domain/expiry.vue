<template>
    <div class="page-container">
      <div class="page-header">
        <h1>域名到期提醒</h1>
        <p>录入新的域名信息</p>
      </div>
      
      <div class="coming-soon">
        <el-card>
          <div class="content">
            <svg-icon icon-class="plus" size="48px" color="#409eff" />
            <h2>功能开发中</h2>
            <p>域名录入功能正在开发中，敬请期待...</p>
          </div>
        </el-card>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  definePageMeta({
    layout: 'admin',
    title: '添加域名',
    middleware: 'auth'
  })
  
  useHead({
    title: '添加域名 - DMS 管理后台'
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