// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  
  // 基础模块
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/i18n'
    // 暂时移除Element Plus的自动导入，避免SCSS冲突
    // ...(process.env.NODE_ENV === 'development' ? ['@element-plus/nuxt'] : [])
  ],

  // Element Plus 配置 - 暂时禁用自动导入
  // elementPlus: {
  //   importStyle: 'css',
  //   themes: ['dark']
  // },

  // CSS
  css: [
    // 移除全局样式，改为在对应的布局中按需导入
    // '~/assets/styles/index.scss'
  ],


  // Runtime config
  runtimeConfig: {
    // Private keys (only available on server-side)
    jwtSecret: process.env.JWT_SECRET || 'dms-super-secret-jwt-key-2024',
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    
    // Public keys (exposed to client-side)
    public: {
      appName: 'DMS',
      apiBase: '/api'
    }
  },

  // 路由规则 - 性能优化
  routeRules: {
    // 公开门户路由 - SSR/SSG 优化
    '/': { prerender: true },
    '/portfolio/**': { ssr: true },
    '/domain/**': { ssr: true },
    '/contact': { prerender: true },
    '/about': { prerender: true },
    
    // 管理后台路由 - SPA 模式
    '/admin/**': { ssr: false },
    
    // API 路由
    '/api/**': { cors: true }
  },

  // Nitro configuration
  nitro: {
    experimental: {
      wasm: true
    },
  },

  // TypeScript configuration
  typescript: {
    typeCheck: false
  },

  // App configuration
  app: {
    head: {
      title: '域名展示 - 精品域名投资',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '精品域名展示平台，提供优质域名投资机会和专业域名服务' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  // i18n configuration
  i18n: {
    locales: [
      {
        code: 'en',
        file: 'en.json',
        name: 'English'
      },
      {
        code: 'zh',
        file: 'zh.json',
        name: '中文'
      }
    ],
    restructureDir: false,
    lazy: false,
    langDir: 'locales',
    defaultLocale: 'en',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
    },
    vueI18n: './i18n.config.ts'
  },

  // Vite configuration
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // 移除全局变量导入，避免与Element Plus的@use规则冲突
          // additionalData: `@import "~/assets/styles/mixin.scss";`
        }
      }
    }
  },

  // 构建配置
  build: {
    transpile: []
  }
})