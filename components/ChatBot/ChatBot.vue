<template>
  <div class="chatbot-container">
    <!-- 聊天弹窗 -->
    <el-drawer v-model="open" :with-header="false" size="500px" body-class="chatbot-drawer-body"  class="chatbot-drawer" append-to-body>
      <div class="chatbot-main-flex">
        <!-- 顶部栏 -->
        <div class="chatbot-header-bar">
          <div class="chatbot-title">
            <div class="main">AI助手</div>
            <div class="sub">{{ currentSceneName }}</div>
          </div>
          <div class="chatbot-header-actions">
            <!-- <el-tooltip content="设置" placement="bottom"><el-icon @click="showSettings = true" size="18"><Setting /></el-icon></el-tooltip> -->
            <el-tooltip content="关闭" placement="bottom"><el-icon @click="open = false" size="18"><CloseBold /></el-icon></el-tooltip>
          </div>
        </div>
        <!-- 聊天区 -->
        <div class="chatbot-bubble-area" ref="bubbleArea">
          <template v-if="chatHistory.length">
            <div v-for="(msg, idx) in chatHistory" :key="idx" :class="['bubble-row', msg.role]">
              <div :class="['bubble-avatar', msg.role]">
                <span v-if="msg.role==='user'">🧑‍💻</span>
                <span v-else>🤖</span>
              </div>
              <div :class="['bubble-msg', msg.role, 'bubble-animate']">
                <span v-for="line in msg.content.split('\n')" :key="line">{{ line }}<br v-if="!line.endsWith('\n')"/></span>
                <span v-if="msg.role==='assistant'" class="bubble-triangle-left"></span>
                <span v-if="msg.role==='user'" class="bubble-triangle-right"></span>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="scene-empty-tip">欢迎使用AI助手</div>
          </template>
        </div>
        <!-- 场景选择横条 -->
        <div class="chatbot-scene-bar" v-if="scenes.length">
          <div class="scene-scroll">
            <el-button v-for="scene in scenes" :title="scene.description" :key="scene.code" @click="quickStartScene(scene)" class="scene-btn-mini" round :type="sceneCode===scene.code?'primary':'default'">
              {{ scene.name }}
            </el-button>
          </div>
        </div>
        <!-- 底部输入区 -->
        <div class="chatbot-input-bar">
          <el-input
            v-model="userInput"
            type="textarea"
            :rows="2"
            placeholder="输入内容，Enter发送，Shift+Enter换行"
            @keyup.enter.native="onEnter"
            class="chatbot-input"
          />
          <el-button @click="sendMessage" :loading="loading" type="primary" class="send-btn"><el-icon><Promotion /></el-icon></el-button>
        </div>
      </div>
    </el-drawer>
    <!-- 悬浮胶囊按钮 -->
    <div class="chatbot-float-capsule" @click="open = true">
      <div class="capsule-content">
        <span class="capsule-robot">🤖</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Setting, Download, CloseBold, Promotion } from '@element-plus/icons-vue'

const open = ref(false)
const showSettings = ref(false)
const scenes = ref([])
const sceneCode = ref('')
const promptList = ref([])
const promptId = ref('')
const currentPrompt = ref('')
const chatHistory = ref([])
const userInput = ref('')
const loading = ref(false)
const bubbleArea = ref(null)

const currentSceneName = computed(() => {
  const s = scenes.value.find(s => s.code === sceneCode.value)
  return s ? s.name : ''
})

// 1. 获取场景列表
async function loadScenes() {
  const res = await $fetch('/api/admin/ai/prompts/options')
  scenes.value = res.data?.scenes || []
  if (!sceneCode.value && scenes.value.length) sceneCode.value = scenes.value[0].code
}
 
// 4. 发送消息
async function sendMessage() {
  if (!userInput.value && !currentPrompt.value) return
  // 组装多轮对话历史
  chatHistory.value.push({ role: 'user', content: userInput.value })
  loading.value = true
  await nextTick()
  scrollToBottom()
  
  try {
    // 组装 messages
    const messages = chatHistory.value.map(m => ({ role: m.role, content: m.content }))
    // 结构化参数示例：如有专门域名输入框可替换 userInput.value
    const extra = { domainName: userInput.value }
    userInput.value = ''
    const res = await $fetch('/api/admin/ai/chat', {
      method: 'POST',
      body: {
        sceneCode: sceneCode.value,
        messages,
        extra
      }
    })
    chatHistory.value.push({ role: 'assistant', content: res.data?.content || '[无回复]' })
    userInput.value = ''
    await nextTick()
    scrollToBottom()
  } catch (e) {
    ElMessage.error('AI对话失败')
  } finally {
    loading.value = false
  }
}
function onEnter(e) {
  if (!e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}
function scrollToBottom() {
  if (bubbleArea.value) {
    bubbleArea.value.scrollTop = bubbleArea.value.scrollHeight
  }
}
function quickStartScene(scene) {
  sceneCode.value = scene.code
  chatHistory.value = [{ role: 'assistant', content: scene.description}]
  userInput.value = ''
}
function exportChat() {
  const text = chatHistory.value.map(m => (m.role === 'user' ? '用户：' : 'AI：') + m.content).join('\n')
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'chatbot.txt'
  a.click()
  URL.revokeObjectURL(url)
}
onMounted(() => {
  loadScenes()
})
</script>
<style lang="scss">
.chatbot-drawer {
  background: linear-gradient(180deg, #f8fafc 80%, #e6eaf0 100%);
  border-radius: 16px 0 0 16px;
  box-shadow: 0 8px 32px rgba(83, 118, 154, 0.12);
  overflow: hidden;
  padding: 0;
  :deep(.el-drawer__body){
    padding: 0!important;
  }
  :deep(.el-drawer__header){
    display: none;
  }
}
.chatbot-drawer-body{
    padding: 0!important;
}
</style>
<style scoped lang="scss">

.chatbot-main-flex {
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 100%;
}
.chatbot-header-bar {
  flex: 0 0 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 54px;
  padding: 0 18px;
  background: #fff;
  color: #222c3c;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 1.5px solid #e6eaf0;
}
.chatbot-title {
  letter-spacing: 1.5px;
  text-align: center;
  flex: 1;
}
.chatbot-title .main {
  font-weight: 700;
  font-size: 18px;
}
.chatbot-title .sub {
  font-size: 13px;
  color: #409EFF;
  margin-top: 2px;
  font-weight: 400;
  font-weight: 600;
}
.chatbot-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
}
.chatbot-bubble-area {
  flex: 1 1 0;
  overflow-y: auto;
  padding: 18px 12px 0 12px;
  background: transparent;
  min-height: 0;
}
.scene-empty-tip {
  color: #b0b8c9;
  text-align: center;
  margin-top: 60px;
  font-size: 15px;
}
.bubble-row {
  display: flex;
  align-items: flex-end;
  margin-bottom: 8px;
  animation: fadeInUp 0.4s cubic-bezier(.4,0,.2,1);
}
.bubble-row.user {
  flex-direction: row-reverse;
}
.bubble-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin: 0 10px;
  background: linear-gradient(135deg, #e6eaf0 60%, #fff 100%);
  box-shadow: 0 2px 12px rgba(64,158,255,0.10);
  border: 2.5px solid #fff;
  transition: box-shadow 0.18s, border 0.18s;
  animation: avatarPop 0.5s cubic-bezier(.4,0,.2,1);
}
.bubble-avatar.assistant {
  border: 2.5px solid #409EFF;
  box-shadow: 0 0 12px 2px #66b1ff55;
  background: linear-gradient(135deg, #409EFF 60%, #66b1ff 100%);
  color: #fff;
}
.bubble-avatar.user {
  border: 2.5px solid #e6eaf0;
  box-shadow: 0 0 8px 1px #e6eaf088;
  background: linear-gradient(135deg, #e6eaf0 60%, #fff 100%);
  color: #409EFF;
}
.bubble-msg {
  max-width: 72%;
  min-height: 38px;
  padding: 14px 20px;
  border-radius: 22px;
  font-size: 16px;
  line-height: 1.8;
  box-shadow: 0 4px 24px rgba(64,158,255,0.10);
  background: rgba(255,255,255,0.85);
  color: #222c3c;
  word-break: break-word;
  margin-bottom: 2px;
  position: relative;
  transition: background 0.18s, box-shadow 0.18s;
  animation: fadeInBubble 0.5s cubic-bezier(.4,0,.2,1);
  backdrop-filter: blur(12px);
  font-family: var(--ai-font);
  white-space: pre-line;
}
.bubble-msg.assistant {
  background: rgba(255,255,255,0.92);
  color: #222c3c;
  text-align: left;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 22px;
  border-bottom-right-radius: 22px;
  border-top-right-radius: 22px;
  box-shadow: 0 4px 24px rgba(64,158,255,0.10);
}
.bubble-msg.user {
  background: linear-gradient(90deg, #409EFF 80%, #66b1ff 100%);
  color: #fff;
  text-align: right;
  border-top-right-radius: 10px;
  border-bottom-left-radius: 22px;
  border-bottom-right-radius: 22px;
  border-top-left-radius: 22px;
  box-shadow: 0 4px 24px rgba(64,158,255,0.18);
}
.bubble-msg .bubble-triangle-left {
  position: absolute;
  left: -10px;
  top: 16px;
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right: 10px solid #fff;
  content: '';
}
.bubble-row.user .bubble-msg .bubble-triangle-right {
  position: absolute;
  right: -10px;
  top: 16px;
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left: 10px solid #66b1ff;
  content: '';
}
.chatbot-scene-bar {
  flex: 0 0 100px;
  background: transparent;
  display: flex;
  align-items: center;
  overflow-x: auto;
  padding: 5px 12px;
}
.scene-scroll {
  background: transparent;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 8px;
  overflow-x: auto;
  width: 100%;
  padding-bottom: 4px;
  height: 100%;
}


.scene-btn-mini {
  padding-top: 4px;
  padding-bottom: 4px;
  height: 22px;
  font-size: 12px;
  border-radius: 12px;
  background: #e6eaf0cc;
  color: #409EFF;
  border: none;
  font-weight: 500;
  margin-left: 0;
}
.scene-btn-mini.el-button--primary {
  background: linear-gradient(90deg, #409EFF 80%, #66b1ff 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(64,158,255,0.12);
}
.scene-btn-mini:hover {
  background: #409EFF;
  color: #fff;
  box-shadow: 0 4px 12px rgba(64,158,255,0.18);
}
.chatbot-input-bar {
  flex: 0 0 70px;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 16px 16px 16px;
  background: #fff;
  border-top: 1.5px solid #e6eaf0;
}
.chatbot-input {
  font-size: 15px;
  background: #f8fafc;
  color: #222c3c;
}
.chatbot-input:focus-within {
  border: 1.5px solid #409EFF;
}
.send-btn {
  height: 38px;
  width: 38px;
  min-width: 38px;
  font-size: 18px;
  border-radius: 50%;
  background: linear-gradient(90deg, #409EFF 80%, #66b1ff 100%);
  color: #fff;
  font-weight: 600;
  border: none;
  box-shadow: 0 2px 8px rgba(64,158,255,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.18s, box-shadow 0.18s;
}
.send-btn:hover {
  background: linear-gradient(90deg, #66b1ff 80%, #409EFF 100%);
  box-shadow: 0 4px 16px rgba(64,158,255,0.18);
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: none; }
}
@keyframes fadeInBubble {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}
.chatbot-float-capsule {
  position: fixed;
  right: 0;
  bottom: 60px;
  z-index: 99999;
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #409EFF 80%, #66b1ff 100%);
  border-radius: 22px;
  box-shadow: 0 2px 12px rgba(64,158,255,0.18);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.18s, box-shadow 0.18s, background 0.18s;
  border: 2px solid #fff;
}
.chatbot-float-capsule:hover {
  transform: scale(1.08) translateY(-4px);
  background: linear-gradient(135deg, #66b1ff 80%, #409EFF 100%);
  box-shadow: 0 8px 24px rgba(64,158,255,0.28);
}
.capsule-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #fff;
  font-weight: bold;
  user-select: none;
}
.capsule-robot {
  font-size: 22px;
  margin-top: 2px;
}
:deep(.el-drawer__body) {
  padding: 0 !important;
}
</style> 