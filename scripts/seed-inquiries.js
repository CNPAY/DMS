import { PrismaClient } from '@prisma/client'
import { dbConfig } from '~/config'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbConfig.mysql.url
    }
  }
})

// 随机访客信息
const visitorNames = [
  'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson',
  'Lisa Anderson', 'James Martinez', 'Jennifer Garcia', 'Robert Lopez', 'Mary Rodriguez',
  'William Hernandez', 'Elizabeth Moore', 'Christopher Martin', 'Jessica Jackson', 'Daniel Thompson',
  '张伟', '李娜', '王强', '刘敏', '陈静',
  '杨洋', '赵丽', '黄磊', '周婷', '吴斌'
]

const emailDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', '163.com', 'qq.com', 'sina.com']

const phoneNumbers = [
  '+1-555-0123', '+1-555-0124', '+1-555-0125', '+1-555-0126', '+1-555-0127',
  '+86-138-0013-8000', '+86-139-0013-9000', '+86-186-0018-6000', '+86-188-0018-8000',
  '+44-20-7123-4567', '+33-1-42-86-83-26', '+49-30-12345678'
]

const inquiryMessages = [
  'I am interested in purchasing this domain. Could you please provide more information about the price?',
  'Hello, I would like to make an offer for this domain. My budget is flexible.',
  'This domain would be perfect for my new business. Can we discuss the terms?',
  'I represent a company that is very interested in acquiring this domain. Please contact me.',
  'Hi, I saw your domain listing and would like to know if you are open to negotiations.',
  '您好，我对这个域名很感兴趣，希望能够了解更多信息。',
  '我想为我的公司购买这个域名，请问价格如何？',
  '这个域名非常符合我们的品牌需求，希望能够商谈购买事宜。',
  'Would you consider a payment plan for this domain?',
  'I have been looking for this exact domain for months. Please let me know your best price.',
  'My client is ready to make a serious offer for this domain.',
  'Can you provide more details about the domain history and traffic?',
  '我们是一家互联网公司，对贵方的域名很感兴趣，希望能够洽谈合作。',
  'This domain would complete our brand portfolio. Looking forward to your response.',
  'I am willing to pay a premium for the right domain. Is this available?'
]

const statuses = ['new', 'contacted', 'negotiating', 'accepted', 'rejected', 'closed']

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
]

const ipAddresses = [
  '192.168.1.100', '10.0.0.50', '172.16.0.25', '203.208.60.1', '8.8.8.8',
  '114.114.114.114', '223.5.5.5', '180.76.76.76', '1.1.1.1', '208.67.222.222'
]

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function generateRandomEmail(name) {
  const cleanName = name.replace(/[^a-zA-Z]/g, '').toLowerCase()
  const domain = getRandomElement(emailDomains)
  const number = Math.floor(Math.random() * 999)
  return `${cleanName}${number}@${domain}`
}

function generateRandomPrice() {
  const prices = [500, 1000, 1500, 2000, 2500, 3000, 5000, 8000, 10000, 15000, 20000, 25000, 50000]
  return Math.random() < 0.7 ? getRandomElement(prices) : null // 30% 概率没有报价
}

function getRandomDate() {
  const now = new Date()
  const pastDate = new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000) // 过去90天内
  return pastDate
}

async function seedInquiries() {
  try {
    console.log('🌱 开始生成询盘随机数据...')

    // 获取现有的域名和米表数据
    const domains = await prisma.domain.findMany({
      select: { id: true, domainName: true }
    })
    
    const portfolios = await prisma.portfolio.findMany({
      select: { id: true, name: true }
    })

    if (domains.length === 0) {
      console.log('❌ 没有找到域名数据，请先添加一些域名数据')
      return
    }

    console.log(`📊 找到 ${domains.length} 个域名，${portfolios.length} 个米表`)

    // 清除现有询盘数据
    await prisma.inquiry.deleteMany({})
    console.log('🗑️  已清除现有询盘数据')

    const inquiries = []

    // 生成 50 条询盘记录
    for (let i = 0; i < 50; i++) {
      const visitorName = getRandomElement(visitorNames)
      const usePortfolio = portfolios.length > 0 && Math.random() < 0.3 // 30% 概率关联米表

      const inquiry = {
        domainId: usePortfolio ? null : getRandomElement(domains).id,
        portfolioId: usePortfolio ? getRandomElement(portfolios).id : null,
        visitorName: Math.random() < 0.9 ? visitorName : null, // 10% 概率没有姓名
        visitorEmail: generateRandomEmail(visitorName),
        visitorPhone: Math.random() < 0.6 ? getRandomElement(phoneNumbers) : null, // 60% 概率有电话
        offerPrice: generateRandomPrice(),
        message: getRandomElement(inquiryMessages),
        status: getRandomElement(statuses),
        ipAddress: getRandomElement(ipAddresses),
        userAgent: getRandomElement(userAgents),
        submittedAt: getRandomDate()
      }

      inquiries.push(inquiry)
    }

    // 批量插入数据
    await prisma.inquiry.createMany({
      data: inquiries
    })

    console.log(`✅ 成功生成 ${inquiries.length} 条询盘记录`)

    // 统计各状态数量
    const statusCounts = await prisma.inquiry.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })

    console.log('📈 询盘状态分布：')
    statusCounts.forEach(item => {
      console.log(`   ${item.status}: ${item._count.status} 条`)
    })

    // 统计有报价的询盘数量
    const withOfferCount = await prisma.inquiry.count({
      where: {
        offerPrice: {
          not: null
        }
      }
    })

    console.log(`💰 有报价询盘: ${withOfferCount} 条`)

  } catch (error) {
    console.error('❌ 生成询盘数据失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedInquiries() 