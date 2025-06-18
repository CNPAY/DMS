/**
 * 访问统计组合式函数
 * @returns 返回记录访问的函数
 */
export function useTrack() {
  /**
   * 记录页面访问
   * @param target 目标ID（域名ID、米表ID等）
   * @param targetType 目标类型（domain, portfolio, page, search, event）
   * @param eventData 事件相关数据（可选）
   * @param delay 延迟执行时间（毫秒），默认500ms
   */
  const trackVisit = (
    target: string, 
    targetType: string, 
    eventData: Record<string, any> = {}, 
    delay: number = 500
  ) => {
    // 如果不在客户端环境，不执行统计
    if (process.server) return
    
    // 延迟执行，避免影响页面加载速度
    setTimeout(async () => {
      try {
        await $fetch('/api/portal/track', {
          method: 'POST',
          body: {
            target,
            targetType,
            eventData
          }
        })
        console.log(`访问记录成功: ${targetType} - ${target}`)
      } catch (error) {
        console.error('访问记录失败:', error)
      }
    }, delay)
  }
  
  /**
   * 记录域名访问
   * @param domainId 域名ID
   * @param eventData 事件相关数据（可选）
   */
  const trackDomain = (domainId: string | number, eventData: Record<string, any> = {}) => {
    trackVisit(domainId.toString(), 'domain', eventData)
  }
  
  /**
   * 记录米表访问
   * @param portfolioId 米表ID
   * @param eventData 事件相关数据（可选）
   */
  const trackPortfolio = (portfolioId: string | number, eventData: Record<string, any> = {}) => {
    trackVisit(portfolioId.toString(), 'portfolio', eventData)
  }
  
  /**
   * 记录页面访问
   * @param pageId 页面ID或路径
   * @param eventData 事件相关数据（可选）
   */
  const trackPage = (pageId: string, eventData: Record<string, any> = {}) => {
    trackVisit(pageId, 'page', eventData)
  }
  
  /**
   * 记录搜索事件
   * @param keyword 搜索关键词
   * @param eventData 事件相关数据（可选）
   */
  const trackSearch = (keyword: string, eventData: Record<string, any> = {}) => {
    trackVisit(keyword, 'search', { keyword, ...eventData })
  }
  
  /**
   * 记录自定义事件
   * @param eventName 事件名称
   * @param eventData 事件相关数据（可选）
   */
  const trackEvent = (eventName: string, eventData: Record<string, any> = {}) => {
    trackVisit(eventName, 'event', eventData)
  }
  
  return {
    trackVisit,
    trackDomain,
    trackPortfolio,
    trackPage,
    trackSearch,
    trackEvent
  }
} 