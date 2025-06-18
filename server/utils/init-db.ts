import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    // 检查是否已存在管理员用户
    const adminExists = await prisma.user.findFirst({
      where: {
        username: 'admin'
      }
    })

    if (!adminExists) {
      // 创建默认管理员用户
      const hashedPassword = await bcrypt.hash('admin123456', 10)
      await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@dms.com',
          passwordHash: hashedPassword
        }
      })
      console.log('✅ 默认管理员用户创建成功')
    } else {
      console.log('ℹ️ 管理员用户已存在，跳过创建')
    }

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main() 