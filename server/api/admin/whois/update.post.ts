import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

// 模拟Whois查询函数
async function queryWhois(domainName: string) {
  // 这里应该调用真实的Whois API
  // 目前模拟返回一些基本信息
  await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟网络延迟
  
  return {
    registrar: 'Example Registrar Inc.',
    creationDate: new Date('2020-01-01'),
    expiryDate: new Date('2025-01-01'),
    nameServers: ['ns1.example.com', 'ns2.example.com'],
    holderInfo: 'Domain Holder Information',
    status: 'active'
  }
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { domainId } = body
    
    // TODO: 从session或token中获取用户ID
    const userId = 1 // 临时硬编码，实际应该从认证中获取
    
    if (!domainId) {
      return ResponseData.error('域名ID不能为空', 400)
    }

    // 查找域名
    const domain = await prisma.domain.findFirst({
      where: {
        id: domainId,
        userId: userId
      }
    })

    if (!domain) {
      return ResponseData.error('域名不存在或无权限访问', 404)
    }

    try {
      // 查询Whois信息
      const whoisData = await queryWhois(domain.domainName)
      
      // 更新域名信息
      await prisma.domain.update({
        where: { id: domainId },
        data: {
          creationDate: whoisData.creationDate,
          expiryDate: whoisData.expiryDate,
          nameServers: whoisData.nameServers.join(', '),
          holderInfo: whoisData.holderInfo,
          updatedAt: new Date()
        }
      })

      return ResponseData.success(whoisData, `成功获取域名 ${domain.domainName} 的Whois信息`)

    } catch (whoisError: any) {
      console.error(`获取域名 ${domain.domainName} 的Whois信息失败:`, whoisError)
      return ResponseData.error(`获取域名 ${domain.domainName} 的Whois信息失败`)
    }

  } catch (error: any) {
    console.error('获取Whois信息失败:', error)
    return ResponseData.error('获取Whois信息失败: ' + (error?.message || '未知错误'))
  }
}) 