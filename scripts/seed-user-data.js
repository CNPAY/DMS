import prisma from '../server/utils/db'


async function main() {
  console.log('开始填充后台管理模块测试数据...')

  try {
    // 获取现有域名和用户数据
    const domains = await prisma.domain.findMany({
      where: { userId: 1 },
      select: { id: true, domainName: true, purchasePrice: true }
    })
    
    const registrars = await prisma.registrar.findMany({
      where: { userId: 1 },
      select: { id: true, name: true }
    })

    if (domains.length === 0) {
      console.log('❌ 请先运行 seed-test-data.js 生成域名数据')
      return
    }

    console.log(`📋 找到 ${domains.length} 个域名，${registrars.length} 个注册商`)

    // 1. 生成域名成本记录 (Domain Costs)
    console.log('\n📊 生成域名成本记录...')
    
    const costTypes = [
      { type: 'registration', name: '注册费用' },
      { type: 'renewal', name: '续费费用' },
      { type: 'transfer', name: '转移费用' },
      { type: 'privacy', name: '隐私保护' },
      { type: 'ssl', name: 'SSL证书' },
      { type: 'hosting', name: '托管费用' },
      { type: 'premium', name: '溢价费用' },
      { type: 'redemption', name: '赎回费用' },
      { type: 'auction', name: '拍卖费用' },
      { type: 'broker', name: '中介费用' }
    ]

    const costs = []
    
    // 为每个域名生成1-5条成本记录
    for (const domain of domains) {
      const costCount = Math.floor(Math.random() * 5) + 1
      
      for (let i = 0; i < costCount; i++) {
        const costType = costTypes[Math.floor(Math.random() * costTypes.length)]
        const registrar = registrars[Math.floor(Math.random() * registrars.length)]
        
        // 根据成本类型生成合理的金额
        let amount
        switch (costType.type) {
          case 'registration':
            amount = Math.floor(Math.random() * 500) + 50 // 50-550
            break
          case 'renewal':
            amount = Math.floor(Math.random() * 300) + 80 // 80-380
            break
          case 'transfer':
            amount = Math.floor(Math.random() * 200) + 100 // 100-300
            break
          case 'privacy':
            amount = Math.floor(Math.random() * 100) + 20 // 20-120
            break
          case 'ssl':
            amount = Math.floor(Math.random() * 500) + 100 // 100-600
            break
          case 'hosting':
            amount = Math.floor(Math.random() * 1000) + 200 // 200-1200
            break
          case 'premium':
            amount = Math.floor(Math.random() * 5000) + 1000 // 1000-6000
            break
          case 'redemption':
            amount = Math.floor(Math.random() * 1000) + 500 // 500-1500
            break
          case 'auction':
            amount = Math.floor(Math.random() * 10000) + 2000 // 2000-12000
            break
          case 'broker':
            amount = Math.floor(Math.random() * 3000) + 500 // 500-3500
            break
          default:
            amount = Math.floor(Math.random() * 500) + 100
        }

        // 生成过去2年内的随机日期
        const costDate = new Date()
        costDate.setDate(costDate.getDate() - Math.floor(Math.random() * 730))
        
        const notes = [
          `${costType.name} - ${domain.domainName}`,
          `通过${registrar.name}支付${costType.name}`,
          `${domain.domainName}的${costType.name}，有效期1年`,
          `${costType.name}已完成，收据编号：RC${Math.floor(Math.random() * 100000)}`,
          `${registrar.name}平台${costType.name}，自动续费已开启`,
          `${costType.name} - 包含增值服务`,
          `年度${costType.name}，享受折扣优惠`
        ]

        costs.push({
          domainId: domain.id,
          costType: costType.type,
          amount: amount,
          costDate: costDate,
          notes: notes[Math.floor(Math.random() * notes.length)]
        })
      }
    }

    // 批量创建成本记录
    for (const cost of costs) {
      try {
        await prisma.domainCost.create({ data: cost })
      } catch (error) {
        console.warn(`创建成本记录失败: ${error.message}`)
      }
    }
    console.log(`✅ 创建域名成本记录: ${costs.length} 条`)

    // 2. 生成域名销售记录 (Domain Sales)
    console.log('\n💰 生成域名销售记录...')
    
    const saleStatuses = [
      { status: 'pending', name: '待确认' },
      { status: 'completed', name: '已完成' },
      { status: 'cancelled', name: '已取消' },
      { status: 'refunded', name: '已退款' }
    ]

    const buyerCompanies = [
      '阿里巴巴集团', '腾讯科技', '百度公司', '字节跳动', '美团点评',
      '京东集团', '滴滴出行', '小米科技', '华为技术', '网易公司',
      '新浪微博', '搜狐公司', '360公司', '携程旅行', '拼多多',
      '蚂蚁金服', '快手科技', '哔哩哔哩', '爱奇艺', '优酷土豆',
      '苏宁易购', '唯品会', '途牛旅游', '同程艺龙', '去哪儿网',
      '贝壳找房', '链家地产', '瓜子二手车', '车好多', '汽车之家',
      '创新工场', '红杉资本', '经纬中国', '金沙江创投', 'IDG资本',
      '科技创业公司', '互联网金融', '电商平台', '游戏公司', '教育科技'
    ]

    const salesChannels = [
      'website', 'email', 'phone', 'broker', 'auction', 'referral', 'social_media'
    ]

    const sales = []
    
    // 随机选择30-50个域名进行销售
    const soldDomains = domains.slice().sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 21) + 30)
    
    for (const domain of soldDomains) {
      const saleStatus = saleStatuses[Math.floor(Math.random() * saleStatuses.length)]
      const buyerCompany = buyerCompanies[Math.floor(Math.random() * buyerCompanies.length)]
      const channel = salesChannels[Math.floor(Math.random() * salesChannels.length)]
      
      // 销售价格通常是购买价格的1.5-5倍
      const salePrice = Math.floor(domain.purchasePrice * (1.5 + Math.random() * 3.5))
      
      // 生成过去1年内的随机销售日期
      const saleDate = new Date()
      saleDate.setDate(saleDate.getDate() - Math.floor(Math.random() * 365))
      
      // 如果是已完成的销售，生成交割日期
      let transferDate = null
      if (saleStatus.status === 'completed') {
        transferDate = new Date(saleDate)
        transferDate.setDate(transferDate.getDate() + Math.floor(Math.random() * 14) + 1) // 1-14天后交割
      }

      const channelNames = {
        website: '官网询价',
        email: '邮件联系',
        phone: '电话咨询',
        broker: '中介推荐',
        auction: '拍卖成交',
        referral: '朋友介绍',
        social_media: '社交媒体'
      }

              sales.push({
        domainId: domain.id,
        buyerName: `${buyerCompany}采购部`,
        buyerEmail: `purchase@${buyerCompany.toLowerCase().replace(/[^a-z]/g, '')}.com`,
        buyerPhone: `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        buyerCompany: buyerCompany,
        salePrice: salePrice,
        saleCurrency: 'CNY',
        saleDate: saleDate,
        paymentStatus: saleStatus.status,
        transferStatus: saleStatus.status === 'completed' ? 'completed' : 'pending',
        notes: `通过${channelNames[channel]}成交，买方为${buyerCompany}，用于${['品牌官网', '产品推广', '业务拓展', '品牌保护', '投资收藏'][Math.floor(Math.random() * 5)]}`,
        platformFee: channel === 'broker' ? Math.floor(salePrice * 0.1) : null
      })
    }

    // 批量创建销售记录
    for (const sale of sales) {
      try {
        await prisma.domainSale.create({ data: sale })
      } catch (error) {
        console.warn(`创建销售记录失败: ${error.message}`)
      }
    }
    console.log(`✅ 创建域名销售记录: ${sales.length} 条`)

    // 3. 生成域名询价记录 (Domain Inquiries)
    console.log('\n📞 生成域名询价记录...')
    
    const inquiryStatuses = [
      { status: 'new', name: '新询价' },
      { status: 'contacted', name: '已联系' },
      { status: 'negotiating', name: '协商中' },
      { status: 'offer_made', name: '已报价' },
      { status: 'offer_accepted', name: '报价接受' },
      { status: 'offer_declined', name: '报价拒绝' },
      { status: 'closed_won', name: '成交' },
      { status: 'closed_lost', name: '流失' },
      { status: 'follow_up', name: '跟进中' }
    ]

    const inquirySources = ['website', 'email', 'phone', 'social_media', 'referral', 'advertisement']
    
    const inquirerTypes = [
      '初创公司', '中小企业', '大型企业', '个人投资者', '域名投资公司',
      '品牌代理商', '法律事务所', '咨询公司', '电商平台', '科技公司'
    ]

    const inquiries = []
    
    // 为随机50-80个域名生成询价记录
    const inquiredDomains = domains.slice().sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 31) + 50)
    
    for (const domain of inquiredDomains) {
      // 每个域名可能有1-3个询价记录
      const inquiryCount = Math.floor(Math.random() * 3) + 1
      
      for (let i = 0; i < inquiryCount; i++) {
        const status = inquiryStatuses[Math.floor(Math.random() * inquiryStatuses.length)]
        const source = inquirySources[Math.floor(Math.random() * inquirySources.length)]
        const inquirerType = inquirerTypes[Math.floor(Math.random() * inquirerTypes.length)]
        
        // 生成过去6个月内的随机询价日期
        const inquiryDate = new Date()
        inquiryDate.setDate(inquiryDate.getDate() - Math.floor(Math.random() * 180))
        
        // 生成询价金额（通常是购买价格的0.8-2倍）
        const inquiryPrice = Math.floor(domain.purchasePrice * (0.8 + Math.random() * 1.2))
        
        const sourceNames = {
          website: '官网表单',
          email: '邮件询价',
          phone: '电话咨询',
          social_media: '社交媒体',
          referral: '朋友推荐',
          advertisement: '广告点击'
        }

        const companies = [
          '北京科技有限公司', '上海创新企业', '深圳智能科技', '广州互联网公司', '杭州电商平台',
          '成都游戏工作室', '武汉教育科技', '西安软件公司', '南京金融科技', '重庆物流公司',
          '苏州制造企业', '宁波贸易公司', '青岛海洋科技', '大连软件园', '厦门旅游公司',
          '长沙媒体集团', '郑州地产公司', '济南汽车科技', '福州电子商务', '合肥新能源'
        ]

        const company = companies[Math.floor(Math.random() * companies.length)]
        const contactNames = ['张经理', '李总监', '王总', '陈主管', '刘部长', '赵经理', '孙总监', '周主任', '吴总', '郑经理']
        const contactName = contactNames[Math.floor(Math.random() * contactNames.length)]

        inquiries.push({
          domainId: domain.id,
          visitorName: contactName,
          visitorEmail: `${contactName.charAt(0).toLowerCase()}${Math.floor(Math.random() * 1000)}@${company.substring(0, 4).toLowerCase()}.com`,
          visitorPhone: `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
          offerPrice: inquiryPrice,
          status: status.status,
          message: `我们是${company}，对域名${domain.domainName}很感兴趣。这个域名非常适合我们的业务需求，希望能够了解具体的价格和交易流程。我们的预算大概在${inquiryPrice.toLocaleString()}元左右，请问是否可以商议？`,
          submittedAt: inquiryDate
        })
      }
    }

    // 批量创建询价记录
    for (const inquiry of inquiries) {
      try {
        await prisma.inquiry.create({ data: inquiry })
      } catch (error) {
        console.warn(`创建询价记录失败: ${error.message}`)
      }
    }
    console.log(`✅ 创建域名询价记录: ${inquiries.length} 条`)

    // 4. 生成报表数据汇总
    console.log('\n📈 生成数据汇总报告...')
    
    const totalCosts = costs.reduce((sum, cost) => sum + cost.amount, 0)
    const totalSales = sales.reduce((sum, sale) => sum + sale.salePrice, 0)
    const completedSales = sales.filter(sale => sale.paymentStatus === 'completed')
    const totalProfit = completedSales.reduce((sum, sale) => sum + sale.salePrice, 0) - totalCosts
    
    console.log('📊 数据统计汇总:')
    console.log(`   💸 总成本: ¥${totalCosts.toLocaleString()}`)
    console.log(`   💰 总销售额: ¥${totalSales.toLocaleString()}`)
    console.log(`   ✅ 已完成销售: ${completedSales.length}笔`)
    console.log(`   📈 估算利润: ¥${totalProfit.toLocaleString()}`)
    console.log(`   📞 询价记录: ${inquiries.length}条`)
    console.log(`   🔄 待跟进询价: ${inquiries.filter(i => i.status === 'follow_up' || i.status === 'negotiating').length}条`)

    console.log('\n🎉 后台管理模块测试数据填充完成！')
    console.log('\n🔗 可以访问后台管理页面查看数据:')
    console.log('   📊 成本管理: /admin/report/costs')
    console.log('   💰 销售管理: /admin/report/sales') 
    console.log('   📞 询价管理: /admin/inquiries')

  } catch (error) {
    console.error('❌ 填充数据失败:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ 脚本执行失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 