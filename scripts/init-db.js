import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { dbConfig } from '~/config'

const prisma = new PrismaClient()

async function createDefaultUser() {
  try {
    console.log('正在初始化数据库...')

    // 检查是否已存在管理员用户
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@dms.com' }
    })

    if (existingUser) {
      console.log('默认管理员用户已存在')
      return
    }

    // 创建密码哈希
    const passwordHash = await bcrypt.hash('admin123', 10)

    // 创建默认管理员用户
    const user = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@dms.com',
        passwordHash: passwordHash
      }
    })

    console.log('默认管理员用户创建成功:')
    console.log('  邮箱: admin@dms.com')
    console.log('  密码: admin123')
    console.log('  用户ID:', user.id)

  } catch (error) {
    console.error('初始化数据库失败:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  createDefaultUser()
    .then(() => {
      console.log('数据库初始化完成')
      process.exit(0)
    })
    .catch((error) => {
      console.error('数据库初始化失败:', error)
      process.exit(1)
    })
}

export { createDefaultUser } 