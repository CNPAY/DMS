<template>
  <div class="main-container">
    <header class="site-header">
      <div class="container">
        <h1 class="site-title">
          <NuxtLink to="/">DMS - 域名资产管理系统</NuxtLink>
        </h1>
        <nav class="site-nav">
          <NuxtLink to="/">首页</NuxtLink>
          <NuxtLink to="/portfolio">域名展示</NuxtLink>
        </nav>
      </div>
    </header>

    <main class="site-main">
      <slot />
    </main>

    <footer class="site-footer">
      <div class="container">
        <p>&copy; 2024 DMS - 域名资产管理系统. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.main-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.site-header {
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 0;
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .site-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    
    a {
      color: var(--text-color-primary);
      text-decoration: none;
      
      &:hover {
        color: var(--primary-color);
      }
    }
  }
  
  .site-nav {
    display: flex;
    gap: 2rem;
    
    a {
      color: var(--text-color-secondary);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
      
      &:hover,
      &.router-link-active {
        color: var(--primary-color);
      }
    }
  }
}

.site-main {
  flex: 1;
  padding: 2rem 0;
}

.site-footer {
  background-color: var(--bg-color-secondary);
  padding: 2rem 0;
  margin-top: auto;
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    text-align: center;
    color: var(--text-color-secondary);
  }
}

@media (max-width: 768px) {
  .site-header {
    .container {
      flex-direction: column;
      gap: 1rem;
    }
    
    .site-nav {
      gap: 1rem;
    }
  }
}
</style> 