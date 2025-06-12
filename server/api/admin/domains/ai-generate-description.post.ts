import { ResponseData } from '~/server/utils/response'
import prisma from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { domainId, domainName } = body
    let name = domainName
    if (!name && domainId) {
      const domain = await prisma.domain.findUnique({ where: { id: domainId } })
      if (!domain) return ResponseData.error('域名不存在', 404)
      name = domain.domainName
    }
    if (!name) return ResponseData.error('请提供域名ID或域名', 400)

    // 调用AI适配层生成描述
    const aiRes = await $fetch('/api/admin/ai/adapter/generate', {
      method: 'POST',
      body: {
        sceneCode: 'domain_description_generate',
        input: { domainName: name }
      }
    })
    if (!aiRes || !aiRes.data || !aiRes.data.content) {
      return ResponseData.error('AI生成失败', 500)
    }
    return ResponseData.success({ description: aiRes.data.content })
  } catch (error: any) {
    console.error('AI生成域名描述失败:', error)
    return ResponseData.error('AI生成域名描述失败', 500)
  }
}) 