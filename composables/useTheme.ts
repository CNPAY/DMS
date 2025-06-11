import { ref, onMounted, watch } from 'vue'

export type ThemeType = 'ocean' | 'forest' | 'sunset' | 'rose' | 'lavender' | 'midnight' | 'sakura' | 'emerald' | 'amber'

// 主题名称映射
export const themeNames = {
  ocean: '海洋蓝 - 清新专业风格',
  forest: '森林绿 - 自然生机风格',
  sunset: '暖阳橙 - 温暖活力风格',
  rose: '玫瑰红 - 优雅浪漫风格',
  lavender: '薰衣草 - 梦幻柔美风格',
  midnight: '暗夜黑 - 深沉神秘风格',
  sakura: '樱花粉 - 清雅甜美风格',
  emerald: '翡翠绿 - 典雅高贵风格',
  amber: '琥珀金 - 奢华品质风格'
} as const

export const useTheme = () => {
  const theme = ref<ThemeType>('lavender')
  
  // 从本地存储获取主题
  const getStoredTheme = (): ThemeType => {
    if (process.client) {
      return (localStorage.getItem('portal-theme') as ThemeType) || 'lavender'
    }
    return 'lavender'
  }
  
  // 设置主题
  const setTheme = (newTheme: ThemeType) => {
    theme.value = newTheme
    if (process.client) {
      localStorage.setItem('portal-theme', newTheme)
      const portalThemeElement = document.querySelector('.portal-theme')
      if (portalThemeElement) {
        portalThemeElement.setAttribute('data-theme', newTheme)
      }
    }
  }
  
  // 从 portfolio 配置中获取主题
  const initThemeFromPortfolio = async () => {
    try {
      const portfolio = await portfolioStore.getPortfolio()
      if (portfolio?.theme) {
        setTheme(portfolio.theme as ThemeType)
      } else {
        setTheme(getStoredTheme())
      }
    } catch (error) {
      console.error('Failed to init theme from portfolio:', error)
      setTheme(getStoredTheme())
    }
  }
  
  // 监听主题变化
  watch(theme, (newTheme) => {
    if (process.client) {
      document.documentElement.setAttribute('data-theme', newTheme)
    }
  })
  
  // // 初始化主题
  // onMounted(() => {
  //   initThemeFromPortfolio()
  // })
  
  return {
    theme,
    themeNames,
    setTheme
  }
} 