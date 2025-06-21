import prisma from '~/server/utils/db'

// 1. 定义一个模块级变量来缓存用户ID
// undefined: 尚未查询; null: 查询过但未找到; number: 已缓存的用户ID
let cachedUserId: number | null | undefined = undefined;

export default defineEventHandler(async (event) => {
  // 2. 检查缓存是否已经初始化 (仅在应用启动后的第一次请求时执行)
  if (cachedUserId === undefined || cachedUserId === null) {
    console.log('正在查询数据库以获取第一个用户 (仅执行一次)...');
    const firstUser = await prisma.user.findFirst({
      orderBy: {
        id: 'asc'
      }
    });
    // 3. 缓存查询结果，即使未找到用户(null)，后续也不再查询
    cachedUserId = firstUser ? firstUser.id : null;
  }

  // 4. 如果缓存了有效的用户ID，则将其设置到上下文中
  if (cachedUserId) {
    if (!event.context.auth) {
      event.context.auth = {};
    }
    event.context.auth.userId = cachedUserId;
  }
}) 