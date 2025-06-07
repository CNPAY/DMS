import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { data, config } = body
    
    // TODO: 从session或token中获取用户ID
    const userId = 1 // 临时硬编码，实际应该从认证中获取
    
    if (!data || !Array.isArray(data)) {
      return {
        code: 400,
        message: '导入数据格式错误'
      }
    }

    const importResult = {
      success: true,
      successCount: 0,
      skipCount: 0,
      errorCount: 0,
      errors: [] as Array<{ row: number; domain: string; error: string }>
    }

    // 获取已存在的域名列表用于重复检查
    const existingDomains = await prisma.domain.findMany({
      select: { domainName: true }
    })
    const existingDomainNames = new Set(existingDomains.map(d => d.domainName.toLowerCase()))

    // 处理每一行数据
    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      const rowIndex = item.rowIndex || i + 1

      try {
        // 验证必需字段
        if (!item.domain) {
          importResult.errors.push({
            row: rowIndex,
            domain: item.domain || '',
            error: '域名字段不能为空'
          })
          importResult.errorCount++
          continue
        }

        // 域名格式验证
        if (config.validateDomain) {
          const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/
          if (!domainPattern.test(item.domain)) {
            importResult.errors.push({
              row: rowIndex,
              domain: item.domain,
              error: '域名格式不正确'
            })
            importResult.errorCount++
            continue
          }
        }

        // 销售价格验证
        let price = null
        if (item.price) {
          if (config.validatePrice) {
            const priceValue = parseFloat(item.price)
            if (isNaN(priceValue) || priceValue < 0) {
              importResult.errors.push({
                row: rowIndex,
                domain: item.domain,
                error: '销售价格格式不正确'
              })
              importResult.errorCount++
              continue
            }
            price = priceValue
          } else {
            price = parseFloat(item.price) || null
          }
        }

        // 域名成本验证
        let cost = null
        if (item.cost) {
          if (config.validatePrice) {
            const costValue = parseFloat(item.cost)
            if (isNaN(costValue) || costValue < 0) {
              importResult.errors.push({
                row: rowIndex,
                domain: item.domain,
                error: '域名成本格式不正确'
              })
              importResult.errorCount++
              continue
            }
            cost = costValue
          } else {
            cost = parseFloat(item.cost) || null
          }
        }

        // 重复域名处理
        const domainLower = item.domain.toLowerCase()
        if (existingDomainNames.has(domainLower)) {
          if (config.duplicateHandling === 'skip') {
            importResult.skipCount++
            continue
          } else if (config.duplicateHandling === 'error') {
            importResult.errors.push({
              row: rowIndex,
              domain: item.domain,
              error: '域名已存在'
            })
            importResult.errorCount++
            continue
          } else if (config.duplicateHandling === 'update') {
            // 查找已存在的域名
            const existingDomain = await prisma.domain.findUnique({
              where: {
                userId_domainName: {
                  userId: userId,
                  domainName: item.domain
                }
              }
            })

            if (existingDomain) {
              // 更新域名基本信息
              const updateData: any = {
                salesStatus: config.defaultStatus,
                categoryId: config.defaultCategory || null,
                notes: item.description || null
              }
              
              // 销售价格保存到salesPrice字段
              if (price !== null) {
                updateData.salesPrice = price
              }

              await prisma.domain.update({
                where: {
                  userId_domainName: {
                    userId: userId,
                    domainName: item.domain
                  }
                },
                data: updateData
              })

              // 如果有成本信息，创建成本记录
              if (cost !== null) {
                await prisma.domainCost.create({
                  data: {
                    domainId: existingDomain.id,
                    costDate: new Date(),
                    amount: cost,
                    costType: 'purchase',
                    notes: '通过批量导入更新'
                  }
                })
              }
            }

            importResult.successCount++
            continue
          }
        }

        // 创建新域名记录
        const domainData: any = {
          userId: userId,
          domainName: item.domain,
          salesStatus: config.defaultStatus,
          domainStatus: 1, // 默认正常状态
          categoryId: config.defaultCategory || null,
          notes: item.description || `通过批量导入创建 - ${new Date().toLocaleString()}`
        }
        
        // 销售价格保存到salesPrice字段
        if (price !== null) {
          domainData.salesPrice = price
        }

        const newDomain = await prisma.domain.create({
          data: domainData
        })

        // 如果有成本信息，创建成本记录
        if (cost !== null) {
          await prisma.domainCost.create({
            data: {
              domainId: newDomain.id,
              costDate: new Date(),
              amount: cost,
              costType: 'purchase',
              notes: '通过批量导入创建'
            }
          })
        }

        // 记录为已存在的域名，避免同批次内重复
        existingDomainNames.add(domainLower)
        importResult.successCount++

      } catch (error: any) {
        console.error(`处理第${rowIndex}行数据失败:`, error)
        importResult.errors.push({
          row: rowIndex,
          domain: item.domain || '',
          error: error?.message || '处理失败'
        })
        importResult.errorCount++
      }
    }

    // 设置最终结果状态
    importResult.success = importResult.errorCount === 0 || importResult.successCount > 0

    return {
      code: 200,
      message: `导入完成！成功 ${importResult.successCount} 条，跳过 ${importResult.skipCount} 条，失败 ${importResult.errorCount} 条`,
      data: importResult,
      ...importResult
    }

  } catch (error: any) {
    console.error('域名导入失败:', error)
    return {
      code: 500,
      message: '域名导入失败: ' + (error?.message || '未知错误'),
      success: false,
      successCount: 0,
      skipCount: 0,
      errorCount: 0,
      errors: []
    }
  } finally {
    await prisma.$disconnect()
  }
}) 