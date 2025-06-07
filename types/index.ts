// 域名状态枚举
export enum DomainStatus {
  NORMAL = 1,           // 正常
  EXPIRING_SOON = 2,    // 即将到期
  EXPIRED = 3,          // 已过期
  TRANSFERRING = 4,     // 转移中
  SUSPENDED = 5,        // 暂停
  REDEMPTION = 6        // 赎回期
}

// 销售状态枚举
export enum SalesStatus {
  NOT_FOR_SALE = 1,     // 不出售
  FOR_SALE = 2,         // 待售
  SOLD = 3,             // 已售
  NEGOTIATING = 4,      // 洽谈中
  RESERVED = 5          // 保留
}

// 成本类型枚举
export enum CostType {
  INITIAL = 'initial',       // 初始购买
  RENEWAL = 'renewal',       // 续费
  TRANSFER = 'transfer',     // 转移
  REDEMPTION = 'redemption', // 赎回
  OTHER = 'other'           // 其他
}

// 着陆页类型枚举
export enum LandingPageType {
  INQUIRY = 'inquiry',   // 询价页
  CONTENT = 'content',   // 内容页
  PRICED = 'priced'      // 标价页
}

// 线索状态枚举
export enum InquiryStatus {
  NEW = 'new',          // 新线索
  READ = 'read',        // 已读
  REPLIED = 'replied',  // 已回复
  DEAL = 'deal',        // 成交
  IGNORED = 'ignored'   // 已忽略
}

// 用户接口
export interface User {
  id: number
  username: string
  email: string
  createdAt: Date
  updatedAt: Date
}

// 域名接口
export interface Domain {
  id: number
  userId: number
  domainName: string
  registrarId?: number
  creationDate?: Date
  expiryDate?: Date
  nameServers?: string
  purchasePrice?: number
  holderInfo?: string
  notes?: string
  domainStatus?: DomainStatus
  salesStatus?: SalesStatus
  categoryId?: number
  landingPageType?: LandingPageType
  landingPageContent?: string
  salesPrice?: number
  createdAt: Date
  updatedAt: Date
  
  // 关联数据
  registrar?: Registrar
  category?: DomainCategory
  tags?: DomainTag[]
  costs?: DomainCost[]
}

// 域名分类接口
export interface DomainCategory {
  id: number
  userId: number
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

// 域名标签接口
export interface DomainTag {
  id: number
  userId: number
  name: string
  createdAt: Date
  updatedAt: Date
}

// 域名成本接口
export interface DomainCost {
  id: number
  domainId: number
  costDate: Date
  amount: number
  costType: CostType
  renewalYears?: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// 注册商接口
export interface Registrar {
  id: number
  userId: number
  name: string
  websiteUrl?: string
  loginUrl?: string
  accountId?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// 米表接口
export interface Portfolio {
  id: number
  userId: number
  name: string
  slug: string
  isDefault: boolean
  layoutTemplate: string
  colorTheme?: string
  headerInfo?: string
  footerInfo?: string
  showPrice: boolean
  showDescription: boolean
  showTags: boolean
  createdAt: Date
  updatedAt: Date
  
  // 关联域名
  domains?: Domain[]
}

// 线索接口
export interface Inquiry {
  id: number
  domainId?: number
  portfolioId?: number
  visitorName?: string
  visitorEmail: string
  visitorPhone?: string
  offerPrice?: number
  message: string
  status: InquiryStatus
  ipAddress?: string
  userAgent?: string
  submittedAt: Date
  
  // 关联数据
  domain?: Domain
  portfolio?: Portfolio
}

// 关注域名接口
export interface WatchedDomain {
  id: number
  userId: number
  domainName: string
  lastWhoisCheck?: Date
  currentWhoisSummary?: string
  monitoringLevel?: string
  notes?: string
  notifyOnChange: boolean
  createdAt: Date
  updatedAt: Date
}

// AI 提示词接口
export interface AiPrompt {
  id: number
  userId: number
  sceneCode: string
  sceneName: string
  systemPromptDefault: string
  userPromptCustom?: string
  isActiveCustom: boolean
  modelPreference?: string
  createdAt: Date
  updatedAt: Date
}

// 系统设置接口
export interface SystemSetting {
  settingKey: string
  settingValue: string
  userId?: number
}

// API 响应接口
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// 分页接口
export interface PaginationOptions {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// WHOIS 查询响应接口
export interface WhoisResponse {
  code: string
  message: string
  data: {
    url: string
    result: string
    status: number
    formatted: {
      domain: string
      registrar: string
      creation_date: string
      expiration_date: string
      registrant: string
      admin: string
      tech: string
      nameservers: string[]
    }
    tld: string
    tags: string[]
    statusTags: string[]
    timezone: string
  }
}

// 域名价格查询响应接口
export interface DomainPriceResponse {
  code: string
  message: string
  data: {
    premium: string
    register: number
    renew: number
    register_usd: number
    renew_usd: number
    cached: boolean
  }
} 