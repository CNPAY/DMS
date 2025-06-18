import { PrismaClient } from '@prisma/client'
import { getCookie, setCookie } from 'h3'

// 使用 any 类型暂时绕过 TypeScript 错误
const prisma = new PrismaClient() as any

/**
 * 访问类型枚举
 */
export enum VisitType {
  DOMAIN = 'domain',       // 域名访问
  PORTFOLIO = 'portfolio', // 米表访问
  STATIC_PAGE = 'page',    // 静态页面访问
  SEARCH = 'search',       // 搜索行为
  EVENT = 'event'          // 事件跟踪
}

/**
 * 解析User-Agent字符串，提取设备类型、浏览器和操作系统信息
 * @param userAgent User-Agent字符串
 * @returns 设备类型、浏览器名称和操作系统名称
 */
export function parseUserAgent(userAgent: string) {
  // 默认值
  let deviceType = 'desktop'
  let browserName = 'unknown'
  let osName = 'unknown'
  
  // 如果没有User-Agent，直接返回默认值
  if (!userAgent) {
    return { deviceType, browserName, osName }
  }
  
  // 转换为小写以便于匹配
  const ua = userAgent.toLowerCase()
  
  // 检测设备类型
  if (/(android|webos|iphone|ipad|ipod|blackberry|windows phone)/i.test(ua)) {
    if (/(ipad|tablet|playbook|silk)|(android(?!.*mobile))/i.test(ua)) {
      deviceType = 'tablet'
    } else {
      deviceType = 'mobile'
    }
  }
  
  // 检测浏览器
  if (ua.includes('edge') || ua.includes('edg')) {
    browserName = 'edge'
  } else if (ua.includes('chrome')) {
    browserName = 'chrome'
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browserName = 'safari'
  } else if (ua.includes('firefox')) {
    browserName = 'firefox'
  } else if (ua.includes('msie') || ua.includes('trident')) {
    browserName = 'ie'
  } else if (ua.includes('opera') || ua.includes('opr')) {
    browserName = 'opera'
  }
  
  // 检测操作系统
  if (ua.includes('windows')) {
    osName = 'windows'
  } else if (ua.includes('macintosh') || ua.includes('mac os')) {
    osName = 'macos'
  } else if (ua.includes('android')) {
    osName = 'android'
  } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    osName = 'ios'
  } else if (ua.includes('linux')) {
    osName = 'linux'
  }
  
  return { deviceType, browserName, osName }
}

/**
 * 根据IP地址获取地理位置信息
 * 注意：此函数为示例，实际应用中可能需要使用第三方服务如MaxMind GeoIP或IP-API
 * @param ip IP地址
 * @returns 国家、地区和城市信息
 */
export async function getGeoLocation(ip: string) {
  // 默认返回值
  const defaultLocation = {
    country: null,
    region: null,
    city: null
  }
  
  // 如果是本地IP或保留IP，直接返回默认值
  if (ip === 'localhost' || ip === '127.0.0.1' || ip === '::1' || 
      ip.startsWith('192.168.') || ip.startsWith('10.') || 
      ip.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) {
    return defaultLocation
  }
  
  try {
    // 这里可以集成第三方地理位置API服务
    // 例如：const response = await fetch(`https://ipapi.co/${ip}/json/`)
    // 示例中返回默认值
    return defaultLocation
  } catch (error) {
    console.error('获取地理位置信息失败:', error)
    return defaultLocation
  }
}

/**
 * 记录访问跟踪
 * @param target 目标ID（域名ID、米表ID或事件标识符）
 * @param targetType 目标类型（domain, portfolio, event）
 * @param event 请求事件对象
 * @param eventData 事件相关数据（可选，JSON格式）
 */
export async function recordTrack(
  target: string, 
  targetType: string, 
  event?: any,
  eventData?: any
) {
  try {
    // 获取IP地址
    const ipAddress = getClientIp(event) || '127.0.0.1'
    
    // 获取User-Agent
    const userAgent = getRequestHeader(event, 'user-agent') || ''
    
    // 获取Referer
    const referer = getRequestHeader(event, 'referer') || ''
    
    // 获取或创建会话ID
    const sessionId = getSessionId(event)
    
    // 检查是否为独立访客 (根据IP和会话ID)
    const isUnique = await checkIsUniqueVisitor(target, targetType, ipAddress, sessionId)
    
    // 解析设备信息
    const { deviceType, browserName, osName } = parseUserAgent(userAgent)
    
    // 解析地理位置信息 (简化版，实际可能需要调用第三方服务)
    const { country, region, city } = await getGeoLocation(ipAddress)
    
    // 记录访问
    try {
      await prisma.track.create({
        data: {
          target,
          targetType,
          ipAddress,
          userAgent,
          referer,
          sessionId,
          isUnique,
          deviceType,
          browserName,
          osName,
          country,
          region,
          city,
          visitTime: new Date(),
          eventData: eventData ? JSON.stringify(eventData) : null
        }
      })
    } catch (error) {
      console.error('创建访问记录失败:', error)
    }
    
    return true
  } catch (error) {
    console.error('记录访问跟踪失败:', error)
    return false
  }
}

/**
 * 获取会话ID
 * 优先从Cookie中获取，如果没有则生成新的并设置Cookie
 */
function getSessionId(event: any): string {
  if (!event) return generateSessionId()
  
  try {
    // 尝试从event对象中获取cookie
    const cookieSessionId = getCookie(event, 'visitor_session_id')
    
    if (cookieSessionId) {
      return cookieSessionId
    }
    
    // 生成新的会话ID
    const sessionId = generateSessionId()
    
    // 设置cookie，30天过期
    setCookie(event, 'visitor_session_id', sessionId, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30天过期
      sameSite: 'lax',
      httpOnly: false // 允许客户端JavaScript访问
    })
    
    return sessionId
  } catch (error) {
    console.error('获取或设置会话ID失败:', error)
    return generateSessionId()
  }
}

/**
 * 解析请求中的Cookie - 不再需要，使用Nuxt的getCookie代替
 */
function parseCookies(req: any): Record<string, string> {
  const cookies: Record<string, string> = {}
  
  if (!req || !req.headers?.cookie) return cookies
  
  const cookieHeader = req.headers.cookie
  if (typeof cookieHeader === 'string') {
    cookieHeader.split(';').forEach(cookie => {
      const parts = cookie.split('=')
      const key = parts[0]?.trim()
      if (key) {
        cookies[key] = parts[1]?.trim() || ''
      }
    })
  }
  
  return cookies
}

/**
 * 记录域名访问 (兼容旧API)
 * @param domainId 域名ID
 * @param portfolioId 米表ID
 * @param event 请求事件对象
 * @param visitType 访问类型
 */
export async function recordDomainVisit(
  domainId?: number | null, 
  portfolioId?: number, 
  event?: any,
  visitType: VisitType = VisitType.DOMAIN
) {
  try {
    if (domainId) {
      // 记录域名访问
      return await recordTrack(domainId.toString(), 'domain', event);
    } else if (portfolioId) {
      // 记录米表访问
      return await recordTrack(portfolioId.toString(), 'portfolio', event);
    } else {
      throw new Error('必须提供domainId或portfolioId');
    }
  } catch (error) {
    console.error('记录域名访问失败:', error)
    return false
  }
}

/**
 * 获取客户端IP
 */
function getClientIp(event: any): string {
  if (!event) return ''
  
  try {
    // 从 event 对象获取请求头
    const xForwardedFor = getRequestHeader(event, 'x-forwarded-for')
    if (xForwardedFor) {
      const ips = xForwardedFor.split(',')
      return ips[0].trim()
    }
    
    return getRequestHeader(event, 'x-real-ip') || 
           getRequestHeader(event, 'cf-connecting-ip') || 
           event.node?.req?.connection?.remoteAddress || 
           event.node?.req?.socket?.remoteAddress || 
           ''
  } catch (error) {
    console.error('获取客户端IP失败:', error)
    return ''
  }
}

/**
 * 从 event 对象中获取请求头
 */
function getRequestHeader(event: any, headerName: string): string | undefined {
  if (!event) return undefined
  
  try {
    // 尝试使用 Nuxt 的 getRequestHeader 函数
    if (typeof event.node?.req?.headers === 'object') {
      return event.node.req.headers[headerName] as string
    }
    
    // 兼容直接传入 req 对象的情况
    if (typeof event?.headers === 'object') {
      return event.headers[headerName] as string
    }
    
    return undefined
  } catch (error) {
    console.error(`获取请求头 ${headerName} 失败:`, error)
    return undefined
  }
}

/**
 * 检查是否为独立访客
 * 通过IP地址和会话ID的组合来判断
 */
async function checkIsUniqueVisitor(
  target: string, 
  targetType: string, 
  ipAddress: string, 
  sessionId: string
): Promise<boolean> {
  try {
    // 获取今天的日期
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // 检查今天是否有相同IP+会话ID的访问记录
    const existingVisit = await prisma.track.findFirst({
      where: {
        target,
        targetType,
        AND: [
          { ipAddress },
          { sessionId }
        ],
        visitTime: {
          gte: today
        }
      }
    })
    
    return !existingVisit
  } catch (error) {
    console.error('检查独立访客失败:', error)
    return true
  }
}

/**
 * 生成会话ID
 */
function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
} 