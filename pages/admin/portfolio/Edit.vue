<template>
    <!-- 添加或修改米表对话框 -->
    <el-dialog :title="title" v-model="open" width="70%" append-to-body>
      <div style="display: flex; gap: 10px; height: 700px;">
        <!-- 左侧预览区域 -->
        <div style="width: 350px; border-right: 1px solid #e6e6e6; padding-right: 20px;">
          <div style="margin-bottom: 15px;">
            <h4 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">🎨 主题预览</h4>
            <p style="margin: 0; color: #666; font-size: 12px;">实时预览选中主题的视觉效果</p>
          </div>
          
          <!-- 主题预览组件 -->
          <div class="theme-preview" :class="[`theme-${form.colorTheme}`, `layout-${form.layoutTemplate}`]">
            <!-- 预览头部 -->
            <div class="preview-header">
              <div class="preview-logo">{{ form.name || '米表名称' }}</div>
              <div class="preview-nav">
                <span>首页</span>
                <span>分类</span>
                <span>关于</span>
              </div>
            </div>
            
            <!-- 预览内容 -->
            <div class="preview-content">
              <div class="preview-header-info" v-if="form.headerInfo">
                {{ form.headerInfo }}
              </div>
              
              <!-- 布局标识 -->
              <div class="layout-indicator">
                <span class="layout-badge">{{ getTemplateLabel(form.layoutTemplate) }}布局</span>
                <span v-if="form.enableGrouping" class="feature-badge grouping-badge">分组模式</span>
                <span v-if="form.enableWaterfall" class="feature-badge waterfall-badge">瀑布流</span>
                <span v-if="!form.enableSearchArea" class="feature-badge search-badge">搜索折叠</span>
              </div>
              
              <!-- 分组模式预览 -->
              <template v-if="form.enableGrouping">
                <!-- 第一个分组 -->
                <div class="preview-group">
                  <div class="group-header">
                    <h4 class="group-title">🏢 商务类</h4>
                    <span class="group-count">2个</span>
                  </div>
                  <div :class="`preview-domain-list ${form.layoutTemplate}-layout`">
                    <div class="preview-domain-item">
                      <div class="domain-name">shop.com</div>
                      <div class="domain-price" v-if="form.showPrice">¥8,888</div>
                      <div class="domain-desc" v-if="form.showDescription">商务首选</div>
                      <div class="domain-tags" v-if="form.showTags">
                        <span class="tag">商务</span>
                      </div>
                    </div>
                    <div class="preview-domain-item">
                      <div class="domain-name">business.net</div>
                      <div class="domain-price" v-if="form.showPrice">¥6,666</div>
                      <div class="domain-desc" v-if="form.showDescription">企业专用</div>
                      <div class="domain-tags" v-if="form.showTags">
                        <span class="tag">企业</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- 第二个分组 -->
                <div class="preview-group">
                  <div class="group-header">
                    <h4 class="group-title">💻 科技类</h4>
                    <span class="group-count">1个</span>
                  </div>
                  <div :class="`preview-domain-list ${form.layoutTemplate}-layout`">
                    <div class="preview-domain-item">
                      <div class="domain-name">tech.org</div>
                      <div class="domain-price" v-if="form.showPrice">¥3,999</div>
                      <div class="domain-desc" v-if="form.showDescription">科技创新</div>
                      <div class="domain-tags" v-if="form.showTags">
                        <span class="tag">科技</span>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              
              <!-- 普通模式预览 -->
              <template v-else>
                <!-- 列表布局 -->
              <div v-if="form.layoutTemplate === 'list'" class="preview-domain-list list-layout">
                <div class="preview-domain-item">
                  <div class="domain-name">example.com</div>
                  <div class="domain-price" v-if="form.showPrice">¥8,888</div>
                  <div class="domain-desc" v-if="form.showDescription">优质域名，值得拥有</div>
                  <div class="domain-tags" v-if="form.showTags">
                    <span class="tag">精品</span>
                    <span class="tag">推荐</span>
                  </div>
                </div>
                <div class="preview-domain-item">
                  <div class="domain-name">shop.net</div>
                  <div class="domain-price" v-if="form.showPrice">¥6,666</div>
                  <div class="domain-desc" v-if="form.showDescription">商务首选域名</div>
                  <div class="domain-tags" v-if="form.showTags">
                    <span class="tag">热门</span>
                  </div>
                </div>
                <div class="preview-domain-item">
                  <div class="domain-name">tech.org</div>
                  <div class="domain-price" v-if="form.showPrice">¥3,999</div>
                  <div class="domain-desc" v-if="form.showDescription">科技类域名</div>
                  <div class="domain-tags" v-if="form.showTags">
                    <span class="tag">新品</span>
                  </div>
                </div>
              </div>
              
              <!-- 网格布局 -->
              <div v-else-if="form.layoutTemplate === 'grid'" class="preview-domain-list grid-layout">
                <div class="preview-domain-item">
                  <div class="domain-name">example.com</div>
                  <div class="domain-price" v-if="form.showPrice">¥8,888</div>
                  <div class="domain-desc" v-if="form.showDescription">优质域名</div>
                  <div class="domain-tags" v-if="form.showTags">
                    <span class="tag">精品</span>
                  </div>
                </div>
                <div class="preview-domain-item">
                  <div class="domain-name">shop.net</div>
                  <div class="domain-price" v-if="form.showPrice">¥6,666</div>
                  <div class="domain-desc" v-if="form.showDescription">商务首选</div>
                  <div class="domain-tags" v-if="form.showTags">
                    <span class="tag">热门</span>
                  </div>
                </div>
                <div class="preview-domain-item">
                  <div class="domain-name">tech.org</div>
                  <div class="domain-price" v-if="form.showPrice">¥3,999</div>
                  <div class="domain-desc" v-if="form.showDescription">科技类</div>
                  <div class="domain-tags" v-if="form.showTags">
                    <span class="tag">新品</span>
                  </div>
                </div>
                <div class="preview-domain-item">
                  <div class="domain-name">blog.io</div>
                  <div class="domain-price" v-if="form.showPrice">¥2,888</div>
                  <div class="domain-desc" v-if="form.showDescription">博客专用</div>
                  <div class="domain-tags" v-if="form.showTags">
                    <span class="tag">特价</span>
                  </div>
                </div>
              </div>
              
              <!-- 表格布局 -->
              <div v-else-if="form.layoutTemplate === 'table'" class="preview-domain-list table-layout">
                <div class="table-header">
                  <div class="col-domain">域名</div>
                  <div class="col-price" v-if="form.showPrice">价格</div>
                  <div class="col-desc" v-if="form.showDescription">描述</div>
                  <div class="col-tags" v-if="form.showTags">标签</div>
                </div>
                <div class="table-row">
                  <div class="col-domain">example.com</div>
                  <div class="col-price" v-if="form.showPrice">¥8,888</div>
                  <div class="col-desc" v-if="form.showDescription">优质域名</div>
                  <div class="col-tags" v-if="form.showTags"><span class="tag">精品</span></div>
                </div>
                <div class="table-row">
                  <div class="col-domain">shop.net</div>
                  <div class="col-price" v-if="form.showPrice">¥6,666</div>
                  <div class="col-desc" v-if="form.showDescription">商务首选</div>
                  <div class="col-tags" v-if="form.showTags"><span class="tag">热门</span></div>
                </div>
                <div class="table-row">
                  <div class="col-domain">tech.org</div>
                  <div class="col-price" v-if="form.showPrice">¥3,999</div>
                  <div class="col-desc" v-if="form.showDescription">科技类</div>
                  <div class="col-tags" v-if="form.showTags"><span class="tag">新品</span></div>
                </div>
              </div>
              
              <!-- 卡片布局 -->
              <div v-else-if="form.layoutTemplate === 'card'" class="preview-domain-list card-layout">
                <div class="preview-domain-card">
                  <div class="card-header">
                    <div class="domain-name">example.com</div>
                    <div class="domain-price" v-if="form.showPrice">¥8,888</div>
                  </div>
                  <div class="card-body">
                    <div class="domain-desc" v-if="form.showDescription">优质域名，值得拥有</div>
                    <div class="domain-tags" v-if="form.showTags">
                      <span class="tag">精品</span>
                      <span class="tag">推荐</span>
                    </div>
                  </div>
                </div>
                <div class="preview-domain-card">
                  <div class="card-header">
                    <div class="domain-name">shop.net</div>
                    <div class="domain-price" v-if="form.showPrice">¥6,666</div>
                  </div>
                  <div class="card-body">
                    <div class="domain-desc" v-if="form.showDescription">商务首选域名</div>
                    <div class="domain-tags" v-if="form.showTags">
                      <span class="tag">热门</span>
                    </div>
                  </div>
                </div>
                <div class="preview-domain-card">
                  <div class="card-header">
                    <div class="domain-name">tech.org</div>
                    <div class="domain-price" v-if="form.showPrice">¥3,999</div>
                  </div>
                  <div class="card-body">
                    <div class="domain-desc" v-if="form.showDescription">科技类域名</div>
                    <div class="domain-tags" v-if="form.showTags">
                      <span class="tag">新品</span>
                    </div>
                  </div>
                </div>
                             </div>
               </template>
               
               <!-- 瀑布流预览效果 -->
               <div v-if="form.enableWaterfall" class="waterfall-preview">
                 <div class="waterfall-loading-demo">
                   <div class="loading-indicator">
                     <el-icon class="is-loading"><Loading /></el-icon>
                     <span>正在加载更多...</span>
                   </div>
                 </div>
               </div>
               
               <!-- 传统分页预览 -->
               <div v-else class="pagination-preview">
                 <div class="pagination-demo">
                   <span class="page-btn">1</span>
                   <span class="page-btn active">2</span>
                   <span class="page-btn">3</span>
                 </div>
               </div>
               
               <div class="preview-footer-info" v-if="form.footerInfo">
                 {{ form.footerInfo }}
               </div>
             </div>
           </div>
         </div>
        
        <!-- 右侧表单区域 -->
        <div style="flex: 1; overflow-y: auto;padding-right: 10px;">
          <el-form ref="portfolioRef" :model="form" :rules="rules" label-width="110px">
            <el-form-item label="米表名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入米表名称" />
            </el-form-item>
            <el-form-item label="URL标识符" prop="slug">
              <el-input v-model="form.slug" placeholder="请输入URL标识符" />
            </el-form-item>
            <el-form-item label="布局模板" prop="layoutTemplate">
              <el-select v-model="form.layoutTemplate" style="width: 100%">
                <el-option
                  v-for="template in layoutTemplates"
                  :key="template.value"
                  :label="template.label"
                  :value="template.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="分组设置" prop="enableGrouping">
              <el-radio-group v-model="form.enableGrouping">
                <el-radio :label="false">关闭分组</el-radio>
                <el-radio :label="true">开启分组</el-radio>
              </el-radio-group>
            </el-form-item>
            <div style="font-size: 12px; color: #666; margin-top: -16px; margin-bottom: 18px; margin-left: 120px;">
              开启后将按域名分类进行分组展示
            </div>
            <el-form-item label="瀑布流设置" prop="enableWaterfall">
              <el-radio-group v-model="form.enableWaterfall">
                <el-radio :label="false">关闭瀑布流</el-radio>
                <el-radio :label="true">开启瀑布流</el-radio>
              </el-radio-group>
            </el-form-item>
            <div style="font-size: 12px; color: #666; margin-top: -16px; margin-bottom: 18px; margin-left: 120px;">
              开启后将自动加载更多内容，不显示分页按钮
            </div>
            <el-form-item label="米表主题" prop="colorTheme">
              <el-select v-model="form.colorTheme" placeholder="选择米表主题风格" style="width: 100%">
                <el-option
                  v-for="theme in colorThemes"
                  :key="theme.value"
                  :label="theme.label"
                  :value="theme.value"
                >
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>{{ theme.label }}</span>
                    <span style="color: #999; font-size: 12px;">{{ theme.description }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>

            <!-- 视觉配置 Section -->
            <el-divider content-position="left">
              <span style="color: #f56c6c; font-weight: 600;">🎨 视觉配置</span>
            </el-divider>

            <el-form-item label="网站Logo">
              <div style="display: flex; flex-direction: column; gap: 12px;">
                <el-upload
                  class="logo-uploader"
                  action="/api/admin/upload/image"
                  :show-file-list="false"
                  :on-success="handleLogoSuccess"
                  :before-upload="beforeLogoUpload"
                  accept="image/*"
                >
                  <img v-if="form.logoUrl" :src="form.logoUrl" class="logo-preview" />
                  <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
                </el-upload>
                <div style="display: flex; gap: 8px;">
                  <el-button v-if="form.logoUrl" size="small" type="danger" @click="clearLogo">清除Logo</el-button>
                  <div style="font-size: 12px; color: #666; flex: 1;">
                    推荐尺寸：180x60px，支持 JPG、PNG、GIF 格式，文件大小不超过 2MB
                  </div>
                </div>
              </div>
            </el-form-item>

            <el-form-item label="背景图片">
              <div style="display: flex; flex-direction: column; gap: 12px;">
                <el-upload
                  class="background-uploader"
                  action="/api/admin/upload/image"
                  :show-file-list="false"
                  :on-success="handleBackgroundSuccess"
                  :before-upload="beforeBackgroundUpload"
                  accept="image/*"
                >
                  <img v-if="form.backgroundUrl" :src="form.backgroundUrl" class="background-preview" />
                  <div v-else class="background-uploader-placeholder">
                    <el-icon class="background-uploader-icon"><Plus /></el-icon>
                    <div class="background-uploader-text">点击上传背景图片</div>
                  </div>
                </el-upload>
                <div style="display: flex; gap: 8px;">
                  <el-button v-if="form.backgroundUrl" size="small" type="danger" @click="clearBackground">清除背景</el-button>
                  <div style="font-size: 12px; color: #666; flex: 1;">
                    推荐尺寸：1920x1080px，支持 JPG、PNG 格式，文件大小不超过 5MB
                  </div>
                </div>
              </div>
            </el-form-item>

            <el-form-item label="文字颜色" prop="textTheme">
              <el-radio-group v-model="form.textTheme">
                <el-radio label="auto">自动适应</el-radio>
                <el-radio label="light">浅色文字</el-radio>
                <el-radio label="dark">深色文字</el-radio>
              </el-radio-group>
              <div style="font-size: 12px; color: #666; margin-top: 4px;">
                选择文字颜色以确保在不同背景下的可读性。自动适应会根据背景添加适当的对比效果。
              </div>
            </el-form-item>

            <el-form-item label="背景遮罩" prop="backgroundOverlay">
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <el-switch v-model="form.backgroundOverlay" />
                <div style="font-size: 12px; color: #666; line-height: 1.5;">
                  为背景图添加半透明遮罩，提升文字可读性
                </div>
              </div>
            </el-form-item>

            <el-form-item label="设置选项">
              <div style="display: flex; flex-direction: row; gap: 8px;">
                <el-checkbox v-model="form.showPrice">显示价格</el-checkbox>
                <el-checkbox v-model="form.showDescription">显示描述</el-checkbox>
                <el-checkbox v-model="form.showTags">显示标签</el-checkbox>
              </div>
            </el-form-item>
            <el-form-item label="搜索区域" prop="enableSearchArea">
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <el-switch v-model="form.enableSearchArea" />
                <div style="font-size: 12px; color: #666; line-height: 1.5;">
                  关闭后，搜索区域将折叠为小图标，用户点击后展开
                </div>
              </div>
            </el-form-item>

            <!-- 头部配置 Section -->
            <el-divider content-position="left">
              <span style="color: #409eff; font-weight: 600;">🔝 头部配置</span>
            </el-divider>
            
            <el-form-item label="头部页面菜单" prop="headerPages">
              <el-select 
                v-model="form.headerPages" 
                multiple 
                placeholder="选择要在头部显示的页面"
                style="width: 100%"
                :loading="staticPagesLoading"
              >
                <el-option
                  v-for="page in staticPagesList"
                  :key="page.id"
                  :label="page.title"
                  :value="page.id"
                >
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>{{ page.title }}</span>
                    <span style="color: #999; font-size: 12px;">/{{ page.slug }}</span>
                  </div>
                </el-option>
              </el-select>
              <div style="font-size: 12px; color: #666; margin-top: 4px;">
                选中的页面将作为头部导航菜单显示
              </div>
            </el-form-item>

            <el-form-item label="头部简介信息" prop="headerInfo">
              <el-input 
                v-model="form.headerInfo" 
                type="textarea" 
                :rows="2"
                placeholder="头部简介文本（纯文本）"
              />
            </el-form-item>

            <el-form-item label="头部富文本" prop="headerRichText">
              <el-input 
                v-model="form.headerRichText" 
                type="textarea" 
                :rows="6"
                placeholder="头部富文本内容（支持HTML）"
              />
              <div style="font-size: 12px; color: #666; margin-top: 4px;">
                支持HTML标签，可用于添加图片、链接等富媒体内容
              </div>
            </el-form-item>

            <!-- 尾部配置 Section -->
            <el-divider content-position="left">
              <span style="color: #67c23a; font-weight: 600;">🔽 尾部配置</span>
            </el-divider>

            <el-form-item label="尾部页面链接" prop="footerPages">
              <el-select 
                v-model="form.footerPages" 
                multiple 
                placeholder="选择要在尾部显示的页面"
                style="width: 100%"
                :loading="staticPagesLoading"
              >
                <el-option
                  v-for="page in staticPagesList"
                  :key="page.id"
                  :label="page.title"
                  :value="page.id"
                >
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>{{ page.title }}</span>
                    <span style="color: #999; font-size: 12px;">/{{ page.slug }}</span>
                  </div>
                </el-option>
              </el-select>
              <div style="font-size: 12px; color: #666; margin-top: 4px;">
                选中的页面将作为尾部链接显示
              </div>
            </el-form-item>

            <el-form-item label="尾部版权信息" prop="footerInfo">
              <el-input 
                v-model="form.footerInfo" 
                type="textarea" 
                :rows="2"
                placeholder="尾部版权信息（纯文本）"
              />
            </el-form-item>

            <el-form-item label="尾部富文本" prop="footerRichText">
              <el-input 
                v-model="form.footerRichText" 
                type="textarea" 
                :rows="6"
                placeholder="尾部富文本内容（支持HTML）"
              />
              <div style="font-size: 12px; color: #666; margin-top: 4px;">
                支持HTML标签，可用于添加联系信息、社交媒体链接等
              </div>
            </el-form-item>

            <!-- SEO配置 Section -->
            <el-divider content-position="left">
              <span style="color: #e6a23c; font-weight: 600;">🔍 SEO配置</span>
            </el-divider>

            <el-form-item label="SEO标题" prop="seoTitle">
              <el-input 
                v-model="form.seoTitle" 
                placeholder="页面标题，用于搜索引擎显示（建议50-60字符）"
                maxlength="255"
                show-word-limit
              />
              <div style="font-size: 12px; color: #666; margin-top: 4px;">
                如果不填写，将使用"米表名称 - 优质域名出售"作为默认标题
              </div>
            </el-form-item>

            <el-form-item label="SEO描述" prop="seoDescription">
              <el-input 
                v-model="form.seoDescription" 
                type="textarea" 
                :rows="3"
                placeholder="页面描述，用于搜索引擎摘要显示（建议120-160字符）"
                maxlength="500"
                show-word-limit
              />
              <div style="font-size: 12px; color: #666; margin-top: 4px;">
                简洁描述米表内容，吸引用户点击
              </div>
            </el-form-item>

            <el-form-item label="SEO关键词" prop="seoKeywords">
              <el-input 
                v-model="form.seoKeywords" 
                placeholder="关键词，用英文逗号分隔，如：域名出售,优质域名,domain,出售"
                maxlength="500"
                show-word-limit
              />
              <div style="font-size: 12px; color: #666; margin-top: 4px;">
                使用英文逗号分隔，建议5-10个相关关键词
              </div>
            </el-form-item>

            <!-- 社交媒体配置 -->
            <el-divider content-position="left">
              <span style="color: #909399; font-weight: 600;">📱 社交媒体</span>
            </el-divider>

            <el-form-item label="分享标题" prop="ogTitle">
              <el-input 
                v-model="form.ogTitle" 
                placeholder="社交媒体分享时显示的标题"
                maxlength="255"
                show-word-limit
              />
              <div style="font-size: 12px; color: #666; margin-top: 4px;">
                用于微信、微博、Facebook等平台分享，如不填写将使用SEO标题
              </div>
            </el-form-item>

            <el-form-item label="分享描述" prop="ogDescription">
              <el-input 
                v-model="form.ogDescription" 
                type="textarea" 
                :rows="2"
                placeholder="社交媒体分享时显示的描述"
                maxlength="300"
                show-word-limit
              />
              <div style="font-size: 12px; color: #666; margin-top: 4px;">
                如不填写将使用SEO描述
              </div>
            </el-form-item>

            <el-form-item label="分享图片" prop="ogImage">
              <div style="display: flex; flex-direction: column; gap: 12px;">
                <el-upload
                  class="og-image-uploader"
                  action="/api/admin/upload/image"
                  :show-file-list="false"
                  :on-success="handleOgImageSuccess"
                  :before-upload="beforeOgImageUpload"
                  accept="image/*"
                >
                  <img v-if="form.ogImage" :src="form.ogImage" class="og-image-preview" />
                  <div v-else class="og-image-uploader-placeholder">
                    <el-icon class="og-image-uploader-icon"><Plus /></el-icon>
                    <div class="og-image-uploader-text">点击上传分享图片</div>
                  </div>
                </el-upload>
                <div style="display: flex; gap: 8px;">
                  <el-button v-if="form.ogImage" size="small" type="danger" @click="clearOgImage">清除图片</el-button>
                  <div style="font-size: 12px; color: #666; flex: 1;">
                    推荐尺寸：1200x630px，用于社交媒体分享预览
                  </div>
                </div>
              </div>
            </el-form-item>

            <el-form-item label="Twitter卡片" prop="twitterCard">
              <el-select v-model="form.twitterCard" style="width: 100%">
                <el-option label="摘要" value="summary" />
                <el-option label="大图摘要" value="summary_large_image" />
              </el-select>
              <div style="font-size: 12px; color: #666; margin-top: 4px;">
                选择在Twitter分享时的卡片样式
              </div>
            </el-form-item>

            <!-- 统计代码配置 -->
            <el-divider content-position="left">
              <span style="color: #67c23a; font-weight: 600;">📊 网站统计</span>
            </el-divider>

            <el-form-item label="统计代码" prop="analyticsCode">
              <el-input 
                v-model="form.analyticsCode" 
                type="textarea" 
                :rows="6"
                placeholder="请输入Google Analytics、百度统计或其他统计工具的代码"
              />
              <div style="font-size: 12px; color: #666; margin-top: 4px;">
                支持Google Analytics (gtag.js)、百度统计、友盟等统计代码。代码将插入到页面头部。
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-checkbox style="margin-right: 30px;" v-model="form.isDefault">设为默认米表</el-checkbox>
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
</template>

<script setup lang="js">
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Loading } from '@element-plus/icons-vue'
import { 
  LAYOUT_TEMPLATES, 
  COLOR_THEMES, 
  getTemplateLabel,
  getThemeLabel
} from '~/utils/constants.js'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  portfolioData: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'success'])

// Refs
const portfolioRef = ref()

// 响应式数据
const open = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const title = computed(() => props.portfolioData ? '修改米表' : '添加米表')

const staticPagesList = ref([])
const staticPagesLoading = ref(false)

// 表单数据
const form = ref({
  id: null,
  name: null,
  slug: null,
  isDefault: false,
  layoutTemplate: 'list',
  colorTheme: 'lavender',
  enableGrouping: false,
  enableWaterfall: false,
  logoUrl: null,
  backgroundUrl: null,
  textTheme: 'auto',
  backgroundOverlay: false,
  headerInfo: null,
  headerPages: [],
  headerRichText: null,
  footerInfo: null,
  footerPages: [],
  footerRichText: null,
  // SEO配置
  seoTitle: null,
  seoDescription: null,
  seoKeywords: null,
  ogTitle: null,
  ogDescription: null,
  ogImage: null,
  twitterCard: 'summary',
  analyticsCode: null,
  showPrice: true,
  showDescription: false,
  showTags: false,
  enableSearchArea: true
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '米表名称不能为空', trigger: 'blur' },
    { min: 2, max: 50, message: '名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  slug: [
    { required: true, message: 'URL标识符不能为空', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9-_]+$/, message: 'URL标识符只能包含字母、数字、横线和下划线', trigger: 'blur' }
  ]
}

// 选项数据
const layoutTemplates = ref(LAYOUT_TEMPLATES)
const colorThemes = ref(COLOR_THEMES)

// 方法
// getTemplateLabel 和 getThemeLabel 函数已从 utils/constants.js 导入

// 初始化表单数据
function initFormData() {
  if (props.portfolioData) {
    form.value = {...props.portfolioData}
  } else {
    reset()
  }
}

// Logo上传成功处理
function handleLogoSuccess(res, file) {
  if (res.code === 200) {
    form.value.logoUrl = res.data.url
    ElMessage.success('Logo上传成功')
  } else {
    ElMessage.error(res.message || 'Logo上传失败')
  }
}

// Logo上传前校验
function beforeLogoUpload(file) {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('上传文件只能是图片格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 清除Logo
function clearLogo() {
  form.value.logoUrl = null
}

// 背景图上传成功处理
function handleBackgroundSuccess(res, file) {
  if (res.code === 200) {
    form.value.backgroundUrl = res.data.url
    ElMessage.success('背景图上传成功')
  } else {
    ElMessage.error(res.message || '背景图上传失败')
  }
}

// 背景图上传前校验
function beforeBackgroundUpload(file) {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('上传文件只能是图片格式!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('上传图片大小不能超过 5MB!')
    return false
  }
  return true
}

// 清除背景图
function clearBackground() {
  form.value.backgroundUrl = null
}

// 分享图片上传成功处理
function handleOgImageSuccess(res, file) {
  if (res.code === 200) {
    form.value.ogImage = res.data.url
    ElMessage.success('分享图片上传成功')
  } else {
    ElMessage.error(res.message || '分享图片上传失败')
  }
}

// 分享图片上传前校验
function beforeOgImageUpload(file) {
  const isImage = file.type.startsWith('image/')
  const isLt3M = file.size / 1024 / 1024 < 3

  if (!isImage) {
    ElMessage.error('上传文件只能是图片格式!')
    return false
  }
  if (!isLt3M) {
    ElMessage.error('上传图片大小不能超过 3MB!')
    return false
  }
  return true
}

// 清除分享图片
function clearOgImage() {
  form.value.ogImage = null
}

// 取消按钮
function cancel() {
  open.value = false
}

// 提交按钮
function submitForm() {
  portfolioRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        const response = await $fetch('/api/admin/portfolio/save', {
          method: 'POST',
          body: form.value
        })
        
        if (response.code === 200) {
          ElMessage.success(response.message || '操作成功')
          emit('success')
          open.value = false
        } else {
          ElMessage.error(response.message || '操作失败')
        }
      } catch (error) {
        console.error('保存失败:', error)
        ElMessage.error('保存失败')
      }
    }
  })
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    name: null,
    slug: null,
    isDefault: false,
    layoutTemplate: 'list',
    colorTheme: 'lavender',
    enableGrouping: false,
    enableWaterfall: false,
    logoUrl: null,
    backgroundUrl: null,
    textTheme: 'auto',
    backgroundOverlay: false,
    headerInfo: null,
    headerPages: [],
    headerRichText: null,
    footerInfo: null,
    footerPages: [],
    footerRichText: null,
    // SEO配置
    seoTitle: null,
    seoDescription: null,
    seoKeywords: null,
    ogTitle: null,
    ogDescription: null,
    ogImage: null,
    twitterCard: 'summary',
    analyticsCode: null,
    showPrice: true,
    showDescription: false,
    showTags: false,
    enableSearchArea: true
  }
  portfolioRef.value?.resetFields()
}

// 获取静态页面列表
async function getStaticPages() {
  staticPagesLoading.value = true
  try {
    const response = await $fetch('/api/admin/static-pages/list', {
      query: {
        page: 1,
        limit: 100, // 获取所有页面用于选择
        status: 'published' // 只获取已发布的页面
      }
    })
    
    if (response.code === 200) {
      staticPagesList.value = response.data.staticPages || []
    }
  } catch (error) {
    console.error('获取静态页面列表失败:', error)
  } finally {
    staticPagesLoading.value = false
  }
}

// 监听弹窗开启，初始化数据
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    initFormData()
    getStaticPages()
  }
})

// 组件暴露的方法，供父组件调用
defineExpose({
  reset,
  getStaticPages
})
</script>
<style scoped>
/* 主题预览样式 */
.theme-preview {
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  font-size: 12px;
  height: 420px;
  overflow-y: auto;
}

.preview-header {
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-logo {
  font-weight: bold;
  font-size: 16px;
}

.preview-nav {
  display: flex;
  gap: 15px;
}

.preview-nav span {
  font-size: 12px;
  color: #666;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.preview-content {
  padding: 15px;
}

.preview-header-info {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  font-size: 12px;
  color: #666;
}

.preview-domain-list {
  space-y: 10px;
}

.preview-domain-item {
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  margin-bottom: 8px;
}

.domain-name {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 6px;
}

.domain-price {
  color: #e74c3c;
  font-weight: bold;
  margin-bottom: 4px;
}

.domain-desc {
  color: #666;
  font-size: 11px;
  margin-bottom: 6px;
}

.domain-tags {
  display: flex;
  gap: 6px;
}

.domain-tags .tag {
  background: #f0f0f0;
  color: #666;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
}

.preview-footer-info {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  margin-top: 15px;
  font-size: 12px;
  color: #666;
}

/* 布局标识 */
.layout-indicator {
  margin-bottom: 12px;
  text-align: center;
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}

.layout-badge {
  background: rgba(0, 0, 0, 0.1);
  color: #666;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
}

.feature-badge {
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 9px;
  font-weight: bold;
}

.grouping-badge {
  background: #e8f4fd;
  color: #1976d2;
}

.waterfall-badge {
  background: #f0f9ff;
  color: #0891b2;
}

.search-badge {
  background: #fef3e2;
  color: #ea580c;
}

/* 分组预览样式 */
.preview-group {
  margin-bottom: 20px;
}

.preview-group .group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e6e6e6;
  margin-bottom: 10px;
}

.preview-group .group-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.preview-group .group-count {
  font-size: 10px;
  color: #666;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 8px;
}

/* 瀑布流和分页预览样式 */
.waterfall-preview, .pagination-preview {
  text-align: center;
  padding: 12px 0;
  margin-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.waterfall-loading-demo .loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #1976d2;
  font-size: 11px;
}

.waterfall-loading-demo .el-icon {
  font-size: 14px;
}

.pagination-demo {
  display: flex;
  justify-content: center;
  gap: 4px;
}

.pagination-demo .page-btn {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e1e8ed;
  background: white;
  color: #666;
  border-radius: 3px;
  font-size: 10px;
  cursor: pointer;
}

.pagination-demo .page-btn.active {
  background: #1976d2;
  color: white;
  border-color: #1976d2;
}

/* 列表布局样式 */
.list-layout {
  /* 默认样式，已经在 .preview-domain-item 中定义 */
}

/* 网格布局样式 */
.grid-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.grid-layout .preview-domain-item {
  padding: 8px;
  font-size: 11px;
}

.grid-layout .domain-name {
  font-size: 12px;
  margin-bottom: 4px;
}

.grid-layout .domain-desc {
  font-size: 10px;
  margin-bottom: 4px;
}

.grid-layout .domain-tags .tag {
  font-size: 9px;
  padding: 1px 4px;
}

/* 表格布局样式 */
.table-layout {
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  overflow: hidden;
}

.table-header {
  display: flex;
  background: #f5f5f5;
  font-weight: bold;
  font-size: 11px;
  border-bottom: 1px solid #e6e6e6;
}

.table-row {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
  font-size: 11px;
}

.table-row:last-child {
  border-bottom: none;
}

.table-header > div,
.table-row > div {
  padding: 8px 6px;
  border-right: 1px solid #f0f0f0;
}

.table-header > div:last-child,
.table-row > div:last-child {
  border-right: none;
}

.col-domain {
  flex: 2;
  font-weight: bold;
}

.col-price {
  flex: 1;
  color: #e74c3c;
  font-weight: bold;
}

.col-desc {
  flex: 2;
  color: #666;
}

.col-tags {
  flex: 1;
}

.table-layout .tag {
  font-size: 9px;
  padding: 1px 4px;
}

/* 卡片布局样式 */
.card-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.preview-domain-card {
  border: 1px solid #e6e6e6;
  border-radius: 6px;
  overflow: hidden;
  font-size: 11px;
}

.card-header {
  background: #f8f9fa;
  padding: 8px 10px;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header .domain-name {
  font-weight: bold;
  font-size: 12px;
  margin: 0;
}

.card-header .domain-price {
  color: #e74c3c;
  font-weight: bold;
  margin: 0;
}

.card-body {
  padding: 8px 10px;
}

.card-body .domain-desc {
  font-size: 10px;
  margin-bottom: 6px;
}

.card-body .domain-tags {
  margin: 0;
}

.card-body .domain-tags .tag {
  font-size: 9px;
  padding: 1px 4px;
}
 
/* 🌊 海洋蓝主题 */
.theme-ocean {
  background: linear-gradient(135deg, #e3f2fd 0%, #f1f8e9 100%);
}

.theme-ocean .preview-header {
  background: linear-gradient(135deg, #2196f3 0%, #4caf50 100%);
  color: white;
}

.theme-ocean .preview-logo {
  color: white;
}

.theme-ocean .preview-nav span {
  color: rgba(255, 255, 255, 0.8);
}

.theme-ocean .preview-nav span:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.theme-ocean .domain-price {
  color: #1976d2;
}

.theme-ocean .domain-tags .tag {
  background: #e3f2fd;
  color: #1976d2;
}

/* 🌿 森林绿主题 */
.theme-forest {
  background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%);
}

.theme-forest .preview-header {
  background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);
  color: white;
}

.theme-forest .preview-logo {
  color: white;
}

.theme-forest .preview-nav span {
  color: rgba(255, 255, 255, 0.8);
}

.theme-forest .preview-nav span:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.theme-forest .domain-price {
  color: #388e3c;
}

.theme-forest .domain-tags .tag {
  background: #e8f5e8;
  color: #388e3c;
}

/* 🌅 暖阳橙主题 */
.theme-sunset {
  background: linear-gradient(135deg, #fff3e0 0%, #ffecb3 100%);
}

.theme-sunset .preview-header {
  background: linear-gradient(135deg, #ff9800 0%, #ffc107 100%);
  color: white;
}

.theme-sunset .preview-logo {
  color: white;
}

.theme-sunset .preview-nav span {
  color: rgba(255, 255, 255, 0.8);
}

.theme-sunset .preview-nav span:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.theme-sunset .domain-price {
  color: #f57c00;
}

.theme-sunset .domain-tags .tag {
  background: #fff3e0;
  color: #f57c00;
}

/* 🌹 玫瑰红主题 */
.theme-rose {
  background: linear-gradient(135deg, #fce4ec 0%, #f3e5f5 100%);
}

.theme-rose .preview-header {
  background: linear-gradient(135deg, #e91e63 0%, #9c27b0 100%);
  color: white;
}

.theme-rose .preview-logo {
  color: white;
}

.theme-rose .preview-nav span {
  color: rgba(255, 255, 255, 0.8);
}

.theme-rose .preview-nav span:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.theme-rose .domain-price {
  color: #c2185b;
}

.theme-rose .domain-tags .tag {
  background: #fce4ec;
  color: #c2185b;
}

/* 💜 薰衣草主题 */
.theme-lavender {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
}

.theme-lavender .preview-header {
  background: linear-gradient(135deg, #9c27b0 0%, #673ab7 100%);
  color: white;
}

.theme-lavender .preview-logo {
  color: white;
}

.theme-lavender .preview-nav span {
  color: rgba(255, 255, 255, 0.8);
}

.theme-lavender .preview-nav span:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.theme-lavender .domain-price {
  color: #7b1fa2;
}

.theme-lavender .domain-tags .tag {
  background: #f3e5f5;
  color: #7b1fa2;
}

/* 🌃 暗夜黑主题 */
.theme-midnight {
  background: linear-gradient(135deg, #263238 0%, #37474f 100%);
  color: #eceff1;
}

.theme-midnight .preview-header {
  background: linear-gradient(135deg, #212121 0%, #424242 100%);
  color: #eceff1;
  border-bottom-color: #455a64;
}

.theme-midnight .preview-logo {
  color: #eceff1;
}

.theme-midnight .preview-nav span {
  color: #b0bec5;
}

.theme-midnight .preview-nav span:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #eceff1;
}

.theme-midnight .preview-domain-item,
.theme-midnight .preview-domain-card {
  background: #37474f;
  border-color: #455a64;
  color: #eceff1;
}

.theme-midnight .domain-price {
  color: #ffab91;
}

.theme-midnight .domain-desc {
  color: #b0bec5;
}

.theme-midnight .domain-tags .tag {
  background: #455a64;
  color: #b0bec5;
}

.theme-midnight .preview-header-info,
.theme-midnight .preview-footer-info {
  background: #455a64;
  color: #b0bec5;
}

.theme-midnight .layout-badge {
  background: rgba(255, 255, 255, 0.2);
  color: #b0bec5;
}

.theme-midnight .table-layout {
  border-color: #455a64;
}

.theme-midnight .table-header {
  background: #455a64;
  color: #eceff1;
  border-bottom-color: #546e7a;
}

.theme-midnight .table-row {
  background: #37474f;
  color: #eceff1;
  border-bottom-color: #455a64;
}

.theme-midnight .table-header > div,
.theme-midnight .table-row > div {
  border-right-color: #455a64;
}

.theme-midnight .card-header {
  background: #455a64;
  color: #eceff1;
  border-bottom-color: #546e7a;
}

.theme-midnight .card-body {
  background: #37474f;
  color: #eceff1;
}

/* 🌸 樱花粉主题 */
.theme-sakura {
  background: linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%);
}

.theme-sakura .preview-header {
  background: linear-gradient(135deg, #f48fb1 0%, #f06292 100%);
  color: white;
}

.theme-sakura .preview-logo {
  color: white;
}

.theme-sakura .preview-nav span {
  color: rgba(255, 255, 255, 0.8);
}

.theme-sakura .preview-nav span:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.theme-sakura .domain-price {
  color: #e91e63;
}

.theme-sakura .domain-tags .tag {
  background: #fce4ec;
  color: #e91e63;
}

/* 💎 翡翠绿主题 */
.theme-emerald {
  background: linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%);
}

.theme-emerald .preview-header {
  background: linear-gradient(135deg, #00695c 0%, #00796b 100%);
  color: white;
}

.theme-emerald .preview-logo {
  color: white;
}

.theme-emerald .preview-nav span {
  color: rgba(255, 255, 255, 0.8);
}

.theme-emerald .preview-nav span:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.theme-emerald .domain-price {
  color: #00695c;
}

.theme-emerald .domain-tags .tag {
  background: #e0f2f1;
  color: #00695c;
}

/* ✨ 琥珀金主题 */
.theme-amber {
  background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
}

.theme-amber .preview-header {
  background: linear-gradient(135deg, #ffa000 0%, #ff8f00 100%);
  color: white;
}

.theme-amber .preview-logo {
  color: white;
}

.theme-amber .preview-nav span {
  color: rgba(255, 255, 255, 0.8);
}

.theme-amber .preview-nav span:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.theme-amber .domain-price {
  color: #ff8f00;
}

.theme-amber .domain-tags .tag {
  background: #fff8e1;
  color: #ff8f00;
}
</style>
<style scoped lang="scss">
/* Logo上传组件样式 */
.logo-uploader {
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  width: 180px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-uploader:hover {
  border-color: #409eff;
  background-color: #f5f7fa;
}

.logo-uploader-icon {
  font-size: 24px;
  color: #8c939d;
  text-align: center;
}

.logo-preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 4px;
}

/* 背景图上传组件样式 */
.background-uploader {
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.background-uploader:hover {
  border-color: #409eff;
  background-color: #f5f7fa;
}

.background-uploader-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.background-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  margin-bottom: 8px;
}

.background-uploader-text {
  color: #8c939d;
  font-size: 14px;
}

.background-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

/* 分享图片上传组件样式 - 与Logo保持一致 */
.og-image-uploader {
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  width: 300px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.og-image-uploader:hover {
  border-color: #409eff;
  background-color: #f5f7fa;
}

.og-image-uploader-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.og-image-uploader-icon {
  font-size: 24px;
  color: #8c939d;
  margin-bottom: 8px;
}

.og-image-uploader-text {
  color: #8c939d;
  font-size: 14px;
}

.og-image-preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 4px;
}

/* 主题预览样式 */
.theme-preview {
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  font-size: 12px;
  height: 420px;
  overflow-y: auto;
}

.preview-header {
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-logo {
  font-weight: bold;
  font-size: 16px;
}

.preview-nav {
  display: flex;
  gap: 15px;
}

.preview-nav span {
  font-size: 12px;
  color: #666;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.preview-content {
  padding: 15px;
}

.preview-header-info {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  font-size: 12px;
  color: #666;
}

.layout-indicator {
  margin-bottom: 12px;
  text-align: center;
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}

.layout-badge {
  background: rgba(0, 0, 0, 0.1);
  color: #666;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
}

.feature-badge {
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 9px;
  font-weight: bold;
}

.grouping-badge {
  background: #e8f4fd;
  color: #1976d2;
}

.waterfall-badge {
  background: #f0f9ff;
  color: #0891b2;
}

.search-badge {
  background: #fef3e2;
  color: #ea580c;
}

.preview-domain-list {
  margin-bottom: 10px;
}

.preview-domain-item {
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  margin-bottom: 8px;
}

.domain-name {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 6px;
}

.domain-price {
  color: #e74c3c;
  font-weight: bold;
  margin-bottom: 4px;
}

.domain-desc {
  color: #666;
  font-size: 11px;
  margin-bottom: 6px;
}

.domain-tags {
  display: flex;
  gap: 6px;
}

.domain-tags .tag {
  background: #f0f0f0;
  color: #666;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
}

/* 网格布局 */
.grid-layout {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

/* 表格布局 */
.table-layout {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.table-header {
  display: flex;
  background: #f5f5f5;
  font-weight: bold;
  font-size: 11px;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
}

.table-row {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 11px;
}

.col-domain {
  flex: 2;
  padding: 0 8px;
}

.col-price {
  flex: 1;
  padding: 0 8px;
  color: #e74c3c;
  font-weight: bold;
}

.col-desc {
  flex: 2;
  padding: 0 8px;
  color: #666;
}

.col-tags {
  flex: 1;
  padding: 0 8px;
}

/* 卡片布局 */
.card-layout {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.preview-domain-card {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.card-header {
  background: #f9f9f9;
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
}

.card-body {
  padding: 8px 12px;
}

/* 分组预览 */
.preview-group {
  margin-bottom: 16px;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.group-title {
  margin: 0;
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.group-count {
  font-size: 12px;
  color: #666;
  background: #e9ecef;
  padding: 2px 8px;
  border-radius: 12px;
}

/* 瀑布流和分页预览 */
.waterfall-preview,
.pagination-preview {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.waterfall-loading-demo {
  text-align: center;
  padding: 20px;
  color: #666;
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
}

.pagination-demo {
  display: flex;
  justify-content: center;
  gap: 4px;
}

.page-btn {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.page-btn.active {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

.preview-footer-info {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
  font-size: 11px;
  color: #999;
}

.dialog-footer {
  text-align: right;
}
</style>