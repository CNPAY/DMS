import prisma from '../server/utils/db'

async function clearAllData() {
  console.log('开始清空所有数据表...')

  try {
    // 按照依赖关系的顺序删除数据（先删除子表，再删除父表）
    console.log('🗑️  删除关联表数据...')
    
    // 删除关联表
    await prisma.domainTagMap.deleteMany({})
    console.log('   ✓ 清空域名标签关联表')
    
    await prisma.portfolioCategoryMap.deleteMany({})
    console.log('   ✓ 清空米表分类关联表')
    
    await prisma.portfolioDomainMap.deleteMany({})
    console.log('   ✓ 清空米表域名关联表')
    
    // 删除子表数据
    console.log('🗑️  删除子表数据...')
    
    await prisma.domainCost.deleteMany({})
    console.log('   ✓ 清空域名成本表')
    
    await prisma.domainSale.deleteMany({})
    console.log('   ✓ 清空域名销售表')
    
    await prisma.inquiry.deleteMany({})
    console.log('   ✓ 清空线索表')
    
    await prisma.watchedDomain.deleteMany({})
    console.log('   ✓ 清空域名关注表')
    
    await prisma.aiPrompt.deleteMany({})
    console.log('   ✓ 清空AI提示词表')
    
    await prisma.staticPage.deleteMany({})
    console.log('   ✓ 清空静态页面表')
    
    await prisma.systemSetting.deleteMany({})
    console.log('   ✓ 清空系统设置表')
    
    // 删除主表数据
    console.log('🗑️  删除主表数据...')
    
    await prisma.domain.deleteMany({})
    console.log('   ✓ 清空域名表')
    
    await prisma.portfolio.deleteMany({})
    console.log('   ✓ 清空米表表')
    
    await prisma.domainTag.deleteMany({})
    console.log('   ✓ 清空域名标签表')
    
    await prisma.domainCategory.deleteMany({})
    console.log('   ✓ 清空域名分类表')
    
    await prisma.registrar.deleteMany({})
    console.log('   ✓ 清空注册商表')
    
    await prisma.user.deleteMany({})
    console.log('   ✓ 清空用户表')
    
    // 重置所有表的自增ID
    console.log('🔄 重置自增ID...')
    
    await prisma.$executeRaw`ALTER TABLE users AUTO_INCREMENT = 1`
    console.log('   ✓ 重置用户表自增ID')
    
    await prisma.$executeRaw`ALTER TABLE registrars AUTO_INCREMENT = 1`
    console.log('   ✓ 重置注册商表自增ID')
    
    await prisma.$executeRaw`ALTER TABLE domain_categories AUTO_INCREMENT = 1`
    console.log('   ✓ 重置域名分类表自增ID')
    
    await prisma.$executeRaw`ALTER TABLE domain_tags AUTO_INCREMENT = 1`
    console.log('   ✓ 重置域名标签表自增ID')
    
    await prisma.$executeRaw`ALTER TABLE domains AUTO_INCREMENT = 1`
    console.log('   ✓ 重置域名表自增ID')
    
    await prisma.$executeRaw`ALTER TABLE portfolios AUTO_INCREMENT = 1`
    console.log('   ✓ 重置米表表自增ID')
    
    await prisma.$executeRaw`ALTER TABLE static_pages AUTO_INCREMENT = 1`
    console.log('   ✓ 重置静态页面表自增ID')
    
    await prisma.$executeRaw`ALTER TABLE domain_costs AUTO_INCREMENT = 1`
    console.log('   ✓ 重置域名成本表自增ID')
    
    await prisma.$executeRaw`ALTER TABLE domain_sales AUTO_INCREMENT = 1`
    console.log('   ✓ 重置域名销售表自增ID')
    
    await prisma.$executeRaw`ALTER TABLE inquiries AUTO_INCREMENT = 1`
    console.log('   ✓ 重置线索表自增ID')
    
    await prisma.$executeRaw`ALTER TABLE watched_domains AUTO_INCREMENT = 1`
    console.log('   ✓ 重置域名关注表自增ID')
    
    await prisma.$executeRaw`ALTER TABLE ai_prompts AUTO_INCREMENT = 1`
    console.log('   ✓ 重置AI提示词表自增ID')
    
    console.log('')
    console.log('🎉 所有数据表已清空且自增ID已重置！')
    console.log('💡 现在可以运行 seed-admin-data.js 重新导入测试数据')
    
  } catch (error) {
    console.error('❌ 清空数据失败:', error)
    throw error
  }
}

clearAllData()
  .catch((e) => {
    console.error('❌ 脚本执行失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 