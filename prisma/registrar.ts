import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('开始插入测试数据...')

  // 确保用户存在
  const user = await prisma.user.upsert({
    where: { email: 'admin@dms.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@dms.com',
      passwordHash: '$2b$10$YourHashedPasswordHere' // 这里应该是加密后的密码
    }
  })

  console.log('用户创建/更新完成:', user.email)

  // 插入注册商测试数据
  const registrarData = [
    {
      name: 'GoDaddy',
      websiteUrl: 'https://www.godaddy.com',
      loginUrl: 'https://sso.godaddy.com',
      accountId: 'godaddy_user_001',
      notes: '全球知名域名注册商，界面友好，价格适中',
      userId: user.id
    },
    {
      name: 'Namecheap',
      websiteUrl: 'https://www.namecheap.com',
      loginUrl: 'https://ap.www.namecheap.com/login',
      accountId: 'nc_user_888',
      notes: '价格便宜，提供免费隐私保护，客服响应及时',
      userId: user.id
    },
    {
      name: 'Cloudflare',
      websiteUrl: 'https://www.cloudflare.com',
      loginUrl: 'https://dash.cloudflare.com/login',
      accountId: 'cf_user_2024',
      notes: '按成本价出售域名，集成CDN和DNS服务',
      userId: user.id
    },
    {
      name: 'Name.com',
      websiteUrl: 'https://www.name.com',
      loginUrl: 'https://www.name.com/account/login',
      accountId: 'name_user_pro',
      notes: '老牌注册商，服务稳定，支持多种TLD',
      userId: user.id
    },
    {
      name: 'Porkbun',
      websiteUrl: 'https://porkbun.com',
      loginUrl: 'https://porkbun.com/account/login',
      accountId: 'pork_user_123',
      notes: '新兴注册商，价格透明，无隐藏费用',
      userId: user.id
    },
    {
      name: '阿里云',
      websiteUrl: 'https://wanwang.aliyun.com',
      loginUrl: 'https://account.aliyun.com/login',
      accountId: 'aliyun_account_cn',
      notes: '国内主流注册商，支持.cn域名，备案方便',
      userId: user.id
    },
    {
      name: '腾讯云',
      websiteUrl: 'https://dnspod.cloud.tencent.com',
      loginUrl: 'https://cloud.tencent.com/login',
      accountId: 'tencent_user_2024',
      notes: '腾讯旗下域名服务，集成云服务生态',
      userId: user.id
    },
    {
      name: 'Dynadot',
      websiteUrl: 'https://www.dynadot.com',
      loginUrl: 'https://www.dynadot.com/account/login.html',
      accountId: 'dyna_investor',
      notes: '支持域名拍卖和投资，API功能丰富',
      userId: user.id
    },
    {
      name: 'Google Domains',
      websiteUrl: 'https://domains.google',
      loginUrl: 'https://domains.google.com',
      accountId: 'google_domains_user',
      notes: 'Google域名服务（已停止新注册），简洁易用',
      userId: user.id
    },
    {
      name: 'NameSilo',
      websiteUrl: 'https://www.namesilo.com',
      loginUrl: 'https://www.namesilo.com/login',
      accountId: 'ns_premium_2024',
      notes: '价格实惠，免费隐私保护，批量管理功能强',
      userId: user.id
    }
  ]

  console.log('开始插入注册商数据...')

  for (const registrar of registrarData) {
    const createdRegistrar = await prisma.registrar.upsert({
      where: {
        userId_name: {
          userId: registrar.userId,
          name: registrar.name
        }
      },
      update: {
        websiteUrl: registrar.websiteUrl,
        loginUrl: registrar.loginUrl,
        accountId: registrar.accountId,
        notes: registrar.notes
      },
      create: registrar
    })
    
    console.log(`✅ 注册商创建/更新: ${createdRegistrar.name}`)
  }

  console.log('🎉 测试数据插入完成!')
}

main()
  .catch((e) => {
    console.error('❌ 插入测试数据失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 