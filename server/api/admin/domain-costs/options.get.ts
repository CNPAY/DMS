import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    // 获取用户的域名列表（用于选择域名）
    const domains = await prisma.domain.findMany({
      where: { userId: 1 },
      select: {
        id: true,
        domainName: true
      },
      orderBy: { domainName: 'asc' }
    })

    // 成本类型选项
    const costTypeOptions = [
      { value: 'purchase', label: '购买' },
      { value: 'renewal', label: '续费' },
      { value: 'transfer', label: '转移' },
      { value: 'protection', label: '隐私保护' },
      { value: 'other', label: '其他' }
    ]

    return ResponseData.success({
      domains,
      costTypeOptions
    }, '获取选项数据成功')
  } catch (error: any) {
    console.error('获取选项数据失败:', error)
    return ResponseData.error('获取选项数据失败', 500)
  }
}) 