import { PrismaClient } from '@prisma/client'
import { dbConfig } from '~/config';

// 全局数据库连接实例
let globalPrisma: PrismaClient

declare global {
  var __prisma: PrismaClient | undefined
}

// 创建或获取全局Prisma实例
export const prisma = globalThis.__prisma || new PrismaClient({
  datasources: {
    db: {
      url: dbConfig.mysql.url
    }
  }
})

// 在开发环境中保存到全局变量，避免热重载时重复创建连接
if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

export default prisma 