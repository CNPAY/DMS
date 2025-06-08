<template>
  <div class="app-container">
    <!-- 等待 Element Plus 加载 -->
    <div v-if="!elementPlusReady" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载界面...</p>
    </div>

    <!-- 仪表盘内容 -->
    <div v-else>
      <!-- 统计卡片 -->
      <div class="stats-grid">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon domain-icon">
              <svg-icon icon-class="server" size="32px" />
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ stats.totalDomains || 156 }}</div>
              <div class="stats-label">总域名数量</div>
            </div>
          </div>
        </el-card>

        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon portfolio-icon">
              <svg-icon icon-class="table" size="32px" />
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ stats.totalPortfolios || 24 }}</div>
              <div class="stats-label">投资组合</div>
            </div>
          </div>
        </el-card>

        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon inquiry-icon">
              <svg-icon icon-class="message" size="32px" />
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ stats.pendingInquiries || 8 }}</div>
              <div class="stats-label">待处理询价</div>
            </div>
          </div>
        </el-card>

        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon value-icon">
              <svg-icon icon-class="money" size="32px" />
            </div>
            <div class="stats-info">
              <div class="stats-number">¥{{ formatNumber(stats.totalValue || 2680000) }}</div>
              <div class="stats-label">总资产价值</div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 扩展统计卡片 -->
      <div class="stats-grid secondary">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon profit-icon">
              <svg-icon icon-class="trend" size="32px" />
            </div>
            <div class="stats-info">
              <div class="stats-number">¥{{ formatNumber(180000) }}</div>
              <div class="stats-label">本月净利润</div>
              <div class="stats-trend">
                <span class="trend-up">+18.5%</span>
              </div>
            </div>
          </div>
        </el-card>

        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon roi-icon">
              <svg-icon icon-class="success" size="32px" />
            </div>
            <div class="stats-info">
              <div class="stats-number">32.8%</div>
              <div class="stats-label">投资回报率</div>
              <div class="stats-trend">
                <span class="trend-up">+2.3%</span>
              </div>
            </div>
          </div>
        </el-card>

        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon sales-icon">
              <svg-icon icon-class="shopping" size="32px" />
            </div>
            <div class="stats-info">
              <div class="stats-number">15</div>
              <div class="stats-label">本月销售数</div>
              <div class="stats-trend">
                <span class="trend-up">+12</span>
              </div>
            </div>
          </div>
        </el-card>

        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon expire-icon">
              <svg-icon icon-class="warning" size="32px" />
            </div>
            <div class="stats-info">
              <div class="stats-number">23</div>
              <div class="stats-label">即将到期</div>
              <div class="stats-trend">
                <span class="trend-warning">30天内</span>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 图表面板 -->
      <div class="chart-panels">
        <!-- 第一行图表 - 4个图表 -->
        <div class="chart-row">
          <!-- 收入趋势图 -->
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>收入趋势</span>
                <div class="chart-controls">
                  <el-button-group size="small">
                    <el-button type="primary">月度</el-button>
                    <el-button>季度</el-button>
                    <el-button>年度</el-button>
                  </el-button-group>
                </div>
              </div>
            </template>
            <div class="chart-container">
              <EchartsLine 
                :data="revenueData"
                title="收入趋势"
                color="#667eea"
                :smooth="true"
                :area="true"
                height="220px"
              />
            </div>
          </el-card>


          <!-- 价格区间分布饼图 -->
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>价格区间分布</span>
                <div class="total-info">¥17.2k</div>
              </div>
            </template>
                                      <div class="chart-container">
              <EchartsPie 
                :data="priceDistributionData"
                title="价格区间分布"
                :center-text="{ value: '¥268万', label: '总价值' }"
                height="220px"
                :is-donut="true"

              />
            </div>
          </el-card>
          <!-- 域名投资K线图 - 压缩版 -->
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>域名投资K线</span>
                <div class="chart-controls">
                  <el-button-group size="small">
                    <el-button>日K</el-button>
                    <el-button type="primary">周K</el-button>
                    <el-button>月K</el-button>
                  </el-button-group>
                </div>
              </div>
            </template>
            <div class="chart-container">
              <EchartsKline 
                :data="klineData"
                title="域名投资K线"
                height="220px"
              />
            </div>
          </el-card>
          <!-- 月度销售柱状图 -->
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>月度销售统计</span>
                <div class="total-info">128个</div>
              </div>
            </template>
            <div class="chart-container">
              <EchartsBar 
                :data="salesData"
                title="月度销售统计"
                color="#667eea"
                height="220px"
              />
            </div>
          </el-card>
        </div>

        <!-- 第二行图表 - 4个图表 -->
        <div class="chart-row">
          <!-- 域名分布饼图 -->
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>域名分布</span>
                <div class="total-info">156个</div>
              </div>
            </template>
                                      <div class="chart-container">
              <EchartsPie 
                :data="domainDistributionData"
                title="域名分布"
                :center-text="{ value: '156', label: '总域名' }"
                height="220px"
                :is-donut="true"

              />
            </div>
          </el-card>


          <!-- 域名长度分布 -->
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>域名长度分布</span>
                <div class="chart-controls">
                  <el-button-group size="small">
                    <el-button type="primary">字符数</el-button>
                    <el-button>音节数</el-button>
                  </el-button-group>
                </div>
              </div>
            </template>
            <div class="chart-container">
              <EchartsHorizontalBar 
                :data="domainLengthData"
                title="域名长度分布"
                :color="['#667eea', '#f093fb', '#4facfe', '#43e97b', '#ff9a9e']"
                height="220px"
              />
            </div>
          </el-card>
          <!-- 投资回报环形图 -->
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>投资回报分析</span>
                <div class="total-info">32.8%</div>
              </div>
            </template>
                          <div class="chart-container">
              <EchartsPie 
                :data="roiAnalysisData"
                title="投资回报分析"
                :center-text="{ value: '32.8%', label: '总ROI' }"
                :is-donut="true"
                height="220px"
              />
            </div>
          </el-card>
          <!-- 续费率统计 -->
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>域名续费率</span>
                <div class="total-info">92.3%</div>
              </div>
            </template>
            <div class="chart-container">
              <div class="mock-renewal-chart">
                <div class="renewal-stats">
                  <div class="renewal-main">
                    <div class="renewal-value">92.3%</div>
                    <div class="renewal-label">总续费率</div>
                  </div>
                  <div class="renewal-trend">
                    <span class="trend-up">+2.1%</span>
                    <span class="trend-period">vs 上月</span>
                  </div>
                </div>
                <div class="renewal-breakdown">
                  <div class="renewal-category">
                    <div class="category-header">
                      <span class="category-name">COM域名</span>
                      <span class="category-rate">94.2%</span>
                    </div>
                    <div class="category-bar">
                      <div class="category-fill" style="width: 94.2%"></div>
                    </div>
                  </div>
                  <div class="renewal-category">
                    <div class="category-header">
                      <span class="category-name">CN域名</span>
                      <span class="category-rate">89.1%</span>
                    </div>
                    <div class="category-bar">
                      <div class="category-fill" style="width: 89.1%"></div>
                    </div>
                  </div>
                  <div class="renewal-category">
                    <div class="category-header">
                      <span class="category-name">NET域名</span>
                      <span class="category-rate">91.8%</span>
                    </div>
                    <div class="category-bar">
                      <div class="category-fill" style="width: 91.8%"></div>
                    </div>
                  </div>
                  <div class="renewal-category">
                    <div class="category-header">
                      <span class="category-name">其他</span>
                      <span class="category-rate">88.5%</span>
                    </div>
                    <div class="category-bar">
                      <div class="category-fill" style="width: 88.5%"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </div>


        <!-- 访客数据专栏 - 单独一行 -->
        <div class="chart-row visitor-row">
          <!-- 周度访问趋势 -->
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>周度访问趋势</span>
                <div class="chart-controls">
                  <el-button-group size="small">
                    <el-button type="primary">访问量</el-button>
                    <el-button>询价量</el-button>
                  </el-button-group>
                </div>
              </div>
            </template>
            <div class="chart-container">
              <EchartsLine 
                :data="visitorData"
                title="周度访问趋势"
                color="#4facfe"
                :smooth="true"
                :area="true"
                height="220px"
              />
            </div>
          </el-card>

          <!-- 地域分布柱状图 -->
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>地域访客分布</span>
                <div class="total-info">14.2k</div>
              </div>
            </template>
            <div class="chart-container">
              <EchartsBar 
                :data="regionData"
                title="地域访客分布"
                :color="['#667eea', '#f093fb', '#4facfe', '#43e97b', '#ff9a9e']"
                height="220px"
              />
            </div>
          </el-card>

          <!-- 流量来源分析 -->
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>流量来源分析</span>
                <div class="total-info">14.2k</div>
              </div>
            </template>
            <div class="chart-container">
              <EchartsPie 
                :data="trafficSourceData"
                title="流量来源分析"
                :center-text="{ value: '14.2k', label: '总访问' }"
                height="220px"
                :is-donut="true"
              />
            </div>
          </el-card>

          <!-- 访客行为热力图 -->
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>访客行为热力图</span>
                <div class="total-info">活跃度</div>
              </div>
            </template>
            <div class="chart-container">
              <EchartsHeatmap 
                :data="heatmapData"
                title="访客行为热力图"
                :x-axis-data="['8-10点', '10-12点', '12-14点', '14-16点', '16-18点']"
                :y-axis-data="['周一', '周二', '周三', '周四']"
                height="220px"
              />
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 设置管理后台布局和认证保护
definePageMeta({
  layout: 'admin',
  title: '仪表盘',
  middleware: 'auth',
  affix: true  // 固定标签，不允许关闭
})

// 使用智能 UI 库管理器
const { isElementPlusLoaded } = useUILibrary()

// 检查 Element Plus 是否准备就绪
const elementPlusReady = ref(false)

// 响应式数据
const stats = ref({
  totalDomains: 0,
  totalPortfolios: 0,
  pendingInquiries: 0,
  totalValue: 0
})

const monthlyProfit = ref(180000)
const monthlySales = ref(15)
const expiringDomains = ref(23)

const activities = ref<any[]>([])
const expiryAlerts = ref<any[]>([])
const loading = ref(true)

// ECharts 数据 - 改为从API获取
const domainDistributionData = ref<Array<{ name: string; value: number; color: string }>>([])
const priceDistributionData = ref<Array<{ name: string; value: number; color: string }>>([])
const roiAnalysisData = ref<Array<{ name: string; value: number; color: string }>>([])
const revenueData = ref<Array<{ name: string; value: number }>>([])
const salesData = ref<Array<{ name: string; value: number }>>([])
const klineData = ref<Array<{ name: string; data: [number, number, number, number]; volume: number }>>([])
const visitorData = ref<Array<{ name: string; value: number }>>([])
const domainLengthData = ref<Array<{ name: string; value: number }>>([])
const regionData = ref<Array<{ name: string; value: number }>>([])
const trafficSourceData = ref<Array<{ name: string; value: number; color: string }>>([])
const heatmapData = ref<Array<[number, number, number]>>([])

// 监听 Element Plus 加载状态
watch(() => isElementPlusLoaded(), (loaded) => {
  elementPlusReady.value = loaded
  if (loaded) {
    loadDashboardData()
  }
}, { immediate: true })

// 轮询检查 Element Plus 是否加载完成（备用方案）
onMounted(() => {
  const checkInterval = setInterval(() => {
    if (isElementPlusLoaded()) {
      elementPlusReady.value = true
      loadDashboardData()
      clearInterval(checkInterval)
    }
  }, 100)

  // 最多等待 5 秒
  setTimeout(() => {
    clearInterval(checkInterval)
  }, 5000)
})

// 加载仪表盘数据
async function loadDashboardData() {
  try {
    loading.value = true

    // 并发加载所有数据
    const [statsResponse, activitiesResponse, chartsResponse] = await Promise.all([
      $fetch('/api/admin/dashboard/stats'),
      $fetch('/api/admin/dashboard/activities?limit=8'),
      $fetch('/api/admin/dashboard/charts')
    ])

    // 处理统计数据
    if (statsResponse.code === 200) {
      stats.value = statsResponse.data
    }

    // 处理活动数据
    if (activitiesResponse.success) {
      activities.value = activitiesResponse.data.activities
      expiryAlerts.value = activitiesResponse.data.expiryAlerts
    }

    // 处理图表数据
    if (chartsResponse.success && 'data' in chartsResponse) {
      const data = chartsResponse.data
      domainDistributionData.value = data.domainDistribution || []
      priceDistributionData.value = data.priceDistribution || []
      roiAnalysisData.value = data.roiAnalysis || []
      revenueData.value = data.revenue || []
      salesData.value = data.sales || []
      klineData.value = data.kline || []
      visitorData.value = data.visitor || []
      domainLengthData.value = data.domainLength || []
      regionData.value = data.region || []
      trafficSourceData.value = data.trafficSource || []
      heatmapData.value = data.heatmap || []
    } else {
      // 如果API请求失败，使用默认数据
      loadFallbackData()
    }
  } catch (error) {
    console.error('加载仪表盘数据失败:', error)
    // 如果API请求失败，使用默认数据
    loadFallbackData()
  } finally {
    loading.value = false
  }
}

// 备用数据（API失败时使用）
function loadFallbackData() {
  domainDistributionData.value = [
    { name: '.COM域名', value: 68, color: '#667eea' },
    { name: '.CN域名', value: 45, color: '#f093fb' },
    { name: '.NET域名', value: 25, color: '#4facfe' },
    { name: '其他域名', value: 18, color: '#43e97b' }
  ]

  priceDistributionData.value = [
    { name: '1万以下', value: 45, color: '#667eea' },
    { name: '1-5万', value: 68, color: '#f093fb' },
    { name: '5-10万', value: 25, color: '#4facfe' },
    { name: '10万以上', value: 18, color: '#43e97b' }
  ]

  roiAnalysisData.value = [
    { name: '盈利域名', value: 132, color: '#67c23a' },
    { name: '持平域名', value: 16, color: '#e6a23c' },
    { name: '亏损域名', value: 8, color: '#f56c6c' }
  ]

  revenueData.value = [
    { name: '8月', value: 120000 },
    { name: '9月', value: 138000 },
    { name: '10月', value: 165000 },
    { name: '11月', value: 180000 },
    { name: '12月', value: 195000 },
    { name: '1月', value: 210000 }
  ]

  salesData.value = [
    { name: '8月', value: 15 },
    { name: '9月', value: 11 },
    { name: '10月', value: 20 },
    { name: '11月', value: 8 },
    { name: '12月', value: 17 },
    { name: '1月', value: 22 }
  ]

  klineData.value = [
    { name: 'Mon', data: [20, 34, 10, 38] as [number, number, number, number], volume: 15 },
    { name: 'Tue', data: [40, 35, 30, 45] as [number, number, number, number], volume: 12 },
    { name: 'Wed', data: [31, 38, 33, 44] as [number, number, number, number], volume: 18 },
    { name: 'Thu', data: [38, 15, 25, 42] as [number, number, number, number], volume: 10 },
    { name: 'Fri', data: [40, 28, 20, 35] as [number, number, number, number], volume: 8 },
    { name: 'Sat', data: [42, 48, 35, 50] as [number, number, number, number], volume: 20 },
    { name: 'Sun', data: [45, 52, 38, 55] as [number, number, number, number], volume: 16 }
  ]

  visitorData.value = [
    { name: '周一', value: 1200 },
    { name: '周二', value: 1850 },
    { name: '周三', value: 2400 },
    { name: '周四', value: 1680 },
    { name: '周五', value: 2800 },
    { name: '周六', value: 3200 },
    { name: '周日', value: 2950 }
  ]

  domainLengthData.value = [
    { name: '2-3字符', value: 18 },
    { name: '4-5字符', value: 32 },
    { name: '6-7字符', value: 43 },
    { name: '8-10字符', value: 25 },
    { name: '10字符以上', value: 14 }
  ]

  regionData.value = [
    { name: '华东', value: 4200 },
    { name: '华南', value: 3200 },
    { name: '华北', value: 2900 },
    { name: '华中', value: 2100 },
    { name: '华西', value: 1800 }
  ]

  trafficSourceData.value = [
    { name: '直接访问', value: 45, color: '#667eea' },
    { name: '搜索引擎', value: 32, color: '#f093fb' },
    { name: '社交媒体', value: 15, color: '#4facfe' },
    { name: '其他来源', value: 8, color: '#43e97b' }
  ]

  heatmapData.value = [
    [0, 0, 5], [0, 1, 8], [0, 2, 3], [0, 3, 6], [0, 4, 9],
    [1, 0, 7], [1, 1, 4], [1, 2, 9], [1, 3, 2], [1, 4, 6],
    [2, 0, 3], [2, 1, 7], [2, 2, 5], [2, 3, 8], [2, 4, 4],
    [3, 0, 8], [3, 1, 3], [3, 2, 6], [3, 3, 4], [3, 4, 7]
  ] as Array<[number, number, number]>
}

// 格式化数字
function formatNumber(value: number): string {
  if (value >= 10000) {
    return (value / 10000).toFixed(1) + 'w'
  }
  return value.toLocaleString()
}

// 格式化时间
function formatTime(): string {
  const now = new Date()
  return now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// 设置页面标题
useHead({
  title: '仪表盘 - DMS 管理后台'
})
</script>

<style scoped>
.app-container {
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--text-color-secondary);

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--border-color);
    border-top: 4px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
  margin-bottom: 24px;

  .stats-card {
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.3s ease;
    background: linear-gradient(145deg, #ffffff 0%, #fafbfc 100%);

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
      border-color: rgba(102, 126, 234, 0.2);
    }

    :deep(.el-card__body) {
      padding: 20px;
    }

    .stats-content {
      display: flex;
      align-items: center;
      gap: 16px;

      .stats-icon {
        font-size: 2.2rem;
        width: 56px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 14px;
        color: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

        &.domain-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        &.portfolio-icon {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        &.inquiry-icon {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        &.value-icon {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }
      }

      .stats-info {
        flex-grow: 1;

        .stats-number {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 2px;
          letter-spacing: -0.02em;
        }

        .stats-label {
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
          letter-spacing: -0.01em;
        }
      }
    }
  }
}

/* 扩展统计卡片 */
.stats-grid.secondary {
  margin-bottom: 24px;

  .stats-card {
    .stats-content {
      .stats-icon {
        &.profit-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        &.roi-icon {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }

        &.sales-icon {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        &.expire-icon {
          background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
        }
      }

      .stats-info {
        .stats-trend {
          margin-top: 6px;

          .trend-up {
            color: #10b981;
            font-size: 11px;
            font-weight: 600;
            background: rgba(16, 185, 129, 0.1);
            padding: 2px 6px;
            border-radius: 4px;
            letter-spacing: -0.01em;
          }

          .trend-down {
            color: #ef4444;
            font-size: 11px;
            font-weight: 600;
            background: rgba(239, 68, 68, 0.1);
            padding: 2px 6px;
            border-radius: 4px;
            letter-spacing: -0.01em;
          }

          .trend-warning {
            color: #f59e0b;
            font-size: 11px;
            font-weight: 600;
            background: rgba(245, 158, 11, 0.1);
            padding: 2px 6px;
            border-radius: 4px;
            letter-spacing: -0.01em;
          }
        }
      }
    }
  }
}

/* 图表面板 */
.chart-panels {
  .chart-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;

  }

  .chart-card {
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.3s ease;
    background: linear-gradient(145deg, #ffffff 0%, #fafbfc 100%);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
      border-color: rgba(102, 126, 234, 0.2);
    }

    &.full-width {
      grid-column: 1 / -1;
    }

    :deep(.el-card__header) {
      padding: 16px 20px 12px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      background: rgba(250, 251, 252, 0.8);
      border-radius: 12px 12px 0 0;
    }

    :deep(.el-card__body) {
      padding: 16px 20px 20px;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      span {
        font-size: 15px;
        font-weight: 600;
        color: #1a1a1a;
        letter-spacing: -0.02em;
      }

      .total-info {
        color: #6b7280;
        font-size: 13px;
        font-weight: 500;
        background: rgba(102, 126, 234, 0.1);
        padding: 4px 8px;
        border-radius: 6px;
        letter-spacing: -0.01em;
      }

      .chart-controls {
        .el-button-group {
          .el-button {
            font-size: 11px;
            padding: 4px 8px;
            font-weight: 500;

            &.is-active {
              background: #667eea;
              border-color: #667eea;
            }
          }
        }
      }
    }

    .chart-container {
      height: 240px;
      position: relative;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 8px;
      overflow: hidden;
    }
  }
}

/* 线图样式 */
.mock-line-chart {
  height: 100%;
  position: relative;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%);
  border-radius: 8px;
  padding: 16px 12px 32px;

  .chart-line {
    position: relative;
    height: calc(100% - 24px);

    .data-point {
      position: absolute;
      width: 7px;
      height: 7px;
      background: #667eea;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 3px 8px rgba(102, 126, 234, 0.3);
      transition: all 0.2s ease;

      &:hover {
        transform: scale(1.3);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5);
      }

      &::before {
        content: '';
        position: absolute;
        width: 2px;
        height: 100px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        left: 50%;
        top: 50%;
        transform: translateX(-50%);
        opacity: 0.2;
      }
    }
  }

  .chart-labels {
    position: absolute;
    bottom: 8px;
    left: 12px;
    right: 12px;
    display: flex;
    justify-content: space-around;
    font-size: 11px;
    color: #6b7280;
    font-weight: 500;
  }
}

/* 饼图样式 */
.mock-pie-chart {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;

  .pie-center {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: conic-gradient(#667eea 0deg 157deg,
        #f093fb 157deg 259deg,
        #4facfe 259deg 318deg,
        #43e97b 318deg 360deg);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

    &::before {
      content: '';
      position: absolute;
      width: 80px;
      height: 80px;
      background: white;
      border-radius: 50%;
      box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .center-value {
      font-size: 22px;
      font-weight: 800;
      color: #1a1a1a;
      z-index: 2;
      line-height: 1;
      letter-spacing: -0.02em;
    }

    .center-label {
      font-size: 11px;
      color: #6b7280;
      z-index: 2;
      margin-top: 4px;
      font-weight: 600;
      letter-spacing: 0.3px;
    }
  }

  .pie-annotations {
    position: absolute;
    width: 200px;
    height: 200px;
    left: -40px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;

    .annotation {
      position: absolute;

      &.com-annotation {
        top: 5%;
        left: 15%;
        
        .annotation-line::before {
          transform: rotate(-35deg);
          transform-origin: 0 50%;
        }
        
        .annotation-label {
          left: 55px;
          top: -8px;
        }
      }

      &.cn-annotation {
        top: 25%;
        right: 8%;
        
        .annotation-line::before {
          transform: rotate(25deg);
          transform-origin: 0 50%;
        }
        
        .annotation-line::after {
          left: 22px;
        }
        
        .annotation-label {
          right: 55px;
          top: -8px;
          left: auto;
        }
      }

      &.net-annotation {
        bottom: 25%;
        right: 12%;
        
        .annotation-line::before {
          transform: rotate(-25deg);
          transform-origin: 0 50%;
        }
        
        .annotation-line::after {
          left: 22px;
        }
        
        .annotation-label {
          right: 55px;
          top: -8px;
          left: auto;
        }
      }

      &.other-annotation {
        bottom: 8%;
        left: 20%;
        
        .annotation-line::before {
          transform: rotate(35deg);
          transform-origin: 0 50%;
        }
        
        .annotation-label {
          left: 55px;
          top: -8px;
        }
      }

      .annotation-line {
        position: relative;
        width: 50px;
        height: 1px;

        &::before {
          content: '';
          position: absolute;
          width: 30px;
          height: 1px;
          background: #9ca3af;
          top: 0;
          left: 0;
        }

        &::after {
          content: '';
          position: absolute;
          width: 25px;
          height: 1px;
          background: #9ca3af;
          top: 0;
          left: 25px;
        }
      }

      .annotation-label {
        position: absolute;
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid rgba(156, 163, 175, 0.3);
        border-radius: 4px;
        padding: 3px 7px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        white-space: nowrap;
        animation: fadeInScale 0.6s ease-out;
        backdrop-filter: blur(4px);

        .percent {
          font-size: 12px;
          font-weight: 700;
          color: #1f2937;
          display: block;
          line-height: 1.1;
          margin-bottom: 1px;
        }

        .desc {
          font-size: 10px;
          color: #6b7280;
          font-weight: 500;
        }
      }

      &.com-annotation .annotation-label { animation-delay: 0.1s; }
      &.cn-annotation .annotation-label { animation-delay: 0.2s; }
      &.net-annotation .annotation-label { animation-delay: 0.3s; }
      &.other-annotation .annotation-label { animation-delay: 0.4s; }
    }
  }

  .pie-legend {
    flex: 1;
    padding-left: 24px;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
      font-size: 13px;
      line-height: 1.4;
      transition: all 0.2s ease;

      &:hover {
        transform: translateX(2px);
      }

      .legend-color {
        width: 10px;
        height: 10px;
        border-radius: 2px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        flex-shrink: 0;
      }

      span:last-child {
        color: #374151;
        font-weight: 600;
        font-size: 12px;
        letter-spacing: -0.01em;
      }
    }
  }
}

/* K线图样式 */
.mock-kline-chart {
  height: 100%;
  position: relative;
  background: linear-gradient(to top, #f8f9fa 0%, #fff 100%);
  border-radius: 8px;
  padding: 20px;

  &.compact {
    padding: 15px;

    .kline-candles {
      height: 75%;

      .candle {
        width: 6px;
      }
    }

    .volume-bars {
      height: 15%;

      .volume-bar {
        width: 4px;
      }
    }
  }

  .kline-candles {
    height: 70%;
    position: relative;

    .candle {
      position: absolute;
      width: 8px;

      &.up {
        .candle-body {
          background: #67c23a;
          height: 60%;
          position: relative;
        }

        .candle-wick {
          width: 2px;
          height: 100%;
          background: #67c23a;
          position: absolute;
          left: 50%;
          top: 0;
          transform: translateX(-50%);
        }
      }

      &.down {
        .candle-body {
          background: #f56c6c;
          height: 60%;
          position: relative;
        }

        .candle-wick {
          width: 2px;
          height: 100%;
          background: #f56c6c;
          position: absolute;
          left: 50%;
          top: 0;
          transform: translateX(-50%);
        }
      }
    }
  }

  .volume-bars {
    height: 20%;
    position: absolute;
    bottom: 20px;
    left: 20px;
    right: 20px;

    .volume-bar {
      position: absolute;
      width: 6px;
      background: rgba(102, 126, 234, 0.3);
      bottom: 0;
    }
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes fadeInScale {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 柱状图样式 */
.mock-bar-chart {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px;

  .bar-container {
    display: flex;
    align-items: end;
    justify-content: space-around;
    height: 85%;
    gap: 8px;

    .bar {
      flex: 1;
      background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
      border-radius: 4px 4px 0 0;
      position: relative;
      min-height: 20px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        filter: brightness(1.1);
      }

      .bar-value {
        position: absolute;
        top: -20px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 12px;
        font-weight: 600;
        color: var(--text-color);
      }
    }
  }

  .bar-labels {
    display: flex;
    justify-content: space-around;
    margin-top: 10px;

    span {
      font-size: 12px;
      color: var(--text-color-secondary);
    }
  }
}

/* 第二个饼图样式 */
.mock-pie-chart-2 {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;

  .pie-center-2 {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: conic-gradient(#667eea 0deg 102deg,
        #f093fb 102deg 209deg,
        #4facfe 209deg 267deg,
        #43e97b 267deg 360deg);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

    &::before {
      content: '';
      position: absolute;
      width: 80px;
      height: 80px;
      background: white;
      border-radius: 50%;
      box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .center-value {
      font-size: 20px;
      font-weight: 800;
      color: #1a1a1a;
      z-index: 2;
      line-height: 1;
      letter-spacing: -0.02em;
    }

    .center-label {
      font-size: 11px;
      color: #6b7280;
      z-index: 2;
      margin-top: 4px;
      font-weight: 600;
      letter-spacing: 0.3px;
    }
  }

  .pie-annotations {
    position: absolute;
    width: 200px;
    height: 200px;
    left: -40px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;

    .annotation {
      position: absolute;

      &.low-price-annotation {
        top: 8%;
        left: 12%;
        
        .annotation-line::before {
          transform: rotate(-40deg);
          transform-origin: 0 50%;
        }
        
        .annotation-label {
          left: 55px;
          top: -8px;
        }
      }

      &.mid-price-annotation {
        top: 18%;
        right: 5%;
        
        .annotation-line::before {
          transform: rotate(30deg);
          transform-origin: 0 50%;
        }
        
        .annotation-line::after {
          left: 22px;
        }
        
        .annotation-label {
          right: 55px;
          top: -8px;
          left: auto;
        }
      }

      &.high-price-annotation {
        bottom: 18%;
        right: 8%;
        
        .annotation-line::before {
          transform: rotate(-30deg);
          transform-origin: 0 50%;
        }
        
        .annotation-line::after {
          left: 22px;
        }
        
        .annotation-label {
          right: 55px;
          top: -8px;
          left: auto;
        }
      }

      &.premium-price-annotation {
        bottom: 10%;
        left: 15%;
        
        .annotation-line::before {
          transform: rotate(40deg);
          transform-origin: 0 50%;
        }
        
        .annotation-label {
          left: 55px;
          top: -8px;
        }
      }

      .annotation-line {
        position: relative;
        width: 50px;
        height: 1px;

        &::before {
          content: '';
          position: absolute;
          width: 30px;
          height: 1px;
          background: #9ca3af;
          top: 0;
          left: 0;
        }

        &::after {
          content: '';
          position: absolute;
          width: 25px;
          height: 1px;
          background: #9ca3af;
          top: 0;
          left: 25px;
        }
      }

      .annotation-label {
        position: absolute;
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid rgba(156, 163, 175, 0.3);
        border-radius: 4px;
        padding: 3px 7px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        white-space: nowrap;
        animation: fadeInScale 0.6s ease-out;
        backdrop-filter: blur(4px);

        .percent {
          font-size: 12px;
          font-weight: 700;
          color: #1f2937;
          display: block;
          line-height: 1.1;
          margin-bottom: 1px;
        }

        .desc {
          font-size: 10px;
          color: #6b7280;
          font-weight: 500;
        }
      }

      &.low-price-annotation .annotation-label { animation-delay: 0.1s; }
      &.mid-price-annotation .annotation-label { animation-delay: 0.2s; }
      &.high-price-annotation .annotation-label { animation-delay: 0.3s; }
      &.premium-price-annotation .annotation-label { animation-delay: 0.4s; }
    }
  }

  .pie-legend {
    flex: 1;
    padding-left: 24px;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
      font-size: 13px;
      line-height: 1.4;
      transition: all 0.2s ease;

      &:hover {
        transform: translateX(2px);
      }

      .legend-color {
        width: 10px;
        height: 10px;
        border-radius: 2px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        flex-shrink: 0;
      }

      span:last-child {
        color: #374151;
        font-weight: 600;
        font-size: 12px;
        letter-spacing: -0.01em;
      }
    }
  }
}

/* 水平柱状图样式 */
.mock-horizontal-bar-chart {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 10px;

  .h-bar-item {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 6px 0;

    .h-bar-label {
      min-width: 80px;
      font-size: 12px;
      color: var(--text-color);
      text-align: right;
    }

    .h-bar-track {
      flex: 1;
      height: 20px;
      background: #f5f5f5;
      border-radius: 10px;
      overflow: hidden;
      position: relative;

      .h-bar-fill {
        height: 100%;
        border-radius: 10px;
        transition: width 0.8s ease;
        position: relative;

        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.3), transparent);
          border-radius: 10px;
        }
      }
    }

    .h-bar-value {
      min-width: 30px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-color);
      text-align: left;
    }
  }
}

/* 环形图样式 */
.mock-donut-chart {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;

  .donut-center {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: conic-gradient(#67c23a 0deg 306deg,
        #e6a23c 306deg 342deg,
        #f56c6c 342deg 360deg);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

    &::before {
      content: '';
      position: absolute;
      width: 60px;
      height: 60px;
      background: white;
      border-radius: 50%;
      box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .center-value {
      font-size: 20px;
      font-weight: 800;
      color: #1a1a1a;
      z-index: 2;
      line-height: 1;
      letter-spacing: -0.02em;
    }

    .center-label {
      font-size: 11px;
      color: #6b7280;
      z-index: 2;
      margin-top: 4px;
      font-weight: 600;
      letter-spacing: 0.3px;
    }
  }

  .donut-annotations {
    position: absolute;
    width: 180px;
    height: 180px;
    left: -30px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;

    .annotation {
      position: absolute;

      &.profit-annotation {
        top: 8%;
        right: 8%;
      }

      &.neutral-annotation {
        bottom: 25%;
        right: 5%;
      }

      &.loss-annotation {
        bottom: 8%;
        left: 12%;
      }

      .annotation-line {
        position: relative;

        .line-inner {
          width: 25px;
          height: 1px;
          background: #374151;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
        }

        .line-outer {
          width: 15px;
          height: 1px;
          background: #374151;
          position: absolute;
          top: 50%;
          left: 25px;
          transform: translateY(-50%);
        }
      }

      .annotation-label {
        position: absolute;
        left: 42px;
        top: 50%;
        transform: translateY(-50%);
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 4px 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        white-space: nowrap;
        animation: fadeInScale 0.6s ease-out;

        .percent {
          font-size: 11px;
          font-weight: 700;
          color: #1a1a1a;
          display: block;
          line-height: 1.2;
        }

        .desc {
          font-size: 9px;
          color: #6b7280;
          font-weight: 500;
        }
      }

      &.profit-annotation .annotation-label { animation-delay: 0.1s; }
      &.neutral-annotation .annotation-label { animation-delay: 0.2s; }
      &.loss-annotation .annotation-label { animation-delay: 0.3s; }
    }
  }

  .donut-legend {
    flex: 1;
    padding-left: 24px;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
      font-size: 13px;
      line-height: 1.4;
      transition: all 0.2s ease;

      &:hover {
        transform: translateX(2px);
      }

      .legend-color {
        width: 10px;
        height: 10px;
        border-radius: 2px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        flex-shrink: 0;
      }

      span:last-child {
        color: #374151;
        font-weight: 600;
        font-size: 12px;
        letter-spacing: -0.01em;
      }
    }
  }
}

/* 面积图样式 */
.mock-area-chart {
  height: 100%;
  position: relative;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%);
  border-radius: 8px;
  overflow: hidden;
  padding: 16px 12px 28px;

  .area-line {
    position: relative;
    height: calc(100% - 20px);

    .area-point {
      position: absolute;
      width: 5px;
      height: 5px;
      background: #667eea;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(102, 126, 234, 0.4);
      z-index: 3;
      transition: all 0.2s ease;

      &:hover {
        transform: scale(1.3);
        box-shadow: 0 3px 8px rgba(102, 126, 234, 0.6);
      }
    }
  }

  .area-fill {
    position: absolute;
    bottom: 28px;
    left: 12px;
    right: 12px;
    height: calc(60% - 8px);
    background: linear-gradient(to top, rgba(102, 126, 234, 0.15), rgba(102, 126, 234, 0.03));
    clip-path: polygon(10% 70%, 25% 55%, 40% 35%, 55% 45%, 70% 25%, 85% 20%, 100% 100%, 0% 100%);
    border-radius: 0 0 4px 4px;
  }

  .area-labels {
    position: absolute;
    bottom: 8px;
    left: 12px;
    right: 12px;
    display: flex;
    justify-content: space-around;
    font-size: 10px;
    color: #6b7280;
    font-weight: 500;
  }
}

/* 雷达图样式 */
.mock-radar-chart {
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  .radar-web {
    position: absolute;
    width: 150px;
    height: 150px;

    .radar-axis {
      position: absolute;
      width: 1px;
      height: 75px;
      background: rgba(0, 0, 0, 0.1);
      transform-origin: bottom center;
      left: 50%;
      bottom: 50%;

      &::before {
        content: '';
        position: absolute;
        width: 50px;
        height: 1px;
        background: rgba(0, 0, 0, 0.1);
        top: -25px;
        left: -25px;
      }

      &.radar-axis-1 {
        transform: translateX(-50%) rotate(0deg);
      }

      &.radar-axis-2 {
        transform: translateX(-50%) rotate(60deg);
      }

      &.radar-axis-3 {
        transform: translateX(-50%) rotate(120deg);
      }

      &.radar-axis-4 {
        transform: translateX(-50%) rotate(180deg);
      }

      &.radar-axis-5 {
        transform: translateX(-50%) rotate(240deg);
      }

      &.radar-axis-6 {
        transform: translateX(-50%) rotate(300deg);
      }
    }
  }

  .radar-data {
    position: absolute;
    width: 150px;
    height: 150px;

    .radar-point {
      position: absolute;
      width: 6px;
      height: 6px;
      background: #667eea;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }

  .radar-labels {
    position: absolute;
    width: 200px;
    height: 200px;

    .radar-label {
      position: absolute;
      font-size: 11px;
      color: var(--text-color-secondary);
      white-space: nowrap;
      transform: translate(-50%, -50%);
    }
  }
}

/* 热力图样式 */
.mock-heatmap-chart {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 18px 16px 14px;

  .heatmap-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 5px;
    flex: 1;
    align-content: center;
    padding: 4px;

    .heatmap-cell {
      aspect-ratio: 1;
      border-radius: 3px;
      position: relative;
      transition: all 0.2s ease;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

      &:hover {
        transform: scale(1.15);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        z-index: 1;
      }

      &.low {
        background: rgba(102, 126, 234, 0.25);
      }

      &.medium {
        background: rgba(102, 126, 234, 0.55);
      }

      &.high {
        background: rgba(102, 126, 234, 0.85);
      }
    }
  }

  .heatmap-legend {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 12px;
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

    .legend-text {
      font-size: 10px;
      color: #6b7280;
      font-weight: 500;
    }

    .legend-colors {
      display: flex;
      gap: 3px;

      .legend-color {
        width: 10px;
        height: 10px;
        border-radius: 2px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

        &.low {
          background: rgba(102, 126, 234, 0.25);
        }

        &.medium {
          background: rgba(102, 126, 234, 0.55);
        }

        &.high {
          background: rgba(102, 126, 234, 0.85);
        }
      }
    }
  }
}

/* 地域分布柱状图样式 */
.mock-region-chart {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px 12px 12px;

  .region-bars {
    display: flex;
    justify-content: space-between;
    align-items: end;
    height: 75%;
    gap: 8px;

    .region-bar-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;

      .region-bar {
        width: 100%;
        max-width: 32px;
        background: rgba(0, 0, 0, 0.03);
        border-radius: 6px 6px 2px 2px;
        position: relative;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        cursor: pointer;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .bar-gradient {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 100%;
          border-radius: 6px 6px 2px 2px;
          
          &.east {
            background: linear-gradient(180deg, #667eea 0%, #4facfe 100%);
          }
          
          &.south {
            background: linear-gradient(180deg, #f093fb 0%, #f5576c 100%);
          }
          
          &.north {
            background: linear-gradient(180deg, #43e97b 0%, #38f9d7 100%);
          }
          
          &.central {
            background: linear-gradient(180deg, #ff9a9e 0%, #fecfef 100%);
          }
          
          &.west {
            background: linear-gradient(180deg, #a8edea 0%, #fed6e3 100%);
          }
        }

        .bar-value {
          position: absolute;
          top: -24px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 11px;
          font-weight: 700;
          color: #1a1a1a;
          white-space: nowrap;
        }
      }

      .region-name {
        margin-top: 8px;
        font-size: 11px;
        font-weight: 600;
        color: #374151;
        text-align: center;
      }

      .region-percent {
        margin-top: 2px;
        font-size: 9px;
        color: #9ca3af;
        font-weight: 500;
      }
    }
  }

  .region-summary {
    margin-top: 16px;
    display: flex;
    justify-content: space-between;
    background: rgba(248, 250, 252, 0.8);
    border-radius: 8px;
    padding: 8px 12px;

    .summary-item {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .summary-label {
        font-size: 9px;
        color: #6b7280;
        font-weight: 500;
      }

      .summary-value {
        font-size: 11px;
        color: #1a1a1a;
        font-weight: 600;
      }
    }
  }
}

/* 第三个饼图样式 */
.mock-pie-chart-3 {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;

  .pie-center-3 {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    background: conic-gradient(#667eea 0deg 162deg,
        #f093fb 162deg 277deg,
        #4facfe 277deg 331deg,
        #43e97b 331deg 360deg);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    flex-shrink: 0;

    &::before {
      content: '';
      position: absolute;
      width: 72px;
      height: 72px;
      background: white;
      border-radius: 50%;
    }

    .center-value {
      font-size: 18px;
      font-weight: 700;
      color: #1a1a1a;
      z-index: 2;
      line-height: 1;
    }

    .center-label {
      font-size: 10px;
      color: #6b7280;
      z-index: 2;
      margin-top: 2px;
      font-weight: 500;
    }
  }

  .pie-legend {
    flex: 1;
    padding-left: 18px;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
      font-size: 12px;
      line-height: 1.3;

      &:last-child {
        margin-bottom: 0;
      }

      .legend-color {
        width: 8px;
        height: 8px;
        border-radius: 2px;
        flex-shrink: 0;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      span:last-child {
        color: #374151;
        font-weight: 500;
        font-size: 11px;
      }
    }
  }
}

/* 仪表盘样式 */
.mock-gauge-chart {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px 16px 16px;

  .gauge-container {
    position: relative;
    width: 120px;
    height: 120px;
    margin: 0 auto 16px;

    .gauge-arc {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: conic-gradient(from 135deg, #f3f4f6 0deg 180deg, transparent 180deg);
      position: relative;

      .gauge-fill {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: conic-gradient(from 135deg, #667eea 0deg, #43e97b 90deg, transparent 90deg);
        transform-origin: center;
      }
    }

    .gauge-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;

      .gauge-value {
        font-size: 24px;
        font-weight: 700;
        color: #1a1a1a;
        line-height: 1;
      }

      .gauge-label {
        font-size: 11px;
        color: #6b7280;
        margin-top: 4px;
        font-weight: 500;
      }
    }
  }

  .gauge-legend {
    display: flex;
    justify-content: center;
    gap: 20px;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #374151;

      .legend-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;

        &.success {
          background: #10b981;
        }

        &.failed {
          background: #ef4444;
        }
      }
    }
  }
}

/* 评分图表样式 */
.mock-rating-chart {
  height: 100%;
  display: flex;
  justify-content: space-between;
  padding: 16px 12px;

  .rating-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 100px;

    .rating-score {
      font-size: 36px;
      font-weight: 700;
      color: #1a1a1a;
      line-height: 1;
      margin-bottom: 8px;
    }

    .rating-stars {
      display: flex;
      gap: 2px;
      margin-bottom: 8px;

      .star {
        font-size: 16px;

        &.filled {
          color: #fbbf24;
        }

        &.half {
          color: #fbbf24;
          opacity: 0.5;
        }
      }
    }

    .rating-count {
      font-size: 10px;
      color: #6b7280;
      text-align: center;
      font-weight: 500;
    }
  }

  .rating-breakdown {
    flex: 1;
    padding-left: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .rating-item {
      display: flex;
      align-items: center;
      margin-bottom: 6px;
      gap: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      .rating-label {
        font-size: 10px;
        color: #6b7280;
        min-width: 20px;
        font-weight: 500;
      }

      .rating-bar {
        flex: 1;
        height: 6px;
        background: #f3f4f6;
        border-radius: 3px;
        overflow: hidden;

        .rating-fill {
          height: 100%;
          background: linear-gradient(90deg, #fbbf24, #f59e0b);
          border-radius: 3px;
          transition: width 0.8s ease;
        }
      }

      .rating-percent {
        font-size: 10px;
        color: #374151;
        min-width: 24px;
        text-align: right;
        font-weight: 500;
      }
    }
  }
}

/* 续费率图表样式 */
.mock-renewal-chart {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px 12px;

  .renewal-stats {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);

    .renewal-main {
      .renewal-value {
        font-size: 28px;
        font-weight: 700;
        color: #1a1a1a;
        line-height: 1;
      }

      .renewal-label {
        font-size: 11px;
        color: #6b7280;
        margin-top: 4px;
        font-weight: 500;
      }
    }

    .renewal-trend {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;

      .trend-up {
        color: #10b981;
        font-size: 14px;
        font-weight: 600;
      }

      .trend-period {
        font-size: 9px;
        color: #9ca3af;
        font-weight: 500;
      }
    }
  }

  .renewal-breakdown {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-around;

    .renewal-category {
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      .category-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;

        .category-name {
          font-size: 11px;
          color: #374151;
          font-weight: 500;
        }

        .category-rate {
          font-size: 11px;
          color: #1a1a1a;
          font-weight: 600;
        }
      }

      .category-bar {
        height: 8px;
        background: rgba(243, 244, 246, 0.8);
        border-radius: 4px;
        overflow: hidden;

        .category-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea, #43e97b);
          border-radius: 4px;
          transition: width 0.8s ease;
        }
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-container {
    padding: 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 20px;

    .stats-card {
      :deep(.el-card__body) {
        padding: 16px;
      }

      .stats-content {
        gap: 12px;

        .stats-icon {
          width: 48px;
          height: 48px;
          font-size: 1.8rem;
        }

        .stats-info {
          .stats-number {
            font-size: 1.5rem;
          }

          .stats-label {
            font-size: 0.8rem;
          }
        }
      }
    }
  }

  .chart-panels {
    .chart-row {
      grid-template-columns: 1fr;
      gap: 12px;
      margin-bottom: 12px;
    }

    .chart-card {
      :deep(.el-card__header) {
        padding: 12px 16px 8px;
      }

      :deep(.el-card__body) {
        padding: 12px 16px 16px;
      }

      .chart-header {
        span {
          font-size: 14px;
        }

        .total-info {
          font-size: 12px;
          padding: 3px 6px;
        }
      }

      .chart-container {
        height: 200px !important;
      }
    }
  }
}

@media (max-width: 1024px) and (min-width: 769px) {
  .app-container {
    padding: 20px;
  }

  .chart-panels {
    .chart-row {
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    .chart-card .chart-container {
      height: 220px;
    }
  }
}
</style>