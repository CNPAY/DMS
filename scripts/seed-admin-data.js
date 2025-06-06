import prisma from '../server/utils/db'


async function main() {
  console.log('开始填充丰富测试数据...')

  try {
    // 1. 创建用户
    const user = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@dms.com',
        passwordHash: 'hashedpassword'
      }
    })
    console.log('✅ 创建用户:', user.username)

    // 2. 创建注册商
    const registrars = [
      { name: 'GoDaddy', websiteUrl: 'https://godaddy.com' },
      { name: 'Namecheap', websiteUrl: 'https://namecheap.com' },
      { name: 'Cloudflare', websiteUrl: 'https://cloudflare.com' },
      { name: '阿里云', websiteUrl: 'https://www.aliyun.com' },
      { name: '腾讯云', websiteUrl: 'https://cloud.tencent.com' },
      { name: 'Name.com', websiteUrl: 'https://name.com' },
      { name: 'Dynadot', websiteUrl: 'https://dynadot.com' },
      { name: 'Porkbun', websiteUrl: 'https://porkbun.com' }
    ]

    for (const registrarData of registrars) {
      await prisma.registrar.create({
        data: { userId: 1, ...registrarData }
      })
    }
    console.log('✅ 创建注册商:', registrars.length, '个')

    // 3. 创建分类
    const categories = [
      { name: '科技互联网', description: 'AI、云计算、大数据、物联网等科技领域' },
      { name: '金融投资', description: '区块链、支付、投资、银行等金融领域' },
      { name: '电子商务', description: '电商平台、购物、零售、跨境贸易' },
      { name: '教育培训', description: '在线教育、培训机构、知识付费' },
      { name: '医疗健康', description: '医疗服务、健康管理、制药行业' },
      { name: '旅游出行', description: '旅游服务、酒店预订、交通出行' },
      { name: '游戏娱乐', description: '网络游戏、影视娱乐、直播平台' },
      { name: '房产家居', description: '房地产、家装、智能家居' },
      { name: '汽车交通', description: '汽车销售、新能源车、智能驾驶' },
      { name: '餐饮美食', description: '餐厅、外卖、生鲜配送' },
      { name: '时尚美妆', description: '服装、化妆品、奢侈品' },
      { name: '新闻媒体', description: '新闻资讯、自媒体、社交平台' },
      { name: '短域名', description: '3-4位字符的精品短域名' },
      { name: '数字域名', description: '纯数字或数字组合域名' },
      { name: '拼音域名', description: '中文拼音域名' },
      { name: '英文域名', description: '英文单词或组合域名' },
      { name: '品牌域名', description: '知名品牌、商标相关域名' },
      { name: '地理域名', description: '城市、地区名称域名' },
      { name: '行业域名', description: '特定行业关键词域名' },
      { name: '创意域名', description: '富有创意和想象力的域名' }
    ]

    for (const categoryData of categories) {
      await prisma.domainCategory.create({
        data: { userId: 1, ...categoryData }
      })
    }
    console.log('✅ 创建分类:', categories.length, '个')

    // 4. 创建标签
    const tags = [
      // 科技类
      'AI', '人工智能', '机器学习', '深度学习', '区块链', '比特币', '以太坊', 'NFT',
      '云计算', '边缘计算', '大数据', '数据分析', '物联网', 'IoT', '5G', '6G',
      '虚拟现实', 'VR', '增强现实', 'AR', '元宇宙', 'Web3', '智能合约',
      
      // 商业类
      '电商', '跨境电商', '直播电商', '社交电商', '支付', '移动支付', '数字货币',
      '投资理财', '理财', '保险', '银行', '借贷', 'P2P', '众筹', 'ICO',
      
      // 行业类
      '教育', '在线教育', 'K12', '职业培训', '技能培训', '知识付费', 'MOOC',
      '医疗', '互联网医疗', '远程医疗', '医美', '制药', '生物技术', '基因',
      '旅游', '在线旅游', 'OTA', '民宿', '酒店', '机票', '签证', '景点',
      
      // 生活类
      '美食', '餐饮', '外卖', '生鲜', '社区团购', '新零售', 'O2O',
      '时尚', '美妆', '护肤', '服装', '奢侈品', '珠宝', '手表',
      '汽车', '新能源汽车', '电动车', '自动驾驶', '共享出行', '网约车',
      '房产', '租房', '买房', '装修', '家居', '智能家居', '建材',
      
      // 娱乐类
      '游戏', '手游', '电竞', '直播', '短视频', '音乐', '影视', '动漫',
      '体育', '健身', '瑜伽', '运动', '户外', '极限运动',
      
      // 技术类
      '开发', '编程', '前端', '后端', '移动开发', 'APP', '小程序',
      '数据库', '服务器', '网络安全', '网络', '域名', '主机', 'CDN',
      
      // 营销类
      '营销', '广告', 'SEM', 'SEO', '社交媒体', '内容营销', '品牌',
      '客服', 'CRM', 'ERP', 'SaaS', 'B2B', 'B2C', 'C2C',
      
      // 地域类
      '北京', '上海', '深圳', '广州', '杭州', '成都', '武汉', '西安',
      '中国', '美国', '欧洲', '亚洲', '全球', '国际', '跨境',
      
      // 其他
      '创新', '创业', '投资', '融资', '上市', 'IPO', '独角兽',
      '环保', '绿色', '可持续', '新能源', '节能', '减排',
      '高端', '精品', '奢华', '定制', '专业', '权威', '官方'
    ]

    // 去重标签
    const uniqueTags = [...new Set(tags)]
    
    for (const tagName of uniqueTags) {
      await prisma.domainTag.create({
        data: { userId: 1, name: tagName }
      })
    }
    console.log('✅ 创建标签:', uniqueTags.length, '个')

    // 5. 创建静态页面
    const staticPages = [
      {
        title: '关于我们',
        slug: 'about',
        content: `<div style="max-width: 800px; margin: 0 auto; padding: 20px;">
          <h1>关于我们</h1>
          <p>我们是一家专业的域名投资公司，成立于2015年，专注于优质域名的发现、投资和交易。</p>
          <h2>我们的使命</h2>
          <p>帮助企业和个人找到最适合的域名，为数字化转型提供强有力的支持。</p>
          <h2>核心优势</h2>
          <ul>
            <li>丰富的域名投资经验</li>
            <li>专业的市场分析能力</li>
            <li>完善的交易保障体系</li>
            <li>优质的售后服务</li>
          </ul>
        </div>`,
        linkType: 'internal',
        metaTitle: '关于我们 - 专业域名投资服务',
        metaDescription: '了解我们的域名投资理念、服务优势和发展历程'
      },
      {
        title: '联系我们',
        slug: 'contact',
        content: `<div style="max-width: 800px; margin: 0 auto; padding: 20px;">
          <h1>联系我们</h1>
          <p>欢迎咨询域名投资相关业务，我们将为您提供专业的服务。</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>联系方式</h3>
            <p><strong>邮箱:</strong> domains@example.com</p>
            <p><strong>电话:</strong> 400-888-9999</p>
            <p><strong>微信:</strong> domain_invest_2024</p>
            <p><strong>QQ:</strong> 123456789</p>
          </div>
          <h3>工作时间</h3>
          <p>周一至周五：9:00 - 18:00<br>周六周日：10:00 - 16:00</p>
        </div>`,
        linkType: 'internal',
        metaTitle: '联系我们 - 域名投资咨询热线',
        metaDescription: '联系我们获取专业的域名投资咨询服务，多种联系方式任您选择'
      },
      {
        title: '投资指南',
        slug: 'investment-guide',
        content: `<div style="max-width: 800px; margin: 0 auto; padding: 20px;">
          <h1>域名投资指南</h1>
          <h2>什么是好域名？</h2>
          <p>好域名应该具备以下特征：</p>
          <ul>
            <li><strong>简短易记：</strong>字符数量少，便于用户记忆和输入</li>
            <li><strong>含义明确：</strong>与业务相关，容易理解</li>
            <li><strong>商业价值：</strong>具备商业应用价值和发展潜力</li>
            <li><strong>拼写简单：</strong>避免复杂拼写和特殊字符</li>
          </ul>
          <h2>投资策略</h2>
          <p>1. 关注行业热点和发展趋势<br>
          2. 选择有商业价值的关键词<br>
          3. 考虑品牌保护需求<br>
          4. 评估域名的稀缺性</p>
          <h2>风险提示</h2>
          <p style="color: #e74c3c;">域名投资存在市场风险，投资需谨慎。建议在专业人士指导下进行投资决策。</p>
        </div>`,
        linkType: 'internal',
        metaTitle: '域名投资指南 - 专业投资策略分享',
        metaDescription: '学习域名投资知识，了解如何选择有价值的域名，掌握专业投资策略'
      },
      {
        title: '服务条款',
        slug: 'terms',
        content: `<div style="max-width: 800px; margin: 0 auto; padding: 20px;">
          <h1>服务条款</h1>
          <h2>1. 服务说明</h2>
          <p>本平台提供域名展示、咨询和交易中介服务。</p>
          <h2>2. 交易规则</h2>
          <p>所有域名交易需遵循平台规则，确保交易安全。</p>
          <h2>3. 责任声明</h2>
          <p>平台不对域名价值变动承担责任，投资需谨慎。</p>
        </div>`,
        linkType: 'internal',
        metaTitle: '服务条款 - 平台使用规则',
        metaDescription: '了解平台服务条款和交易规则'
      },
      {
        title: '百度搜索',
        slug: null,
        content: null,
        linkType: 'external',
        externalUrl: 'https://www.baidu.com',
        openInNewTab: true
      },
      {
        title: '谷歌搜索',
        slug: null,
        content: null,
        linkType: 'external',
        externalUrl: 'https://www.google.com',
        openInNewTab: true
      },
      {
        title: 'GitHub',
        slug: null,
        content: null,
        linkType: 'external',
        externalUrl: 'https://github.com',
        openInNewTab: true
      }
    ]

    for (const pageData of staticPages) {
      await prisma.staticPage.create({
        data: { userId: 1, ...pageData, status: 'published', sortOrder: 0 }
      })
    }
    console.log('✅ 创建静态页面:', staticPages.length, '个')

    // 6. 生成大量域名数据
    const domainPrefixes = [
      // 科技类
      'ai', 'tech', 'cloud', 'data', 'smart', 'digital', 'cyber', 'nano', 'quantum', 'robot',
      'blockchain', 'crypto', 'meta', 'virtual', 'augmented', 'machine', 'deep', 'neural',
      
      // 商业类
      'business', 'trade', 'commerce', 'market', 'shop', 'store', 'mall', 'buy', 'sell', 'pay',
      'invest', 'finance', 'bank', 'money', 'capital', 'fund', 'loan', 'credit', 'insurance',
      
      // 生活类
      'home', 'life', 'family', 'health', 'beauty', 'fashion', 'food', 'travel', 'hotel', 'car',
      'house', 'design', 'style', 'luxury', 'premium', 'elite', 'royal', 'diamond', 'gold',
      
      // 教育类
      'education', 'learn', 'study', 'school', 'university', 'training', 'course', 'skill',
      'knowledge', 'wisdom', 'expert', 'master', 'academy', 'institute', 'college',
      
      // 娱乐类
      'game', 'play', 'fun', 'entertainment', 'music', 'video', 'film', 'movie', 'show', 'live',
      'sport', 'fitness', 'yoga', 'dance', 'art', 'creative', 'ui-design', 'photo', 'media',
      
      // 地名类
      'beijing', 'shanghai', 'shenzhen', 'guangzhou', 'hangzhou', 'nanjing', 'chengdu', 'wuhan',
      'china', 'asia', 'global', 'world', 'international', 'local', 'city', 'town', 'village'
    ]

    const domainSuffixes = [
      'hub', 'lab', 'pro', 'plus', 'max', 'ultra', 'super', 'mega', 'micro', 'mini',
      'center', 'zone', 'space', 'world', 'land', 'city', 'town', 'base', 'port', 'gate',
      'link', 'connect', 'network', 'system', 'platform', 'service', 'solution', 'tool',
      'app', 'web', 'site', 'online', 'digital', 'virtual', 'cloud', 'mobile', 'smart',
      'express', 'direct', 'instant', 'quick', 'fast', 'speed', 'turbo', 'rocket', 'jet'
    ]

    const tlds = ['.com', '.net', '.org', '.io', '.ai', '.tech', '.app', '.online', '.store', '.biz', '.info', '.pro']

    const domains = []
    const categoryNames = categories.map(c => c.name)
    const registrarNames = registrars.map(r => r.name)

    // 生成150个域名
    for (let i = 0; i < 150; i++) {
      const prefix = domainPrefixes[Math.floor(Math.random() * domainPrefixes.length)]
      const suffix = domainSuffixes[Math.floor(Math.random() * domainSuffixes.length)]
      const tld = tlds[Math.floor(Math.random() * tlds.length)]
      const domainName = Math.random() > 0.3 ? `${prefix}-${suffix}${tld}` : `${prefix}${suffix}${tld}`
      
      // 生成价格（1000-200000）
      const price = Math.floor(Math.random() * 199000) + 1000
      
      // 随机选择分类
      const category = categoryNames[Math.floor(Math.random() * categoryNames.length)]
      
      // 随机选择注册商
      const registrar = registrarNames[Math.floor(Math.random() * registrarNames.length)]
      
      // 随机选择1-4个标签
      const domainTags = []
      const tagCount = Math.floor(Math.random() * 4) + 1
      for (let j = 0; j < tagCount; j++) {
        const tag = tags[Math.floor(Math.random() * tags.length)]
        if (!domainTags.includes(tag)) {
          domainTags.push(tag)
        }
      }

      domains.push({
        name: domainName,
        price: price,
        category: category,
        tags: domainTags,
        registrar: registrar
      })
    }

    // 添加一些特殊的短域名
    const shortDomains = [
      { name: 'a1.com', price: 500000, category: '短域名', tags: ['短域名', '精品', '字母数字'], registrar: 'GoDaddy' },
      { name: 'b2.net', price: 350000, category: '短域名', tags: ['短域名', '字母数字'], registrar: 'Namecheap' },
      { name: 'c3.org', price: 280000, category: '短域名', tags: ['短域名', '字母数字'], registrar: 'Cloudflare' },
      { name: '88.com', price: 800000, category: '数字域名', tags: ['数字域名', '短域名', '吉利数字'], registrar: '阿里云' },
      { name: '168.net', price: 450000, category: '数字域名', tags: ['数字域名', '吉利数字'], registrar: '腾讯云' },
      { name: '999.org', price: 380000, category: '数字域名', tags: ['数字域名', '吉利数字'], registrar: 'GoDaddy' },
      { name: 'abc.io', price: 600000, category: '短域名', tags: ['短域名', '字母', '精品'], registrar: 'Namecheap' },
      { name: 'xyz.ai', price: 320000, category: '短域名', tags: ['短域名', 'AI'], registrar: 'Cloudflare' }
    ]

    domains.push(...shortDomains)

    for (const domainData of domains) {
      try {
        // 获取分类ID
        const category = await prisma.domainCategory.findFirst({
          where: { userId: 1, name: domainData.category }
        })
        
        // 获取注册商ID
        const registrar = await prisma.registrar.findFirst({
          where: { userId: 1, name: domainData.registrar }
        })

        // 创建域名
        const domain = await prisma.domain.create({
          data: {
            userId: 1,
            domainName: domainData.name,
            purchasePrice: domainData.price,
            categoryId: category?.id,
            registrarId: registrar?.id,
            salesStatus: Math.random() > 0.15 ? 2 : 1, // 85%已上架，15%待售
            domainStatus: 1,
            notes: `${domainData.category}领域优质域名，具有很好的商业价值和投资潜力。`,
            creationDate: new Date(2018 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
            expiryDate: new Date(2025 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28))
          }
        })

        // 添加标签关联
        for (const tagName of domainData.tags) {
          const tag = await prisma.domainTag.findFirst({
            where: { userId: 1, name: tagName }
          })
          if (tag) {
            await prisma.domainTagMap.create({
              data: {
                domainId: domain.id,
                tagId: tag.id
              }
            })
          }
        }
      } catch (error) {
        console.warn(`创建域名 ${domainData.name} 失败:`, error.message)
      }
    }
    console.log('✅ 创建域名:', domains.length, '个')

    // 7. 创建多个米表
    const portfolios = [
      {
        name: '精品域名投资组合',
        slug: 'premium-domains',
        isDefault: true,
        layoutTemplate: 'grid',
        colorTheme: 'blue',
        headerInfo: '欢迎浏览我们的精品域名投资组合，这里汇集了各行业的优质域名资源。',
        headerPages: JSON.stringify([1, 2]), // 关于我们、联系我们
        headerRichText: '<div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; margin: 20px 0;"><h3>🏆 专业域名投资平台</h3><p>我们致力于发现和投资具有商业价值的优质域名</p></div>',
        footerInfo: '所有域名均支持议价，欢迎咨询洽谈。专业的团队为您提供一对一服务。',
        footerPages: JSON.stringify([3, 4, 5, 6]), // 投资指南、服务条款、百度、谷歌
        footerRichText: '<div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 6px; margin-top: 20px;"><p style="margin: 0; color: #6c757d; font-size: 0.9em;">域名投资有风险，请谨慎决策 | 版权所有 © 2024 专业域名投资平台</p></div>',
        showPrice: true,
        showDescription: true,
        showTags: true,
        categories: ['科技互联网', '金融投资', '短域名', '品牌域名', '数字域名']
      },
      {
        name: '科技创新域名专区',
        slug: 'tech-innovation',
        isDefault: false,
        layoutTemplate: 'list',
        colorTheme: 'green',
        headerInfo: '专注科技创新领域的优质域名，涵盖AI、区块链、云计算、物联网等前沿技术方向。',
        headerPages: JSON.stringify([1]),
        headerRichText: '<div style="background: #e8f5e8; padding: 15px; border-left: 4px solid #28a745; margin: 15px 0;"><strong>🚀 科技前沿</strong><br>投资科技域名，把握未来机遇</div>',
        footerInfo: '科技改变世界，域名连接未来。',
        footerPages: JSON.stringify([2, 3]),
        showPrice: true,
        showDescription: false,
        showTags: true,
        categories: ['科技互联网']
      },
      {
        name: '短域名精品收藏',
        slug: 'short-domains',
        isDefault: false,
        layoutTemplate: 'card',
        colorTheme: 'purple',
        headerInfo: '珍稀短域名收藏，每一个都是互联网的稀缺资源。',
        headerPages: JSON.stringify([1, 2]),
        headerRichText: '<div style="background: #f3e5f5; padding: 15px; border-radius: 8px; text-align: center; margin: 15px 0;"><strong>💎 稀缺珍品</strong><br>短域名 - 互联网世界的黄金地段</div>',
        footerInfo: '短域名投资价值巨大，机会稍纵即逝。',
        footerPages: JSON.stringify([3, 4]),
        showPrice: true,
        showDescription: true,
        showTags: false,
        categories: ['短域名', '数字域名']
      },
      {
        name: '行业热门域名',
        slug: 'trending-domains',
        isDefault: false,
        layoutTemplate: 'table',
        colorTheme: 'orange',
        headerInfo: '聚焦当前热门行业，精选具有巨大发展潜力的域名资产。',
        headerPages: JSON.stringify([1]),
        headerRichText: '<div style="background: #fff3cd; padding: 15px; border: 1px solid #ffeaa7; border-radius: 6px; margin: 15px 0;"><strong>🔥 热门趋势</strong><br>紧跟市场热点，抢占先机</div>',
        footerInfo: '把握行业脉搏，投资未来趋势。',
        footerPages: JSON.stringify([3]),
        showPrice: true,
        showDescription: true,
        showTags: true,
        categories: ['电子商务', '医疗健康', '教育培训', '旅游出行', '游戏娱乐']
      }
    ]

    for (const portfolioData of portfolios) {
      const categories = portfolioData.categories
      delete portfolioData.categories

      const portfolio = await prisma.portfolio.create({
        data: { userId: 1, ...portfolioData }
      })

      // 关联分类
      for (const categoryName of categories) {
        const category = await prisma.domainCategory.findFirst({
          where: { userId: 1, name: categoryName }
        })
        if (category) {
          await prisma.portfolioCategoryMap.create({
            data: {
              portfolioId: portfolio.id,
              categoryId: category.id
            }
          })
        }
      }
    }
    console.log('✅ 创建米表:', portfolios.length, '个')

    console.log('🎉 丰富测试数据填充完成！')
    console.log('📊 数据统计:')
    console.log(`   - 用户: 1个`)
    console.log(`   - 注册商: ${registrars.length}个`)
    console.log(`   - 分类: ${categories.length}个`)
    console.log(`   - 标签: ${tags.length}个`)
    console.log(`   - 静态页面: ${staticPages.length}个`)
    console.log(`   - 域名: ${domains.length}个`)
    console.log(`   - 米表: ${portfolios.length}个`)

    // 8. 创建域名关注数据
    const watchedDomains = [
      // 知名品牌相关域名
      {
        domainName: 'apple.ai',
        monitoringLevel: 'high',
        notes: '苹果公司相关AI域名，具有极高商业价值',
        notifyOnChange: true
      },
      {
        domainName: 'tesla.store',
        monitoringLevel: 'high', 
        notes: '特斯拉相关商店域名，电动车领域头部品牌',
        notifyOnChange: true
      },
      {
        domainName: 'amazon.tech',
        monitoringLevel: 'high',
        notes: '亚马逊技术相关域名，云计算龙头企业',
        notifyOnChange: true
      },
      
      // 行业热词域名
      {
        domainName: 'chatgpt.com',
        monitoringLevel: 'high',
        notes: 'AI聊天工具热门域名，关注度极高',
        notifyOnChange: true
      },
      {
        domainName: 'blockchain.org',
        monitoringLevel: 'medium',
        notes: '区块链官方域名，技术领域重要资源',
        notifyOnChange: true
      },
      {
        domainName: 'metaverse.net',
        monitoringLevel: 'medium',
        notes: '元宇宙概念域名，VR/AR发展趋势',
        notifyOnChange: true
      },
      {
        domainName: 'nft.market',
        monitoringLevel: 'medium',
        notes: 'NFT市场域名，数字资产交易平台',
        notifyOnChange: false
      },
      
      // 短域名
      {
        domainName: 'a.com',
        monitoringLevel: 'high',
        notes: '单字母域名，全球最稀缺的域名资源',
        notifyOnChange: true
      },
      {
        domainName: 'x.net',
        monitoringLevel: 'high',
        notes: '单字母域名，马斯克X平台相关',
        notifyOnChange: true
      },
      {
        domainName: 'ai.io',
        monitoringLevel: 'high',
        notes: 'AI相关短域名，人工智能行业核心资源',
        notifyOnChange: true
      },
      
      // 数字域名
      {
        domainName: '123.com',
        monitoringLevel: 'medium',
        notes: '连续数字域名，简单易记具有商业价值',
        notifyOnChange: true
      },
      {
        domainName: '888.net',
        monitoringLevel: 'medium',
        notes: '吉利数字域名，中文市场价值高',
        notifyOnChange: true
      },
      {
        domainName: '666.org',
        monitoringLevel: 'low',
        notes: '流行数字域名，网络文化象征',
        notifyOnChange: false
      },
      
      // 中文拼音域名
      {
        domainName: 'taobao.ai',
        monitoringLevel: 'high',
        notes: '淘宝AI域名，电商巨头智能化布局',
        notifyOnChange: true
      },
      {
        domainName: 'wechat.tech',
        monitoringLevel: 'high',
        notes: '微信技术域名，社交平台技术延伸',
        notifyOnChange: true
      },
      {
        domainName: 'douyin.store',
        monitoringLevel: 'medium',
        notes: '抖音商店域名，短视频电商趋势',
        notifyOnChange: true
      },
      
      // 新兴技术域名
      {
        domainName: 'web3.com',
        monitoringLevel: 'medium',
        notes: '下一代互联网概念域名，去中心化趋势',
        notifyOnChange: true
      },
      {
        domainName: 'defi.org',
        monitoringLevel: 'medium',
        notes: '去中心化金融域名，金融科技创新',
        notifyOnChange: true
      },
      {
        domainName: 'quantum.tech',
        monitoringLevel: 'low',
        notes: '量子计算技术域名，前沿科技领域',
        notifyOnChange: false
      },
      
      // 生活服务域名
      {
        domainName: 'food.delivery',
        monitoringLevel: 'low',
        notes: '食物配送域名，本地生活服务',
        notifyOnChange: false
      },
      {
        domainName: 'health.app',
        monitoringLevel: 'medium',
        notes: '健康应用域名，医疗健康趋势',
        notifyOnChange: true
      },
      {
        domainName: 'travel.booking',
        monitoringLevel: 'low',
        notes: '旅游预订域名，出行服务平台',
        notifyOnChange: false
      },
      
      // 金融科技域名
      {
        domainName: 'fintech.io',
        monitoringLevel: 'medium',
        notes: '金融科技域名，数字金融创新',
        notifyOnChange: true
      },
      {
        domainName: 'crypto.exchange',
        monitoringLevel: 'medium',
        notes: '加密货币交易域名，数字资产平台',
        notifyOnChange: true
      },
      
      // 教育科技域名
      {
        domainName: 'edtech.com',
        monitoringLevel: 'low',
        notes: '教育科技域名，在线教育趋势',
        notifyOnChange: false
      },
      {
        domainName: 'online.university',
        monitoringLevel: 'low',
        notes: '在线大学域名，远程教育发展',
        notifyOnChange: false
      },
      
      // 绿色能源域名
      {
        domainName: 'solar.energy',
        monitoringLevel: 'low',
        notes: '太阳能域名，清洁能源发展',
        notifyOnChange: false
      },
      {
        domainName: 'green.tech',
        monitoringLevel: 'low',
        notes: '绿色科技域名，环保技术创新',
        notifyOnChange: false
      },
      
      // 电竞游戏域名
      {
        domainName: 'esports.live',
        monitoringLevel: 'medium',
        notes: '电竞直播域名，游戏娱乐产业',
        notifyOnChange: false
      },
      {
        domainName: 'gaming.world',
        monitoringLevel: 'low',
        notes: '游戏世界域名，娱乐产业发展',
        notifyOnChange: false
      }
    ]

    for (const watchedData of watchedDomains) {
      // 生成随机的最后检查时间（1-30天前）
      const lastCheckDays = Math.floor(Math.random() * 30) + 1
      const lastWhoisCheck = new Date()
      lastWhoisCheck.setDate(lastWhoisCheck.getDate() - lastCheckDays)
      
      // 生成 whois 摘要信息
      const whoisSummary = `域名状态: ${Math.random() > 0.3 ? '已注册' : '可注册'}, 注册商: ${registrarNames[Math.floor(Math.random() * registrarNames.length)]}, 到期时间: ${new Date(2024 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toISOString().split('T')[0]}`
      
      try {
        await prisma.watchedDomain.create({
          data: {
            userId: 1,
            domainName: watchedData.domainName,
            lastWhoisCheck: lastWhoisCheck,
            currentWhoisSummary: whoisSummary,
            monitoringLevel: watchedData.monitoringLevel,
            notes: watchedData.notes,
            notifyOnChange: watchedData.notifyOnChange
          }
        })
      } catch (error) {
        console.warn(`创建关注域名 ${watchedData.domainName} 失败:`, error.message)
      }
    }
    console.log('✅ 创建域名关注:', watchedDomains.length, '个')

    console.log('')
    console.log('🎉 丰富测试数据填充完成！')
    console.log('📊 数据统计:')
    console.log(`   - 用户: 1个`)
    console.log(`   - 注册商: ${registrars.length}个`)
    console.log(`   - 分类: ${categories.length}个`)
    console.log(`   - 标签: ${tags.length}个`)
    console.log(`   - 静态页面: ${staticPages.length}个`)
    console.log(`   - 域名: ${domains.length}个`)
    console.log(`   - 米表: ${portfolios.length}个`)
    console.log(`   - 域名关注: ${watchedDomains.length}个`)
    console.log('')
    console.log('🌐 访问测试:')
    console.log('   - 首页: http://localhost:3000/')
    console.log('   - 科技域名: http://localhost:3000/tech-innovation')
    console.log('   - 短域名: http://localhost:3000/short-domains')
    console.log('   - 热门域名: http://localhost:3000/trending-domains')

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