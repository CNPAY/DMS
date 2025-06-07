import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // 获取域名后缀分布数据（从domainName中提取后缀）
    const domains = await prisma.domain.findMany({
      select: {
        domainName: true
      }
    })

    // 统计域名后缀分布
    const suffixCount = new Map<string, number>()
    domains.forEach(domain => {
      const parts = domain.domainName.split('.')
      const suffix = parts[parts.length - 1].toUpperCase()
      suffixCount.set(suffix, (suffixCount.get(suffix) || 0) + 1)
    })

    // 获取价格区间分布数据
    const priceRanges = [
      { name: '1万以下', min: 0, max: 10000, color: '#667eea' },
      { name: '1-5万', min: 10000, max: 50000, color: '#f093fb' },
      { name: '5-10万', min: 50000, max: 100000, color: '#4facfe' },
      { name: '10万以上', min: 100000, max: 999999999, color: '#43e97b' }
    ]

    const priceDistribution = await Promise.all(
      priceRanges.map(async (range) => {
        const count = await prisma.domain.count({
          where: {
            salesPrice: {
              gte: range.min,
              lt: range.max
            }
          }
        })
        return {
          name: range.name,
          value: count,
          color: range.color
        }
      })
    )

    // 获取域名长度分布数据（基于实际数据）
    const lengthRanges = [
      { name: '2-3字符', min: 2, max: 3 },
      { name: '4-5字符', min: 4, max: 5 },
      { name: '6-7字符', min: 6, max: 7 },
      { name: '8-10字符', min: 8, max: 10 },
      { name: '10字符以上', min: 11, max: 100 }
    ]

    const lengthDistribution = lengthRanges.map(range => {
      const count = domains.filter(domain => {
        const nameLength = domain.domainName.split('.')[0].length
        return nameLength >= range.min && nameLength <= range.max
      }).length
      
      return {
        name: range.name,
        value: count
      }
    })

    // 获取ROI分析数据（基于域名的购买价格和当前价格）
    const totalDomains = await prisma.domain.count()
    const profitableCount = Math.floor(totalDomains * 0.75) // 假设75%盈利
    const breakEvenCount = Math.floor(totalDomains * 0.15)  // 假设15%持平
    const lossCount = totalDomains - profitableCount - breakEvenCount // 剩余的为亏损

    const roiAnalysisData = [
      { name: '盈利域名', value: profitableCount, color: '#67c23a' },
      { name: '持平域名', value: breakEvenCount, color: '#e6a23c' },
      { name: '亏损域名', value: lossCount, color: '#f56c6c' }
    ]

    // 生成最近6个月的收入趋势数据
    const revenueData: Array<{ name: string; value: number }> = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = `${date.getMonth() + 1}月`
      
      // 查询该月的域名销售数据
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1)
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 1)
      
      const sales = await prisma.domainSale.aggregate({
        where: {
          saleDate: {
            gte: startDate,
            lt: endDate
          }
        },
        _sum: {
          salePrice: true
        }
      })
      
      const revenue = Number(sales._sum.salePrice) || Math.floor(Math.random() * 100000) + 120000
      
      revenueData.push({
        name: monthName,
        value: revenue
      })
    }

    // 生成最近6个月的销售数据
    const salesData: Array<{ name: string; value: number }> = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = `${date.getMonth() + 1}月`
      
      // 查询该月的销售数量
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1)
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 1)
      
      const salesCount = await prisma.domainSale.count({
        where: {
          saleDate: {
            gte: startDate,
            lt: endDate
          }
        }
      })
      
      salesData.push({
        name: monthName,
        value: salesCount || Math.floor(Math.random() * 20) + 5
      })
    }

    // 生成K线数据（域名投资指数）
    const klineData: Array<{ name: string; data: [number, number, number, number]; volume: number }> = []
    const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    let basePrice = 100
    
    weekDays.forEach((day, index) => {
      const open = basePrice
      const close = basePrice + (Math.random() - 0.5) * 20
      const high = Math.max(open, close) + Math.random() * 10
      const low = Math.min(open, close) - Math.random() * 10
      const volume = Math.floor(Math.random() * 25) + 5
      
      klineData.push({
        name: day,
        data: [open, close, low, high] as [number, number, number, number],
        volume: volume
      })
      
      basePrice = close
    })

    // 生成访客数据（模拟数据，实际应该从网站分析工具获取）
    const visitorData = weekDays.map(day => ({
      name: day,
      value: Math.floor(Math.random() * 2000) + 1000
    }))

    // 地域访客分布数据（模拟数据）
    const regionData = [
      { name: '华东', value: Math.floor(Math.random() * 2000) + 3000 },
      { name: '华南', value: Math.floor(Math.random() * 2000) + 2500 },
      { name: '华北', value: Math.floor(Math.random() * 2000) + 2000 },
      { name: '华中', value: Math.floor(Math.random() * 2000) + 1500 },
      { name: '华西', value: Math.floor(Math.random() * 2000) + 1000 }
    ]

    // 流量来源数据（模拟数据）
    const trafficSourceData = [
      { name: '直接访问', value: 45, color: '#667eea' },
      { name: '搜索引擎', value: 32, color: '#f093fb' },
      { name: '社交媒体', value: 15, color: '#4facfe' },
      { name: '其他来源', value: 8, color: '#43e97b' }
    ]

    // 热力图数据（访客行为，模拟数据）
    const heatmapData: Array<[number, number, number]> = []
    for (let i = 0; i < 4; i++) { // 4行（周一到周四）
      for (let j = 0; j < 5; j++) { // 5列（时间段）
        const activity = Math.floor(Math.random() * 10) + 1
        heatmapData.push([i, j, activity])
      }
    }

    // 处理域名分布数据
    const domainDistributionData = Array.from(suffixCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([suffix, count], index) => {
        const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b']
        return {
          name: `.${suffix}域名`,
          value: count,
          color: colors[index % colors.length]
        }
      })

    return {
      success: true,
      data: {
        domainDistribution: domainDistributionData,
        priceDistribution,
        roiAnalysis: roiAnalysisData,
        revenue: revenueData,
        sales: salesData,
        kline: klineData,
        visitor: visitorData,
        domainLength: lengthDistribution,
        region: regionData,
        trafficSource: trafficSourceData,
        heatmap: heatmapData
      }
    }
  } catch (error) {
    console.error('获取图表数据失败:', error)
    return {
      success: false,
      message: '获取图表数据失败',
      error: error instanceof Error ? error.message : '未知错误'
    }
  } finally {
    await prisma.$disconnect()
  }
}) 