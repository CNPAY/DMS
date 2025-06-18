import { ResponseData } from '~/server/utils/response'
import prisma from '~/server/utils/db'
import { recordDomainVisit, VisitType } from '~/server/utils/visitor'

export default defineEventHandler(async (event) => {
  const { domain } = getQuery(event)
  if (!domain) return ResponseData.error('缺少 domain 参数', 400)
  // 查询数据库（此处假设有 Domain 表和相关字段）
  const info = await prisma.domain.findFirst({
    where: { domainName: String(domain) },
    select: {
      id: true,
      domainName: true,
      domainDescription: true,
      salesPrice: true,  // 销售价格
      landingPageContent: true,  // 着陆页内容
      landingPageType: true,     // 着陆页类型
      clickBehavior: true,       // 点击行为
      externalUrl: true,         // 外部链接URL
      seoTitle: true,
      seoKeywords: true,
      seoDescription: true
    }
  })
  if (!info) return ResponseData.error('未找到该域名', 404)
  
  
  // 格式化数据以保持一致性
  const formattedInfo = {
    id: info.id,
    domainName: info.domainName,
    domainDescription: info.domainDescription,
    price: info.salesPrice,
    content: info.landingPageContent,
    landingPageType: info.landingPageType,
    clickBehavior: info.clickBehavior,
    externalUrl: info.externalUrl,
    seoTitle: info.seoTitle,
    seoKeywords: info.seoKeywords,
    seoDescription: info.seoDescription
  }
  
  return ResponseData.success(formattedInfo)
}) 