import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    // 监控级别选项
    const monitoringLevels = [
      { value: 'basic', label: '基础监控' },
      { value: 'standard', label: '标准监控' },
      { value: 'advanced', label: '高级监控' },
      { value: 'premium', label: '专业监控' }
    ]

    // 通知设置选项
    const notifyOptions = [
      { value: true, label: '开启通知' },
      { value: false, label: '关闭通知' }
    ]

    return ResponseData.success({
      monitoringLevels,
      notifyOptions
    }, '获取选项数据成功')
  } catch (error: any) {
    console.error('获取选项数据失败:', error)
    return ResponseData.error(error.message || '获取选项数据失败', 500)
  }
})