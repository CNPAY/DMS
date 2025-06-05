import prisma from '../server/utils/db'

async function addSampleSales() {
  try {
    console.log('开始添加销售记录测试数据...')

    // 首先查询一些域名ID用于关联
    const domains = await prisma.domain.findMany({
      where: { userId: 1 },
      take: 5,
      select: { id: true, domainName: true, purchasePrice: true }
    })

    if (domains.length === 0) {
      console.log('没有找到域名记录，请先添加一些域名')
      return
    }

    // 创建样本销售记录
    const sampleSales = [
      {
        domainId: domains[0].id,
        buyerName: '张三',
        buyerEmail: 'zhangsan@example.com',
        buyerPhone: '13800138001',
        buyerCompany: '科技有限公司',
        salePrice: 50000,
        saleCurrency: 'CNY',
        saleDate: new Date('2024-12-15'),
        paymentMethod: '银行转账',
        paymentStatus: 'paid',
        transferStatus: 'completed',
        platformFee: 2500,
        platformName: 'Domain Broker',
        notes: '客户对域名价值认可度高，交易顺利'
      },
      {
        domainId: domains[1]?.id,
        buyerName: '李四',
        buyerEmail: 'lisi@company.com',
        buyerPhone: '13900139001',
        salePrice: 25000,
        saleCurrency: 'CNY',
        saleDate: new Date('2024-12-10'),
        paymentMethod: '支付宝',
        paymentStatus: 'paid',
        transferStatus: 'pending',
        platformFee: 1250,
        platformName: 'Sedo',
        notes: '海外买家，域名已完成所有权转移'
      },
      {
        domainId: domains[2]?.id,
        buyerName: 'John Smith',
        buyerEmail: 'john@startup.io',
        salePrice: 8000,
        saleCurrency: 'USD',
        saleDate: new Date('2024-12-05'),
        paymentMethod: 'PayPal',
        paymentStatus: 'paid',
        transferStatus: 'completed',
        platformFee: 800,
        platformName: 'GoDaddy Auctions',
        notes: '英文域名，适合国际市场'
      }
    ].filter(sale => sale.domainId) // 过滤掉无效的域名ID

    // 批量创建销售记录
    for (const saleData of sampleSales) {
      const sale = await prisma.domainSale.create({
        data: saleData,
        include: {
          domain: {
            select: {
              domainName: true,
              purchasePrice: true
            }
          }
        }
      })

      console.log(`✅ 创建销售记录: ${sale.domain.domainName} - ¥${sale.salePrice}`)

      // 更新域名的销售状态
      await prisma.domain.update({
        where: { id: sale.domainId },
        data: { salesStatus: 3 } // 3 表示已售出
      })
    }

    console.log(`\n🎉 成功添加 ${sampleSales.length} 条销售记录测试数据`)

    // 显示统计信息
    const totalSales = await prisma.domainSale.count()
    const totalRevenue = await prisma.domainSale.aggregate({
      _sum: { salePrice: true }
    })

    console.log(`\n📊 当前统计:`)
    console.log(`- 总销售记录: ${totalSales}`)
    console.log(`- 总销售金额: ¥${totalRevenue._sum.salePrice}`)

  } catch (error) {
    console.error('添加测试数据失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 运行脚本
addSampleSales() 