// 米表相关静态常量配置

// 布局模板选项
export const LAYOUT_TEMPLATES = [
  { value: 'list', label: '列表布局' },
  { value: 'grid', label: '网格布局' },
  { value: 'table', label: '表格布局' },
  { value: 'card', label: '卡片布局' }
]

// 颜色主题选项
export const COLOR_THEMES = [
  // { value: 'moonlight', label: '🌙 月光白', description: '简约纯净风格' },
  { value: 'ocean', label: '🌊 海洋蓝', description: '清新专业风格' ,primary: '#2196f3',secondary: '#4caf50',tertiary: '#e3f2fd'},
  { value: 'forest', label: '🌿 森林绿', description: '自然生机风格',primary: '#4caf50',secondary: '#8bc34a',tertiary: '#e8f5e8'},
  { value: 'sunset', label: '🌅 暖阳橙', description: '温暖活力风格' ,primary: '#ff9800',secondary: '#ffc107',tertiary: '#fff3e0'},
  { value: 'rose', label: '🌹 玫瑰红', description: '优雅浪漫风格' ,primary: '#e91e63',secondary: '#9c27b0',tertiary: '#fce4ec'},
  { value: 'lavender', label: '💜 薰衣草', description: '梦幻柔美风格' ,primary: '#673ab7',secondary: '#9c27b0',tertiary: '#f3e5f5'},
  { value: 'midnight', label: '🌃 暗夜黑', description: '深沉神秘风格' ,primary: '#424242',secondary: '#212121',tertiary: '#e8eaf6'},
  { value: 'sakura', label: '🌸 樱花粉', description: '清雅甜美风格' ,primary: '#f06292',secondary: '#f48fb1',tertiary: '#fce4ec'},
  { value: 'emerald', label: '💎 翡翠绿', description: '典雅高贵风格' ,primary: '#00796b',secondary: '#00695c',tertiary: '#e0f2f1'},
  { value: 'amber', label: '✨ 琥珀金', description: '奢华品质风格' ,primary: '#ff8f00',secondary: '#ffd54f',tertiary: '#fff8e1'}
]

// 域名状态选项
export const SALES_STATUS_OPTIONS = [
  { value: 1, label: '未上架' },
  { value: 2, label: '已上架' },
  { value: 3, label: '已售出' },
  { value: 4, label: '暂停销售' }
]

// 文字主题选项
export const TEXT_THEME_OPTIONS = [
  { value: 'auto', label: '自动适应' },
  { value: 'light', label: '浅色文字' },
  { value: 'dark', label: '深色文字' }
]

// Twitter卡片类型选项
export const TWITTER_CARD_OPTIONS = [
  { value: 'summary', label: '摘要' },
  { value: 'summary_large_image', label: '大图摘要' }
]

// 获取布局模板标签的工具函数
export function getTemplateLabel(template) {
  const templateMap = {
    list: '列表',
    grid: '网格', 
    table: '表格',
    card: '卡片'
  }
  return templateMap[template] || template
}

// 获取布局模板标签类型的工具函数
export function getTemplateTagType(template) {
  const typeMap = {
    list: '',
    grid: 'success',
    table: 'info',
    card: 'warning'
  }
  return typeMap[template] || ''
}

// 获取主题标签的工具函数
export function getThemeLabel(themeValue) {
  const theme = COLOR_THEMES.find(t => t.value === themeValue)
  return theme ? theme.label : '🌙 月光白'
}

 