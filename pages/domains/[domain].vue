<template>
  <div class="domain-container portal-theme" :data-theme="landing.backgroundColorInfo.value">
    
    <div class="container-wrap">
      <!-- 域名展示卡片 -->
      <div class="card parking-card">
        <div class="parking-card-form">
          <div class="parking-header">
            <h1 class="parking-brand">
              {{landing?.mainTitle}}
              <span>  {{landing?.subTitle}}</span>
            </h1>
            <div class="contact-button" @click="showContact">联系</div>
          </div>
          <div class="parking-title">
            <div class="parking-title-top">
              <div class="parking-domain" ref="domainRef">{{ domainInfo?.domainName }}</div>
              <!-- <d class="price-text" v-if="domainInfo.price"><strong>{{ formatPrice(domainInfo?.price) }}</strong> 元</d> -->
            </div>
             <!-- 域名简介 -->
            <div class="domain-content">
              <div v-html="domainInfo.domainDescription"></div>
            </div>
            <div class="parking-title-bottom">
               <div v-html="landing?.footerTitle"></div>
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
          
          <div  v-if="submitSuccess" class="inquiry-success">提交成功，我们会尽快与您联系！</div>
          <div v-if="submitError" class="inquiry-error">{{ submitError }}</div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute, useHead, useRuntimeConfig, useFetch, useAsyncData } from '#imports'
import { 
  COLOR_THEMES, 
} from '~/utils/constants.js'
import { useTrack } from '~/composables/useTrack'
const route = useRoute()
const config = useRuntimeConfig()
const domain = route.params.domain

// 使用响应式引用存储数据
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

// 使用访问统计组合式函数
const { trackDomain } = useTrack()

const landing = reactive({
  backgroundColorInfo: {},
  mainTitle: '',
  subTitle: '',
  footerTitle: ''
})
const size = ref({})
definePageMeta({
  layout: 'default',
})
defineOptions({ name: 'DomainDetail' })

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

// 使用useAsyncData获取域名信息，支持SSR
const { data: domainData } = await useAsyncData(
  'domainInfo',
  () => $fetch(`/api/portal/domain-info?domain=${domain}`),
  { lazy: false }
)

// 使用useAsyncData获取着陆页配置，支持SSR
const { data: landingData } = await useAsyncData(
  'landingConfig',
  () => $fetch(`/api/portal/landing`),
  { lazy: false }
)

// 直接更新响应式对象
if (domainData.value?.data) {
  Object.assign(domainInfo, domainData.value.data)
  
  // 如果是重定向类型且有外部链接，则执行重定向（仅在客户端）
  if (process.client && domainInfo.landingPageType === 'redirect' && domainInfo.externalUrl) {
    setTimeout(() => {
      window.location.href = domainInfo.externalUrl
    }, 2000)
  }
}

if (landingData.value?.data) {
  Object.assign(landing, landingData.value.data)
  landing.backgroundColorInfo = COLOR_THEMES.find(theme => theme.value === landing.backgroundColor || 'lavender')
}
function computeFontSize (domain, size, fontFamily){
  let spanDom = document.createElement("span");
  spanDom.style.fontSize = size;
  spanDom.style.opacity = "0";
  // spanDom.style.fontFamily = family;
  spanDom.innerHTML = domain;
  document.body.append(spanDom);
  let sizeD = {};
  sizeD.width = spanDom.offsetWidth;
  sizeD.height = spanDom.offsetHeight;
  spanDom.remove();
  return sizeD;
}
// 自动调整域名字体大小 - 仅在客户端执行
function autoFitDomain() {
  if (!process.client || !domainRef.value) return
  
  const dom = domainRef.value
  const width = size.value.width;
  const parentWidth = dom.clientWidth;

  const multNum = process.client && window.innerWidth <= 768 ? (parentWidth-60) / width : ((parentWidth/2)-100) / width;
  const num = Math.floor(multNum * 100) / 100;
  dom.style.transform = `scale(${num})`
  dom.style.transformOrigin = 'left center'
}

// 显示联系表单
function showContact() {
  showContactFlag.value = !showContactFlag.value
}

onMounted(() => {
  // DOM操作仅在客户端执行
  size.value = computeFontSize(domain, "40px", "TypoUbuntuBold");
  autoFitDomain()
  
  // 监听窗口大小变化，调整域名字体大小
  if (process.client) {
    window.addEventListener('resize', autoFitDomain)
  }

  // 如果有域名ID，记录访问
  if (domainInfo.id) {
    trackDomain(domainInfo.id)
  }
})

// 动态生成SEO图片URL
const getSeoImageUrl = computed(() => {
  if (domainInfo.image) return domainInfo.image
  
  // 获取当前站点的URL
  let baseUrl = ''
  if (process.client) {
    baseUrl = window.location.origin
  } else {
    // 在服务器端，使用请求的host或配置的URL
    baseUrl = config.public.appUrl || `https://${domain}`
  }
  
  return `${baseUrl}/api/portal/seo-image?domain=${encodeURIComponent(domainInfo.domainName)}&description=${encodeURIComponent(domainInfo.domainDescription || '')}&price=${encodeURIComponent(domainInfo.price || '')}`
})

// 计算规范的URL
const canonicalUrl = computed(() => {
  if (process.client) {
    return window.location.href
  }
  return `https://${domain}/domains/${domain}`
})

// 增强的SEO/OG/Twitter Card meta
useHead({
  title: () => domainInfo.seoTitle ? `${domainInfo.seoTitle} - ${landing.mainTitle}` : `${domainInfo.domainName} - ${landing.mainTitle}`,
  meta: [
    // 基本SEO
    { name: 'description', content: () => domainInfo.seoDescription || `${domainInfo.domainName} - 优质域名，现正出售中。立即询价！` },
    { name: 'keywords', content: () => domainInfo.seoKeywords || `${domainInfo.domainName},域名出售,域名交易,域名询价` },
    
    // Open Graph
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: () => domainInfo.seoTitle || `${domainInfo.domainName} - 优质域名出售` },
    { property: 'og:description', content: () => domainInfo.seoDescription || `${domainInfo.domainName} - 优质域名，现正出售中。立即询价！` },
    { property: 'og:image', content: getSeoImageUrl },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:site_name', content: landing.mainTitle },
    
    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: () => domainInfo.seoTitle || `${domainInfo.domainName} - 优质域名出售` },
    { name: 'twitter:description', content: () => domainInfo.seoDescription || `${domainInfo.domainName} - 优质域名，现正出售中。立即询价！` },
    { name: 'twitter:image', content: getSeoImageUrl },
    
    // 其他社交媒体
    { property: 'weibo:title', content: () => domainInfo.seoTitle || `${domainInfo.domainName} - 优质域名出售` },
    { property: 'weibo:description', content: () => domainInfo.seoDescription || `${domainInfo.domainName} - 优质域名，现正出售中。立即询价！` },
    { property: 'weibo:image', content: getSeoImageUrl }
  ],
  link: [
    { rel: 'canonical', href: canonicalUrl }
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

// 提交表单 - 使用useFetch
async function onSubmit() {
  submitError.value = ''
  
  if (!validateForm()) {
    return
  }
  
  loading.value = true
  try {
    const { data, error } = await $fetch('/api/portal/inquiry', {
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
    
    if (error) {
      throw new Error('提交失败')
    }
    
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
  flex-direction: column;
  justify-content: center;
  width: 100%;
  flex: 1;
}

.parking-card .parking-domain {
  color: white;
  font-weight: bold;
  font-family: "TypoUbuntuBold";
  margin: 0;
  white-space: nowrap;
  font-size: 40px;
  overflow: none;
  transform-origin: left center;
  width: 100%;
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
.contact-card-form input[type="number"],
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
  width: 65px;
  height: 36px;
  background-color: transparent;
  background-size: contain;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.3s ease;
  color:white;
  font-weight: 500;
  border: 1px solid white;
  
  &:hover {
    background-color: var(--theme-primary);
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(90, 147, 203, 0.2);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: none;
  }
}

.send {
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%);
  color: white;
  border: none;
  padding: 10px 25px 10px 25px;
  box-shadow: 1px 1px 5px #B6B6B6;
  border-radius: 3px;
  text-shadow: 1px 1px 1px #5a93cb;
  cursor: pointer;
  position: absolute;
  bottom: 20px;
  left: 13px;
  right: 13px;
  font-size: 20px;
  z-index: 66;
  width: calc(100% - 13px * 2);
}

.send:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}
.inquiry-success {
  color: #52c41a;
  font-size: 1.1rem;
  margin: 0px 10px;
  margin-bottom: 3px;
  text-align: center;
  padding:  3px;
  background: rgba(82,196,26,0.1);
  border-radius: 8px;
}

.inquiry-error {
  color: #ff4d4f;
  font-size: 1.1rem;
  margin: 0px 10px;
  margin-bottom: 3px;
  text-align: center;
  padding:  3px;
  background: rgba(255,77,79,0.1);
  border-radius: 8px;
}

@media only screen and (max-height: 667px) {
  .domain-content{
    display: none !important;
  }
  .contact-card-form textarea {
    height: 80px;
  }
}

@media only screen and (max-width: 640px) {
  .domain-content{
    display: none !important;
  }
  .container-wrap {
    padding: 15px;
    height: calc(100%);
    width: calc(100%);
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
.domain-content{
  position: absolute; 
 //右半部分
  padding: 30px;
  font-size: 18px;
  right: 0;
  width: 50%;
  height: 100%;
  word-wrap:  pre-wrap;
  white-space: pre-wrap;
  word-break: break-all;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 10;
  -webkit-box-orient: vertical;
}
.h1{
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 10px;
}
.h2{  
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
}
.h3{
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}
.h4{
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}
.p{
  font-size: 18px;
  margin-bottom: 10px;
}
</style> 