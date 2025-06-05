import prisma from '../server/utils/db'

async function addSampleCosts() {
  try {
    // 获取用户的域名列表
    const domains = await prisma.domain.findMany({
      where: { userId: 1 },
      take: 5
    })

    if (domains.length === 0) {
      console.log('没有找到域名数据，请先添加域名')
      return
    }

    console.log(`找到 ${domains.length} 个域名，开始添加成本数据...`)

    const costTypes = ['purchase', 'renewal', 'transfer', 'privacy', 'dns', 'ssl']
    const sampleCosts = []

    for (const domain of domains) {
      // 为每个域名添加购买成本
      sampleCosts.push({
        domainId: domain.id,
        costDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        amount: Math.floor(Math.random() * 200) + 50, // 50-250
        costType: 'purchase',
        notes: `购买域名 ${domain.domainName} 的成本`
      })

      // 随机添加续费成本
      if (Math.random() > 0.5) {
        sampleCosts.push({
          domainId: domain.id,
          costDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          amount: Math.floor(Math.random() * 100) + 30, // 30-130
          costType: 'renewal',
          renewalYears: Math.floor(Math.random() * 3) + 1, // 1-3年
          notes: `续费域名 ${domain.domainName}`
        })
      }

      // 随机添加其他类型成本
      if (Math.random() > 0.7) {
        const randomType = costTypes[Math.floor(Math.random() * costTypes.length)]
        if (randomType !== 'purchase' && randomType !== 'renewal') {
          sampleCosts.push({
            domainId: domain.id,
            costDate: new Date(2024, Math.floor(Math.random() * 6) + 6, Math.floor(Math.random() * 28) + 1),
            amount: Math.floor(Math.random() * 50) + 10, // 10-60
            costType: randomType,
            notes: `${domain.domainName} 的 ${randomType} 服务费用`
          })
        }
      }
    }

    // 批量插入成本数据
    const createdCosts = await prisma.domainCost.createMany({
      data: sampleCosts
    })

    console.log(`成功添加 ${createdCosts.count} 条成本记录`)

    // 显示统计信息
    const stats = await prisma.domainCost.groupBy({
      by: ['costType'],
      _count: {
        id: true
      },
      _sum: {
        amount: true
      }
    })

    console.log('\n成本统计:')
    const typeNames: Record<string, string> = {
      'purchase': '购买',
      'renewal': '续费',
      'transfer': '转移',
      'privacy': '隐私保护',
      'dns': 'DNS服务',
      'ssl': 'SSL证书'
    }

    stats.forEach(stat => {
      console.log(`${typeNames[stat.costType] || stat.costType}: ${stat._count.id} 条记录, 总金额: ¥${stat._sum.amount}`)
    })

  } catch (error) {
    console.error('添加测试成本数据失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addSampleCosts() 