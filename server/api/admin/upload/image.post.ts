import { writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'
import { existsSync } from 'fs'

export default defineEventHandler(async (event) => {
  try {
    // 只允许POST请求
    if (getMethod(event) !== 'POST') {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed'
      })
    }

    // 读取multipart form data
    const formData = await readMultipartFormData(event)
    
    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No file uploaded'
      })
    }

    // 查找文件字段
    const fileField = formData.find(field => field.filename)
    if (!fileField) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No file found in form data'
      })
    }

    const uploadedFile = fileField
    
    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (uploadedFile.type && !allowedTypes.includes(uploadedFile.type)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Only image files are allowed (JPEG, PNG, GIF, WebP)'
      })
    }

    // 验证文件大小 (5MB)
    const maxSize = 5 * 1024 * 1024
    const fileSize = uploadedFile.data?.length || 0
    if (fileSize > maxSize) {
      throw createError({
        statusCode: 400,
        statusMessage: 'File size must be less than 2MB'
      })
    }

    // 生成唯一文件名
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const fileExt = extname(uploadedFile.filename || '') || '.jpg'
    const fileName = `${timestamp}_${randomStr}${fileExt}`

    // 创建上传目录路径
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'images')
    
    // 确保目录存在
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // 保存文件
    const filePath = join(uploadDir, fileName)
    await writeFile(filePath, uploadedFile.data)

    // 返回文件URL
    const fileUrl = `/uploads/images/${fileName}`

    return {
      code: 200,
      message: '文件上传成功',
      data: {
        url: fileUrl,
        filename: uploadedFile.filename || 'unknown',
        size: fileSize,
        type: uploadedFile.type || 'unknown'
      }
    }

  } catch (error: any) {
    console.error('文件上传失败:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || '文件上传失败'
    })
  }
}) 