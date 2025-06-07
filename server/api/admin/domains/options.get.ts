import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'
import { SALES_STATUS_OPTIONS } from '~/utils/constants.js'

export default defineEventHandler(async (event) => {
  try {
    // 并行获取所有选项数据
    const [registrars, categories, tags] = await Promise.all([
      // 获取注册商列表
      prisma.registrar.findMany({
        where: { userId: 1 },
        select: {
          id: true,
          name: true
        },
        orderBy: { name: 'asc' }
      }),
      
      // 获取分类列表
      prisma.domainCategory.findMany({
        where: { userId: 1 },
        select: {
          id: true,
          name: true
        },
        orderBy: { name: 'asc' }
      }),
      
      // 获取标签列表
      prisma.domainTag.findMany({
        where: { userId: 1 },
        select: {
          id: true,
          name: true
        },
        orderBy: { name: 'asc' }
      })
    ])

    // 域名状态选项
    const domainStatusOptions = [
      { value: 1, label: '正常' },
      { value: 2, label: '过期' },
      { value: 3, label: '暂停' },
      { value: 4, label: '转出' }
    ]

    // 销售状态选项
    const salesStatusOptions = SALES_STATUS_OPTIONS

    // 着陆页类型选项
    const landingPageTypeOptions = [
      { value: 'redirect', label: '重定向' },
      { value: 'template', label: '模板页面' },
      { value: 'custom', label: '自定义页面' }
    ]

    return ResponseData.success({
      registrars,
      categories,
      tags,
      domainStatusOptions,
      salesStatusOptions,
      landingPageTypeOptions
    }, '获取选项数据成功')
  } catch (error: any) {
    console.error('获取选项数据失败:', error)
    return ResponseData.error('获取选项数据失败', 500)
  }
}) 