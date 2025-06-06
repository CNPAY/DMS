<template>
  <div class="app-container">
    <!-- 搜索面板 -->
    <el-card v-show="showSearch" class="search-panel">
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="100px">
        <el-form-item label="米表名称" prop="name" style="width: 280px">
          <el-input v-model="queryParams.name" placeholder="请输入米表名称" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="URL标识符" prop="slug" style="width: 280px">
          <el-input v-model="queryParams.slug" placeholder="请输入URL标识符" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <el-row class="mb8" style="display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex;">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate">修改</el-button>
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
        <el-button type="warning" plain icon="Download" @click="handleExport">导出</el-button>
      </div>
      <div style="display: flex; gap: 10px;">
        <el-button circle @click="showSearch = !showSearch">
          <el-icon><Search /></el-icon>
        </el-button>
        <el-button circle @click="getList">
          <el-icon><Refresh /></el-icon>
        </el-button>
      </div>
    </el-row>

    <!-- 数据表格 -->
    <el-card>
      <el-table v-loading="loading" :data="portfolioList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="米表信息" align="center" min-width="200">
          <template #default="{ row }">
            <div style="font-weight: 600; text-align: left;">
              <div >
                {{ row.name }}
                <el-tag v-if="row.isDefault" type="success" size="small" style="margin-left: 8px">默认</el-tag>
              </div>
              <div style="font-size: 12px; color: #666;">/{{ row.slug }}</div>

            </div>
          </template>
        </el-table-column>
        <el-table-column label="数据" align="center" min-width="200">
          <template #default="{ row }">
          <div style="font-size: 11px; color: #999; margin-top: 2px;">
              {{ row.domainCount || 0 }} 个域名 | {{ row.inquiryCount || 0 }} 个线索
            </div>
          </template>
        </el-table-column>
        <el-table-column label="主题风格" align="center" min-width="140">
          <template #default="{ row }">
            <div style="text-align: center;">
              <el-tag :type="getTemplateTagType(row.layoutTemplate)" style="margin-bottom: 4px;">
                {{ getTemplateLabel(row.layoutTemplate) }}
              </el-tag>
              <div style="font-size: 12px; color: #666;">
                {{ getThemeLabel(row.colorTheme) }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
          <template #default="{ row }">
            <span>{{ formatDate(row.createdAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding" fixed="right" width="300">
          <template #default="scope">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
            <el-button link type="success" icon="Link" @click="handleAssociate(scope.row)">关联</el-button>
            <el-button 
              v-if="!scope.row.isDefault"
              link 
              type="warning" 
              icon="Star" 
              @click="handleSetDefault(scope.row)"
            >
              设为默认
            </el-button>
            <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-show="total > 0"
          :current-page="queryParams.pageNum"
          :page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 30, 40]"
          :total="total"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加或修改米表对话框 -->
    <el-dialog :title="title" v-model="open" width="1200px" append-to-body>
      <div style="display: flex; gap: 20px; height: 500px;">
        <!-- 左侧表单区域 -->
        <div style="flex: 1; overflow-y: auto;">
          <el-form ref="portfolioRef" :model="form" :rules="rules" label-width="120px">
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

            <el-form-item label="设置选项">
              <el-checkbox v-model="form.isDefault">设为默认米表</el-checkbox>
              <el-checkbox v-model="form.showPrice">显示价格</el-checkbox>
              <el-checkbox v-model="form.showDescription">显示描述</el-checkbox>
              <el-checkbox v-model="form.showTags">显示标签</el-checkbox>
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
          </el-form>
        </div>
        
        <!-- 右侧预览区域 -->
        <div style="width: 350px; border-left: 1px solid #e6e6e6; padding-left: 20px;">
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
              </div>
              
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
              
              <div class="preview-footer-info" v-if="form.footerInfo">
                {{ form.footerInfo }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 关联域名对话框 -->
    <el-dialog title="关联域名" v-model="associateOpen" width="600px" append-to-body>
      <div style="margin-bottom: 20px; padding: 12px; background-color: #f5f7fa; border-radius: 4px; color: #666;">
        <strong>米表：</strong>{{ associateForm.portfolioName }}
      </div>
      
      <el-form ref="associateRef" :model="associateForm" label-width="120px">
        <el-form-item label="关联分类" prop="categories">
          <el-select v-model="associateForm.categories" multiple placeholder="选择要关联的域名分类" style="width: 100%">
            <el-option
              v-for="category in domainCategories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
          <div style="font-size: 12px; color: #999; margin-top: 4px;">
            选择分类后，查询米表域名时将自动包含该分类下的所有域名
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitAssociate">确 定</el-button>
          <el-button @click="cancelAssociate">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

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
}

.layout-badge {
  background: rgba(0, 0, 0, 0.1);
  color: #666;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
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

/* 🌙 月光白主题 */
.theme-moonlight {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.theme-moonlight .preview-header {
  background: #ffffff;
  border-bottom-color: #e9ecef;
}

.theme-moonlight .preview-logo {
  color: #2c3e50;
}

.theme-moonlight .preview-nav span:hover {
  background: #e9ecef;
  color: #495057;
}

.theme-moonlight .preview-domain-item {
  background: #ffffff;
  border-color: #e9ecef;
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

<script setup name="Portfolio">
import { ElMessage, ElMessageBox } from 'element-plus'

definePageMeta({
  layout: 'admin',
  title: '米表管理',
  middleware: 'auth'
})

useHead({
  title: '米表管理 - DMS 管理后台'
})

// refs
const queryRef = ref()
const portfolioRef = ref()

// 响应式数据
const portfolioList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')

// 静态页面相关数据
const staticPagesList = ref([])
const staticPagesLoading = ref(false)

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    slug: null
  },
  rules: {
    name: [
      { required: true, message: '米表名称不能为空', trigger: 'blur' },
      { min: 2, max: 50, message: '名称长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    slug: [
      { required: true, message: 'URL标识符不能为空', trigger: 'blur' },
      { pattern: /^[a-zA-Z0-9-_]+$/, message: 'URL标识符只能包含字母、数字、横线和下划线', trigger: 'blur' }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

// 选项数据
const layoutTemplates = ref([
  { value: 'list', label: '列表布局' },
  { value: 'grid', label: '网格布局' },
  { value: 'table', label: '表格布局' },
  { value: 'card', label: '卡片布局' }
])

const colorThemes = ref([
  { value: 'moonlight', label: '🌙 月光白', description: '简约纯净风格' },
  { value: 'ocean', label: '🌊 海洋蓝', description: '清新专业风格' },
  { value: 'forest', label: '🌿 森林绿', description: '自然生机风格' },
  { value: 'sunset', label: '🌅 暖阳橙', description: '温暖活力风格' },
  { value: 'rose', label: '🌹 玫瑰红', description: '优雅浪漫风格' },
  { value: 'lavender', label: '💜 薰衣草', description: '梦幻柔美风格' },
  { value: 'midnight', label: '🌃 暗夜黑', description: '深沉神秘风格' },
  { value: 'sakura', label: '🌸 樱花粉', description: '清雅甜美风格' },
  { value: 'emerald', label: '💎 翡翠绿', description: '典雅高贵风格' },
  { value: 'amber', label: '✨ 琥珀金', description: '奢华品质风格' }
])

// 域名分类和域名数据
const domainCategories = ref([])
const availableDomains = ref([])

// 关联对话框相关数据
const associateOpen = ref(false)
const associateForm = ref({
  portfolioId: null,
  portfolioName: '',
  categories: []
})
const associateRef = ref()

// 方法
function getTemplateLabel(template) {
  const templateMap = {
    list: '列表',
    grid: '网格', 
    table: '表格',
    card: '卡片'
  }
  return templateMap[template] || template
}

function getTemplateTagType(template) {
  const typeMap = {
    list: '',
    grid: 'success',
    table: 'info',
    card: 'warning'
  }
  return typeMap[template] || ''
}

function getThemeLabel(themeValue) {
  const theme = colorThemes.value.find(t => t.value === themeValue)
  return theme ? theme.label : '🌙 月光白'
}

function formatDate(date) {
  return new Date(date).toLocaleString('zh-CN')
}

// 获取米表列表
async function getList() {
  loading.value = true
  try {
    const response = await $fetch('/api/admin/portfolio/list', {
      query: {
        page: queryParams.value.pageNum,
        pageSize: queryParams.value.pageSize,
        keyword: queryParams.value.name || queryParams.value.slug
      }
    })
    
    if (response.code === 200) {
      portfolioList.value = response.data.list
      total.value = response.data.total || 0
    } else {
      ElMessage.error(response.message || '获取米表列表失败')
    }
  } catch (error) {
    console.error('获取米表列表失败:', error)
    ElMessage.error('获取米表列表失败')
  } finally {
    loading.value = false
  }
}

// 获取选项数据
async function loadOptions() {
  try {
    const response = await $fetch('/api/admin/portfolio/options')
    if (response.code === 200) {
      domainCategories.value = response.data.categories || []
      availableDomains.value = response.data.domains || []
    }
  } catch (error) {
    console.error('获取选项数据失败:', error)
  }
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

// 表单重置
function reset() {
  form.value = {
    id: null,
    name: null,
    slug: null,
    isDefault: false,
    layoutTemplate: 'list',
    colorTheme: 'moonlight',
    headerInfo: null,
    headerPages: [],
    headerRichText: null,
    footerInfo: null,
    footerPages: [],
    footerRichText: null,
    showPrice: true,
    showDescription: false,
    showTags: false
  }
  portfolioRef.value?.resetFields()
}

// 搜索按钮操作
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

// 重置按钮操作
function resetQuery() {
  queryRef.value?.resetFields()
  handleQuery()
}

// 列表多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

// 新增按钮操作
function handleAdd() {
  reset()
  getStaticPages() // 获取静态页面列表
  open.value = true
  title.value = '添加米表'
}

// 修改按钮操作
async function handleUpdate(row) {
  reset()
  getStaticPages() // 获取静态页面列表
  
  if (row) {
    // 直接设置表单数据
    form.value = { 
      id: row.id,
      name: row.name,
      slug: row.slug,
      isDefault: row.isDefault,
      layoutTemplate: row.layoutTemplate,
      colorTheme: row.colorTheme,
      headerInfo: row.headerInfo,
      headerPages: row.headerPages ? JSON.parse(row.headerPages) : [],
      headerRichText: row.headerRichText,
      footerInfo: row.footerInfo,
      footerPages: row.footerPages ? JSON.parse(row.footerPages) : [],
      footerRichText: row.footerRichText,
      showPrice: row.showPrice,
      showDescription: row.showDescription,
      showTags: row.showTags
    }
  } else {
    // 批量修改时的处理（暂时不实现）
    const selectedRow = portfolioList.value.find(item => ids.value.includes(item.id))
    if (selectedRow) {
      form.value = { 
        id: selectedRow.id,
        name: selectedRow.name,
        slug: selectedRow.slug,
        isDefault: selectedRow.isDefault,
        layoutTemplate: selectedRow.layoutTemplate,
        colorTheme: selectedRow.colorTheme,
        headerInfo: selectedRow.headerInfo,
        headerPages: selectedRow.headerPages ? JSON.parse(selectedRow.headerPages) : [],
        headerRichText: selectedRow.headerRichText,
        footerInfo: selectedRow.footerInfo,
        footerPages: selectedRow.footerPages ? JSON.parse(selectedRow.footerPages) : [],
        footerRichText: selectedRow.footerRichText,
        showPrice: selectedRow.showPrice,
        showDescription: selectedRow.showDescription,
        showTags: selectedRow.showTags
      }
    }
  }
  
  open.value = true
  title.value = '修改米表'
}

// 关联按钮操作
async function handleAssociate(row) {
  try {
    // 获取详细信息
    const response = await $fetch(`/api/admin/portfolio/${row.id}`)
    if (response.code === 200) {
      const data = response.data
      associateForm.value = {
        portfolioId: data.id,
        portfolioName: data.name,
        categories: data.relatedCategories?.map(c => c.id) || []
      }
      associateOpen.value = true
    }
  } catch (error) {
    ElMessage.error('获取米表详情失败')
  }
}

// 设为默认米表按钮操作
async function handleSetDefault(row) {
  try {
    await ElMessageBox.confirm(
      `确认将"${row.name}"设为默认米表吗？设置后将取消其他米表的默认状态。`,
      '确认设置',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await $fetch('/api/admin/portfolio/set-default', {
      method: 'POST',
      body: { 
        portfolioId: row.id
      }
    })
    
    if (response.code === 200) {
      ElMessage.success('设置成功')
      getList() // 刷新列表
    } else {
      ElMessage.error(response.message || '设置失败')
    }
  } catch (error) {
    if (error === 'cancel') return
    console.error('设置默认米表失败:', error)
    ElMessage.error('设置失败')
  }
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
          open.value = false
          getList()
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

// 关联保存按钮
function submitAssociate() {
  associateRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        const response = await $fetch('/api/admin/portfolio/associate', {
          method: 'POST',
          body: {
            portfolioId: associateForm.value.portfolioId,
            categories: associateForm.value.categories
          }
        })
        
        if (response.code === 200) {
          ElMessage.success('关联成功')
          associateOpen.value = false
          getList()
        } else {
          ElMessage.error(response.message || '关联失败')
        }
      } catch (error) {
        console.error('关联失败:', error)
        ElMessage.error('关联失败')
      }
    }
  })
}

// 关联取消按钮
function cancelAssociate() {
  associateOpen.value = false
  associateForm.value = {
    portfolioId: null,
    portfolioName: '',
    categories: []
  }
}

// 取消按钮
function cancel() {
  open.value = false
  reset()
}

// 删除按钮操作
async function handleDelete(row) {
  const portfolioIds = row?.id || ids.value
  const portfolioNames = Array.isArray(portfolioIds) 
    ? portfolioList.value.filter(item => portfolioIds.includes(item.id)).map(item => item.name).join('、')
    : row?.name

  try {
    await ElMessageBox.confirm(
      `是否确认删除米表"${portfolioNames}"？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await $fetch('/api/admin/portfolio/delete', {
      method: 'POST',
      body: { 
        ids: Array.isArray(portfolioIds) ? portfolioIds : [portfolioIds]
      }
    })
    
    if (response.code === 200) {
      ElMessage.success('删除成功')
    } else {
      ElMessage.error(response.message || '删除失败')
    }

    getList()
  } catch (error) {
    if (error === 'cancel') return
    console.error('删除米表失败:', error)
    ElMessage.error('删除失败')
  }
}

// 导出按钮操作
function handleExport() {
  console.log('导出功能暂未实现')
  ElMessage.info('导出功能开发中...')
}

// 分页-每页大小改变
function handleSizeChange(val) {
  queryParams.value.pageSize = val
  getList()
}

// 分页-当前页改变
function handleCurrentChange(val) {
  queryParams.value.pageNum = val
  getList()
}

// 初始化
getList()
loadOptions()
</script>

<style scoped lang="scss">
.dialog-footer {
  text-align: right;
}
</style> 