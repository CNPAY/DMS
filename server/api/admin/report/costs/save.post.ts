import prisma from '~/server/utils/db'
import { ResponseData } from '~/server/utils/response'

interface CostData {
  id?: number
  domainId: number
  costDate: string
  amount: number
  costType: string
  renewalYears?: number | null
  notes?: string
}

export default defineEventHandler(async (event) => {
  try {
    // 暂时使用固定的用户ID 1 进行测试
    const userId = 1
    
    const body = await readBody(event)
    const { action, data } = body as { action: 'create' | 'update' | 'delete' | 'batchDelete', data: any }

    switch (action) {
      case 'create':
      case 'update': {
        const costData = data as CostData
        
        // 验证必填字段
        if (!costData.domainId || !costData.costDate || !costData.amount || !costData.costType) {
          return ResponseData.error('域名、日期、金额和成本类型不能为空')
        }

        // 验证域名是否属于当前用户
        const domain = await prisma.domain.findFirst({
          where: {
            id: costData.domainId,
            userId
          }
        })

        if (!domain) {
          return ResponseData.error('域名不存在或无权限操作')
        }

        // 验证成本类型
        const validCostTypes = ['purchase', 'renewal', 'transfer', 'privacy', 'dns', 'ssl', 'other']
        if (!validCostTypes.includes(costData.costType)) {
          return ResponseData.error('无效的成本类型')
        }

        // 验证金额
        if (costData.amount <= 0) {
          return ResponseData.error('金额必须大于0')
        }

        const costDate = new Date(costData.costDate)
        if (isNaN(costDate.getTime())) {
          return ResponseData.error('无效的日期格式')
        }

        if (action === 'create') {
          // 创建新记录
          const newCost = await prisma.domainCost.create({
            data: {
              domainId: costData.domainId,
              costDate,
              amount: costData.amount,
              costType: costData.costType,
              renewalYears: costData.renewalYears,
              notes: costData.notes
            },
            include: {
              domain: {
                select: {
                  domainName: true
                }
              }
            }
          })

          return ResponseData.success({
            ...newCost,
            domainName: newCost.domain.domainName
          }, '成本记录创建成功')

        } else {
          // 更新记录
          if (!costData.id) {
            return ResponseData.error('更新时ID不能为空')
          }

          // 验证记录是否存在且属于当前用户
          const existingCost = await prisma.domainCost.findFirst({
            where: {
              id: costData.id,
              domain: { userId }
            }
          })

          if (!existingCost) {
            return ResponseData.error('成本记录不存在或无权限操作')
          }

          const updatedCost = await prisma.domainCost.update({
            where: { id: costData.id },
            data: {
              domainId: costData.domainId,
              costDate,
              amount: costData.amount,
              costType: costData.costType,
              renewalYears: costData.renewalYears,
              notes: costData.notes
            },
            include: {
              domain: {
                select: {
                  domainName: true
                }
              }
            }
          })

          return ResponseData.success({
            ...updatedCost,
            domainName: updatedCost.domain.domainName
          }, '成本记录更新成功')
        }
      }

      case 'delete': {
        const id = data as number
        
        if (!id) {
          return ResponseData.error('ID不能为空')
        }

        // 验证记录是否存在且属于当前用户
        const existingCost = await prisma.domainCost.findFirst({
          where: {
            id,
            domain: { userId }
          }
        })

        if (!existingCost) {
          return ResponseData.error('成本记录不存在或无权限操作')
        }

        await prisma.domainCost.delete({
          where: { id }
        })

        return ResponseData.success(null, '成本记录删除成功')
      }

      case 'batchDelete': {
        const ids = data as number[]
        
        if (!Array.isArray(ids) || ids.length === 0) {
          return ResponseData.error('请选择要删除的记录')
        }

        // 验证所有记录是否属于当前用户
        const existingCosts = await prisma.domainCost.findMany({
          where: {
            id: { in: ids },
            domain: { userId }
          }
        })

        if (existingCosts.length !== ids.length) {
          return ResponseData.error('部分记录不存在或无权限操作')
        }

        const deleteResult = await prisma.domainCost.deleteMany({
          where: {
            id: { in: ids }
          }
        })

        return ResponseData.success({
          deletedCount: deleteResult.count
        }, `成功删除 ${deleteResult.count} 条成本记录`)
      }

      default:
        return ResponseData.error('不支持的操作类型')
    }

  } catch (error) {
    console.error('成本记录操作失败:', error)
    return ResponseData.error('成本记录操作失败')
  }
}) 