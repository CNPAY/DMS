import { ResponseData } from '~/server/utils/response'
import fs from 'fs'
import path from 'path'
import { systemScenes } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // 1. 预设场景元数据
    const scenes = systemScenes;
    // 2. 读取txt内容作为systemPrompt
    const promptsDir = path.resolve('server/config/prompts')
    const scenesWithPrompt = scenes.map(scene => {
      const promptPath = path.join(promptsDir, `${scene.code}.txt`)
      let systemPrompt = ''
      if (fs.existsSync(promptPath)) {
        systemPrompt = fs.readFileSync(promptPath, 'utf-8')
      }
      return { ...scene, systemPrompt }
    })
    return ResponseData.success({ scenes: scenesWithPrompt }, '获取AI场景和系统提示词成功')
  } catch (error: any) {
    console.error('获取AI选项失败:', error)
    return ResponseData.error('获取AI选项失败', 500)
  }
}) 