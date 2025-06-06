import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  return ResponseData.success({
    statusOptions: [
      { label: '已发布', value: 'published' },
      { label: '草稿', value: 'draft' }
    ]
  }, '获取选项成功')
}) 