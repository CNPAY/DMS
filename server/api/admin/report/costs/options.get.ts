import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    // 暂时使用固定的用户ID 1 进行测试
    const userId = 1

    // 获取用户的域名列表
    const domains = await prisma.domain.findMany({
      where: { userId },
      select: {
        id: true,
        domainName: true
      },
      orderBy: {
        domainName: 'asc'
      }
    })

    // 成本类型选项
    const costTypes = [
      { value: 'purchase', label: '购买' },
      { value: 'renewal', label: '续费' },
      { value: 'transfer', label: '转移' },
      { value: 'privacy', label: '隐私保护' },
      { value: 'dns', label: 'DNS服务' },
      { value: 'ssl', label: 'SSL证书' },
      { value: 'other', label: '其他' }
    ]

    // 时间范围选项
    const timeRanges = [
      { value: 'all', label: '全部时间' },
      { value: 'year', label: '本年' },
      { value: 'quarter', label: '本季度' },
      { value: 'month', label: '本月' }
    ]

    return ResponseData.success({
      domains: domains.map(domain => ({
        value: domain.id,
        label: domain.domainName
      })),
      costTypes,
      timeRanges
    }, '获取选项数据成功')

  } catch (error) {
    console.error('获取选项数据失败:', error)
    return ResponseData.error('获取选项数据失败')
  }
}) 