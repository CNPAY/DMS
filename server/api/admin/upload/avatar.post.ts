import { writeFile } from 'fs/promises'
import { join } from 'path'
import { ResponseData } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    const formData = await readMultipartFormData(event)
    if (!formData || formData.length === 0) {
      return ResponseData.error('请选择要上传的文件')
    }

    const file = formData[0]
    if (!file.filename || !file.type || !file.data) {
      return ResponseData.error('文件格式错误')
    }

    // 检查文件类型
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      return ResponseData.error('只支持 JPG 和 PNG 格式的图片')
    }

    // 检查文件大小（2MB）
    if (file.data.length > 2 * 1024 * 1024) {
      return ResponseData.error('文件大小不能超过 2MB')
    }

    // 生成文件名
    const ext = file.filename.split('.').pop()
    const fileName = `avatar-${Date.now()}.${ext}`
    
    // 确保上传目录存在
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'images')
    await ensureDir(uploadDir)
    
    // 保存文件
    const filePath = join(uploadDir, fileName)
    await writeFile(filePath, file.data)

    // 更新用户头像
    const userId = 1 // 固定用户ID为1
    await prisma.user.update({
      where: { id: userId },
      data: {
        avatar: `/uploads/images/${fileName}`
      }
    })

    return ResponseData.success({
      url: `/uploads/images/${fileName}`
    })
  } catch (error) {
    console.error('上传头像失败:', error)
    return ResponseData.error('上传头像失败')
  }
})

// 确保目录存在的辅助函数
async function ensureDir(dir: string) {
  try {
    await fs.access(dir)
  } catch {
    await fs.mkdir(dir, { recursive: true })
  }
} 