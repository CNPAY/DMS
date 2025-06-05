import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    // 询盘状态选项
    const statusOptions = [
      { value: 'new', label: '新询盘', color: 'primary' },
      { value: 'contacted', label: '已联系', color: 'warning' },
      { value: 'negotiating', label: '协商中', color: 'info' },
      { value: 'accepted', label: '已接受', color: 'success' },
      { value: 'rejected', label: '已拒绝', color: 'danger' },
      { value: 'closed', label: '已关闭', color: 'info' }
    ]

    return ResponseData.success({
      statusOptions
    }, '获取选项数据成功')
  } catch (error: any) {
    console.error('获取选项数据失败:', error)
    return ResponseData.error(error.message || '获取选项数据失败', 500)
  }
}) 