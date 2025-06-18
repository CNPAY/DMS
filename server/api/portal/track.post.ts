import { ResponseData } from '~/server/utils/response'
import { recordTrack } from '~/server/utils/visitor'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { target, targetType, eventData } = body
    
    // 参数验证
    if (!target || !targetType) {
      return ResponseData.error('缺少必要参数', 400)
    }
    
    // 记录访问统计
    await recordTrack(target, targetType, event, eventData)
    
    return ResponseData.success(null, '访问记录成功')
  } catch (error) {
    console.error('记录访问统计失败:', error)
    return ResponseData.error('记录访问统计失败', 500)
  }
}) 