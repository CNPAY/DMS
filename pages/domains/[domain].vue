<template>
  <div class="domain-container">
    <div class="lang-icon" @click="changeLang">
      <!-- {{ currentLang === 'zh' ? '🇬🇧' : '🇨🇳' }} -->
    </div>

    <div class="container-wrap">
      <!-- 域名展示卡片 -->
      <div class="card parking-card">
        <div class="parking-card-form">
          <div class="parking-header">
            <h1 class="parking-brand">
              域名大师
              <span>一个域名一个品牌</span>
            </h1>
            <div class="contact-button" @click="showContact">报价</div>
          </div>
          <div class="parking-title">
            <div class="parking-title-top">
              <h1 class="parking-domain" ref="domainRef">{{ domainInfo.domainName }}</h1>
            </div>
            <div class="parking-title-bottom">
              <p class="sale-text">此域名<strong>正在出售中</strong>.</p>
              <p class="show-text">不仅仅是为了 <span>秀<sup>(show)</sup></span> <span>秀<sup>(show)</sup></span>.</p>
              <p class="price-text" v-if="domainInfo.price">参考价格: <strong>{{ formatPrice(domainInfo.price) }}</strong> 元</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 询价表单卡片 -->
      <div :class="{'card':true, 'contact-card':true, 'fore-contact':showContactFlag}">
        <button type="button" class="send" @click="onSubmit">发送</button>

        <form class="contact-card-form" @submit.prevent="onSubmit">
          <div class="contact-header">
            <h1>
              联系我们
              <span>报价或者获取更多信息</span>
            </h1>
          </div>

          <label>
            <span>姓 :</span>
            <input 
              v-model="form.visitorName" 
              type="text" 
              placeholder="您的姓"
              :class="{ 'error': errors.visitorName }"
              @blur="validateField('visitorName')"
            />
          </label>
          <label>
            <span>名 :</span>
            <input 
              v-model="form.visitorLastName" 
              type="text" 
              placeholder="您的名"
            />
          </label>
          <label>
            <span>邮箱:</span>
            <input 
              v-model="form.visitorEmail" 
              type="email" 
              placeholder="您的邮箱"
              :class="{ 'error': errors.visitorEmail }"
              @blur="validateField('visitorEmail')"
            />
          </label>
          <label>
            <span>报价:</span>
            <input 
              v-model="form.offerPrice" 
              type="number" 
              placeholder="您的报价(元)"
              :class="{ 'error': errors.offerPrice }"
              @blur="validateField('offerPrice')"
            />
          </label>
          <label>
            <span>留言:</span>
            <textarea 
              v-model="form.message" 
              placeholder="您的留言"
              :class="{ 'error': errors.message }"
              @blur="validateField('message')"
            ></textarea>
          </label>
          
          <div v-if="submitSuccess" class="inquiry-success">提交成功，我们会尽快与您联系！</div>
          <div v-if="submitError" class="inquiry-error">{{ submitError }}</div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { useRoute, useHead, useRuntimeConfig } from '#imports'

const route = useRoute()
const config = useRuntimeConfig()
const domain = route.params.domain
const domainInfo = reactive({
  id: null,
  domainName: domain,
  domainDescription: '',
  price: '',
  content: '',
  landingPageType: '',
  clickBehavior: '',
  externalUrl: '',
  image: ''
})
definePageMeta({
  layout: 'default',
})
// 显示联系表单标志
const showContactFlag = ref(false)

// 语言设置
const currentLang = ref('zh')
const changeLang = () => {
  currentLang.value = currentLang.value === 'zh' ? 'en' : 'zh'
}

// 域名元素引用
const domainRef = ref(null)

// 格式化价格
function formatPrice(price) {
  if (!price) return '0'
  return new Intl.NumberFormat('zh-CN').format(price)
}

// 获取域名信息
async function fetchDomainInfo() {
  try {
    const res = await $fetch(`/api/portal/domain-info?domain=${domain}`)
    Object.assign(domainInfo, res.data)
    
    // 如果是重定向类型且有外部链接，则执行重定向
    if (domainInfo.landingPageType === 'redirect' && domainInfo.externalUrl) {
      setTimeout(() => {
        window.location.href = domainInfo.externalUrl
      }, 2000)
    }
    
    // 调整域名字体大小
    nextTick(() => {
      autoFitDomain()
    })
  } catch {
    domainInfo.domainDescription = '未找到该域名信息。'
    domainInfo.content = ''
  }
}

// 自动调整域名字体大小
function autoFitDomain() {
  if (!domainRef.value) return
  
  const dom = domainRef.value
  const parentWidth = dom.parentNode.clientWidth
  const domainLength = domainInfo.domainName.length
  
  // 根据域名长度和容器宽度调整缩放比例
  const baseSize = 40 // 基础字体大小
  const estimatedWidth = baseSize * 0.6 * domainLength // 估算宽度
  const multNum = (parentWidth - 50) / estimatedWidth
  const num = Math.min(1, Math.floor(multNum * 100) / 100) // 限制最大缩放为1
  
  dom.style.transform = `scale(${num})`
  dom.style.transformOrigin = 'left center'
}

// 显示联系表单
function showContact() {
  showContactFlag.value = !showContactFlag.value
}

onMounted(() => {
  fetchDomainInfo()
  
  // 监听窗口大小变化，调整域名字体大小
  window.addEventListener('resize', autoFitDomain)
})

// 动态生成SEO图片URL
const getSeoImageUrl = () => {
  if (domainInfo.image) return domainInfo.image
  
  // 使用我们自己的API服务来动态生成HTML版本的SEO图片
  // 获取当前站点的URL，优先使用客户端的window.location，服务器端则使用配置
  let baseUrl = ''
  if (process.client) {
    baseUrl = window.location.origin
  } else {
    // 在服务器端，使用请求的host或配置的URL
    const host = process.server ? (route.fullPath.startsWith('http') ? '' : 'https://') + domain : ''
    baseUrl = host || ''
  }
  
  return `${baseUrl}/api/portal/seo-image?domain=${encodeURIComponent(domainInfo.domainName)}&description=${encodeURIComponent(domainInfo.domainDescription || '')}&price=${encodeURIComponent(domainInfo.price || '')}`
}

// 增强的SEO/OG/Twitter Card meta
useHead({
  title: () => `${domainInfo.domainName} - 优质域名出售` ,
  meta: [
    // 基本SEO
    { name: 'description', content: () => domainInfo.domainDescription || `${domainInfo.domainName} - 优质域名，现正出售中。立即询价！` },
    { name: 'keywords', content: () => `${domainInfo.domainName},域名出售,域名交易,域名询价` },
    
    // Open Graph
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: () => `${domainInfo.domainName} - 优质域名出售` },
    { property: 'og:description', content: () => domainInfo.domainDescription || `${domainInfo.domainName} - 优质域名，现正出售中。立即询价！` },
    { property: 'og:image', content: getSeoImageUrl },
    { property: 'og:url', content: () => process.client ? window.location.href : `https://${domain}/domains/${domain}` },
    { property: 'og:site_name', content: '域名交易平台' },
    
    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: () => `${domainInfo.domainName} - 优质域名出售` },
    { name: 'twitter:description', content: () => domainInfo.domainDescription || `${domainInfo.domainName} - 优质域名，现正出售中。立即询价！` },
    { name: 'twitter:image', content: getSeoImageUrl },
    
    // 其他社交媒体
    { property: 'weibo:title', content: () => `${domainInfo.domainName} - 优质域名出售` },
    { property: 'weibo:description', content: () => domainInfo.domainDescription || `${domainInfo.domainName} - 优质域名，现正出售中。立即询价！` },
    { property: 'weibo:image', content: getSeoImageUrl }
  ],
  link: [
    { rel: 'canonical', href: () => process.client ? window.location.href : `https://${domain}/domains/${domain}` }
  ]
})

// 询价表单
const form = reactive({ 
  visitorName: '', 
  visitorLastName: '',
  visitorEmail: '', 
  visitorPhone: '', 
  offerPrice: '', 
  message: '' 
})
const errors = reactive({ visitorName: '', visitorEmail: '', visitorPhone: '', offerPrice: '', message: '' })
const loading = ref(false)
const submitSuccess = ref(false)
const submitError = ref('')

// 表单验证规则
const validateField = (field) => {
  errors[field] = ''
  
  switch (field) {
    case 'visitorName':
      if (!form.visitorName) {
        errors.visitorName = '请输入姓名'
      }
      break
    case 'visitorEmail':
      if (!form.visitorEmail) {
        errors.visitorEmail = '请输入邮箱'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.visitorEmail)) {
        errors.visitorEmail = '邮箱格式不正确'
      }
      break
    case 'message':
      if (!form.message) {
        errors.message = '请填写留言'
      }
      break
  }
  
  return !errors[field]
}

// 验证整个表单
const validateForm = () => {
  let isValid = true
  
  // 验证每个字段
  ;['visitorName', 'visitorEmail', 'message'].forEach(field => {
    if (!validateField(field)) {
      isValid = false
    }
  })
  
  return isValid
}

// 提交表单
async function onSubmit() {
  submitError.value = ''
  
  if (!validateForm()) {
    return
  }
  
  loading.value = true
  try {
    await $fetch('/api/portal/inquiry', {
      method: 'POST',
      body: {
        domainId: domainInfo.id,
        visitorName: form.visitorName + ' ' + form.visitorLastName,
        visitorEmail: form.visitorEmail,
        visitorPhone: form.visitorPhone,
        offerPrice: form.offerPrice,
        message: form.message
      }
    })
    submitSuccess.value = true
    setTimeout(() => { submitSuccess.value = false }, 4000)
    Object.assign(form, { visitorName: '', visitorLastName: '', visitorEmail: '', visitorPhone: '', offerPrice: '', message: '' })
  } catch (e) {
    submitError.value = '提交失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
html, body {
  padding: 0;
  margin: 0;
}

.domain-container {
  height: 100vh;
  width: 100vw;
  padding: 0;
  margin: 0;
  //白色 辅助色 主色 辅助色 渐变
  background-image: radial-gradient(at 20px 20px, white 0%, var(--theme-secondary) 25%, var(--theme-secondary) 45%, var(--theme-primary) 100%);

  // background-image: radial-gradient(at 20px 20px, white 0%, #f0ccd5 25%, #5a93cb 45%, #cf3ebe 100%);
  box-shadow: 0px 0px 8px 0px pink;
  position: relative;
  overflow: hidden;
}

.lang-icon {
  position: fixed;
  right: 20px;
  top: 20px;
  font-size: 30px;
  z-index: 888;
  cursor: pointer;
}

.container-wrap {
  padding: 30px;
  height: 100%;
  width: 100%;
  position: relative;
}

.card {
  height: 100%;
}

/* 域名展示卡片样式 */
.parking-card {
  float: left;
  width: 100%;
}

.parking-card-form {
  width: 100%;
  height: 100%;
  font: 12px "Helvetica Neue", Helvetica, Arial, sans-serif;
  color: #D3D3D3;
  border: none;
  border-radius: 5px;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  overflow: hidden;
}

.parking-header {
  padding: 15px 0px 10px 15px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.parking-card-form .parking-brand {
  margin: 0;
  color: #ffffff;
  overflow: hidden;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.parking-card-form .parking-brand > span {
  display: block;
  font-size: 12px;
  opacity: 0.8;
}

.parking-card p {
  font: 20px "Helvetica Neue", Helvetica, Arial, sans-serif;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  margin: 0;
  display: inline-block;
}

.parking-card .parking-title {
  color: white;
  font-size: 30px;
  height: calc(100% - 55px - 20px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.parking-title-top {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  flex: 1;
}

.parking-card .parking-domain {
  color: white;
  font-weight: bold;
  font-family: "TypoUbuntuBold", Arial, sans-serif;
  margin: 0;
  white-space: nowrap;
  font-size: 60px;
  overflow: hidden;
  width: 100%;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.parking-title-bottom {
  p {
    margin-bottom: 15px;
    font-size: 24px;
    line-height: 1.5;
  }
  
  span {
    display: inline-block;
    margin: 0 5px;
  }
  
  .sale-text {
    strong {
      font-weight: bold;
      color: #fff;
    }
  }
  
  .show-text {
    text-align: right;
    
    span {
      font-weight: bold;
      position: relative;
      
      sup {
        font-size: 12px;
        opacity: 0.8;
      }
    }
  }
  
  .price-text {
    font-size: 28px;
    text-align: center;
    margin-top: 30px;
    
    strong {
      font-weight: bold;
      color: #fff;
      text-shadow: 0 0 10px rgba(255, 215, 0, 0.7);
    }
  }
}

/* 联系表单样式 */
.contact-card {
  float: right;
  width: 420px;
  top: 50%;
  right: 100px;
  transform: translateY(-50%);
  height: auto;
  min-height: 500px;
  max-height: 80%;
  position: absolute;
  display: none;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  overflow: hidden;
  z-index: 100;
  background: #F7F7F7;

}

.fore-contact {
  display: block !important;
}

.contact-card-form {
  width: 100%;
  height: 100%;
  background: #F7F7F7;
  font: 12px Georgia, "Times New Roman", Times, serif;
  color: #888;
  text-shadow: 1px 1px 1px #FFF;
  border: 1px solid #E4E4E4;
  overflow: hidden;
}

.contact-card-form .contact-header {
  padding: 15px 0px 10px 15px;
  border-bottom: 1px solid #E4E4E4;
  margin-bottom: 20px;
}

.contact-card-form h1 {
  margin: 0;
  font-size: 25px;
  display: block;
  color: #888;
}

.contact-card-form h1 > span {
  display: block;
  font-size: 11px;
}

.contact-card-form label {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin: 0px;
  padding-left: 10px;
  padding-right: 10px;
}

.contact-card-form label > span {
  float: left;
  width: 70px;
  text-align: right;
  padding-right: 10px;
  margin-bottom: 16px;
  color: #888;
}

.contact-card-form input[type="text"],
.contact-card-form input[type="email"],
.contact-card-form textarea,
.contact-card-form select {
  border: 1px solid #DADADA;
  color: #888;
  height: 30px;
  margin-bottom: 16px;
  margin-top: 2px;
  outline: 0 none;
  padding: 3px 5px 3px 5px;
  font-size: 12px;
  line-height: 15px;
  box-shadow: inset 0px 1px 4px #ECECEC;
  -moz-box-shadow: inset 0px 1px 4px #ECECEC;
  -webkit-box-shadow: inset 0px 1px 4px #ECECEC;
  flex: 1;
  
  &.error {
    border-color: #ff4d4f;
  }
}

.contact-card-form textarea {
  padding: 5px 3px 3px 5px;
  height: 80px;
  resize: none;
}

.contact-button {
  outline: none;
  width: 55px;
  height: 30px;
  background-color: transparent;
  background-size: contain;
  cursor: pointer;
  font-size: 20px;
}

.send {
  background: #5a93cb;
  border: none;
  padding: 10px 25px 10px 25px;
  color: #FFF;
  box-shadow: 1px 1px 5px #B6B6B6;
  border-radius: 3px;
  text-shadow: 1px 1px 1px #5a93cb;
  cursor: pointer;
  position: absolute;
  bottom: 20px;
  left: 13px;
  right: 13px;
  font-size: 25px;
  z-index: 66;
  width: calc(100% - 13px * 2);
}

.send:hover {
  background: #9656b9;
}

.inquiry-success {
  color: #52c41a;
  font-size: 1.1rem;
  margin: 16px 10px;
  text-align: center;
  padding: 10px;
  background: rgba(82,196,26,0.1);
  border-radius: 8px;
}

.inquiry-error {
  color: #ff4d4f;
  font-size: 1.1rem;
  margin: 16px 10px;
  text-align: center;
  padding: 10px;
  background: rgba(255,77,79,0.1);
  border-radius: 8px;
}

@media only screen and (max-height: 667px) {
  .contact-card-form textarea {
    height: 80px;
  }
}

@media only screen and (max-width: 640px) {
  .container-wrap {
    padding: 15px;
    height: calc(100% - 30px);
    width: calc(100% - 30px);
    position: relative;
  }
  
  .contact-card {
    float: right;
    top: 50%;
    right: 15px;
    left: 15px;
    transform: translateY(-50%);
    height: auto;
    min-height: 500px;
    max-height: 90%;
    width: auto;
    display: none;
  }
  
  .parking-title-top {
    width: 100%;
  }
  
  .parking-title-bottom p {
    width: 100%;
  }
  
  .parking-title-bottom .show-text {
    text-align: right;
  }
  
  .lang-icon {
    right: 20px;
    top: 15px;
  }
  
  .parking-title-bottom .price-text {
    font-size: 22px;
    margin-top: 20px;
  }
}
</style> 