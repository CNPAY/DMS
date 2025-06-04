<template>
  <div class="landing-page">
    <header class="landing-header">
      <div class="container">
        <div class="logo">
          <NuxtLink to="/">{{ appName }}</NuxtLink>
        </div>
        <nav class="landing-nav">
          <NuxtLink to="/">首页</NuxtLink>
          <NuxtLink to="/portfolio">域名米表</NuxtLink>
          <NuxtLink to="/contact">联系我们</NuxtLink>
        </nav>
      </div>
    </header>

    <main class="landing-main">
      <section class="hero-section">
        <div class="container">
          <h1 class="hero-title">发现、投资、管理您的数字资产</h1>
          <p class="hero-subtitle">
            专业的域名展示平台，助您发掘高价值域名，轻松管理您的域名组合。
          </p>
          <div class="hero-actions">
            <NuxtLink to="/portfolio" class="btn btn-primary">浏览精品域名</NuxtLink>
            <NuxtLink to="/admin" class="btn btn-secondary">进入管理后台</NuxtLink>
          </div>
        </div>
      </section>

      <section class="featured-domains-section">
        <div class="container">
          <h2 class="section-title">精选域名</h2>
          <div class="domains-grid">
            <!-- 示例域名卡片 - 后续将动态加载 -->
            <div v-for="i in 6" :key="i" class="domain-card">
              <h3 class="domain-name">example{{ i }}.com</h3>
              <p class="domain-description">一个非常有潜力的商业域名，适合各种创新项目。</p>
              <span class="domain-price">¥12,000</span>
              <NuxtLink :to="`/domain/example${i}com`" class="btn btn-sm btn-outline">查看详情</NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <section class="cta-section">
        <div class="container">
          <h2>准备好开始您的域名投资之旅了吗？</h2>
          <p>立即加入我们，探索无限可能。</p>
          <NuxtLink to="/register" class="btn btn-lg btn-primary">注册账户</NuxtLink>
        </div>
      </section>
    </main>

    <footer class="landing-footer">
      <div class="container">
        <p>&copy; {{ new Date().getFullYear() }} {{ appName }}. 保留所有权利。</p>
        <nav class="footer-nav">
          <NuxtLink to="/about">关于我们</NuxtLink>
          <NuxtLink to="/privacy">隐私政策</NuxtLink>
          <NuxtLink to="/terms">服务条款</NuxtLink>
        </nav>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const appName = config.public.appName

useHead({
  title: `${appName} - 精品域名投资与管理平台`,
  meta: [
    {
      name: 'description',
      content: `探索和投资高价值域名。${appName} 为您提供专业的域名展示、管理和交易服务。`
    }
  ]
})
</script>

<style scoped lang="scss">
.landing-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa; // 轻盈的背景色
  color: #343a40; // 深色文本
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
}

// Header
.landing-header {
  padding: 1.5rem 0;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 1000;

  .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo a {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--primary-color);
    text-decoration: none;
  }

  .landing-nav a {
    margin-left: 1.5rem;
    text-decoration: none;
    color: #495057; // 导航链接颜色
    font-weight: 500;
    transition: color 0.2s ease-in-out;

    &:hover {
      color: var(--primary-color);
    }
  }
}

// Main Content
.landing-main {
  flex-grow: 1;
}

// Hero Section
.hero-section {
  background: linear-gradient(135deg, var(--primary-color) 0%, #1a365d 100%);
  color: #fff;
  padding: 6rem 0;
  text-align: center;

  .hero-title {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 1rem;
    line-height: 1.2;
  }

  .hero-subtitle {
    font-size: 1.25rem;
    margin-bottom: 2.5rem;
    opacity: 0.9;
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
  }

  .hero-actions .btn {
    margin: 0 0.5rem;
  }
}

// Buttons
.btn {
  padding: 0.8rem 1.8rem;
  border-radius: 30px; // 更圆润的按钮
  text-decoration: none;
  font-weight: 600;
  transition: all 0.25s ease-out;
  display: inline-block;
  border: 2px solid transparent;
  cursor: pointer;

  &.btn-primary {
    background-color: var(--primary-color);
    color: #fff;
    border-color: var(--primary-color);
    &:hover {
      background-color: #2563eb;
      transform: translateY(-3px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
  }

  &.btn-secondary {
    background-color: #fff;
    color: var(--primary-color);
    border-color: var(--primary-color);
    &:hover {
      background-color: #f1f3f5;
      transform: translateY(-3px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
  }
  
  &.btn-sm {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  &.btn-lg {
    padding: 1rem 2.5rem;
    font-size: 1.1rem;
  }
  
  &.btn-outline {
    background-color: transparent;
    color: var(--primary-color);
    border-color: var(--primary-color);
    &:hover {
      background-color: var(--primary-color);
      color: #fff;
    }
  }
}

// Featured Domains Section
.featured-domains-section {
  padding: 4rem 0;

  .section-title {
    text-align: center;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 3rem;
  }

  .domains-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2rem;
  }

  .domain-card {
    background-color: #fff;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 6px 12px rgba(0,0,0,0.08);
    transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
    display: flex;
    flex-direction: column;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.12);
    }

    .domain-name {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--primary-color);
      margin-bottom: 0.75rem;
    }

    .domain-description {
      font-size: 1rem;
      color: #6c757d;
      margin-bottom: 1rem;
      flex-grow: 1;
    }

    .domain-price {
      font-size: 1.25rem;
      font-weight: 700;
      color: #28a745; // 价格用绿色突出
      margin-bottom: 1.5rem;
    }
    
    .btn {
      align-self: flex-start;
    }
  }
}

// CTA Section
.cta-section {
  background-color: var(--bg-color-secondary);
  padding: 4rem 0;
  text-align: center;

  h2 {
    font-size: 2.2rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.1rem;
    color: #495057;
    margin-bottom: 2rem;
  }
}

// Footer
.landing-footer {
  background-color: #343a40; // 深色页脚
  color: #adb5bd;
  padding: 2.5rem 0;
  text-align: center;

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .footer-nav a {
    margin: 0 0.75rem;
    text-decoration: none;
    color: #ced4da;
    transition: color 0.2s ease-in-out;

    &:hover {
      color: #fff;
    }
  }
}

// Responsive adjustments
@media (max-width: 992px) {
  .hero-section .hero-title { font-size: 3rem; }
  .hero-section .hero-subtitle { font-size: 1.15rem; }
  .featured-domains-section .section-title { font-size: 2.2rem; }
  .cta-section h2 { font-size: 2rem; }
}

@media (max-width: 768px) {
  .landing-header .container {
    flex-direction: column;
    gap: 1rem;
  }
  .landing-header .landing-nav a { margin: 0 0.5rem; }
  .hero-section {
    padding: 4rem 0;
    .hero-title { font-size: 2.5rem; }
    .hero-subtitle { font-size: 1rem; }
    .hero-actions {
      flex-direction: column;
      .btn { width: 80%; margin: 0.5rem auto; }
    }
  }
  .featured-domains-section .domains-grid { grid-template-columns: 1fr; }
  .cta-section {
     h2 { font-size: 1.8rem; }
     p { font-size: 1rem; }
  }
  .landing-footer .container {
    gap: 1.5rem;
    .footer-nav { display: flex; flex-direction: column; gap: 0.5rem;}
  }
  
}
</style> 