<template>
  <div class="app-container">
    <el-card class="filter-container">
      <div class="filter-item">
        <el-form :inline="true" :model="queryParams" ref="queryForm" size="small">
          <el-form-item label="数据类型">
            <el-select v-model="queryParams.dataType" placeholder="请选择数据类型">
              <el-option label="域名访问统计" value="domain" />
              <el-option label="米表访问统计" value="portfolio" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="域名" v-if="queryParams.dataType === 'domain'">
            <el-select v-model="queryParams.domainId" placeholder="请选择域名" filterable clearable>
              <el-option v-for="item in domainOptions" :key="item.id" :label="item.domainName" :value="item.id" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="米表" v-if="queryParams.dataType === 'portfolio'">
            <el-select v-model="queryParams.portfolioId" placeholder="请选择米表" filterable clearable>
              <el-option v-for="item in portfolioOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="时间段">
            <el-date-picker
              :value="dateRange"
              @input="$emit('update:dateRange', $event)"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd"
              :picker-options="pickerOptions"
            />
          </el-form-item>
          
          <el-form-item label="时间粒度">
            <el-select v-model="queryParams.period" placeholder="请选择">
              <el-option label="按天" value="day" />
              <el-option label="按周" value="week" />
              <el-option label="按月" value="month" />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
            <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    
    <el-row :gutter="20" class="mt-20">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div slot="header">
            <span>总访问量(PV)</span>
          </div>
          <div class="stat-value">{{ totalStats.pageViews }}</div>
          <div class="stat-desc">页面浏览量</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div slot="header">
            <span>独立访客(UV)</span>
          </div>
          <div class="stat-value">{{ totalStats.uniqueVisitors }}</div>
          <div class="stat-desc">不重复访问者数量</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div slot="header">
            <span>线索数量</span>
          </div>
          <div class="stat-value">{{ totalStats.inquiryCount }}</div>
          <div class="stat-desc">收到的询价数量</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div slot="header">
            <span>转化率</span>
          </div>
          <div class="stat-value">{{ totalStats.conversionRate }}%</div>
          <div class="stat-desc">线索数/访问量</div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="mt-20">
      <el-col :span="24">
        <el-card shadow="hover">
          <div slot="header">
            <span>访问趋势</span>
          </div>
          <div class="chart-container">
            <div id="visitTrendChart" style="width: 100%; height: 400px"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="mt-20">
      <el-col :span="8">
        <el-card shadow="hover">
          <div slot="header">
            <span>设备分布</span>
          </div>
          <div class="chart-container">
            <div id="deviceChart" style="width: 100%; height: 300px"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div slot="header">
            <span>地域分布</span>
          </div>
          <div class="chart-container">
            <div id="geoChart" style="width: 100%; height: 300px"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div slot="header">
            <span>流量来源</span>
          </div>
          <div class="chart-container">
            <div id="refererChart" style="width: 100%; height: 300px"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="mt-20">
      <el-col :span="24">
        <el-card shadow="hover">
          <div slot="header">
            <span>访问明细数据</span>
          </div>
          <el-table
            v-loading="loading"
            :data="visitData"
            border
            style="width: 100%"
          >
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column prop="pageViews" label="访问量(PV)" width="120" />
            <el-table-column prop="uniqueVisitors" label="独立访客(UV)" width="120" />
            <el-table-column prop="inquiryCount" label="线索数量" width="120" />
            <el-table-column prop="conversionRate" label="转化率">
              <template slot-scope="scope">
                {{ scope.row.conversionRate }}%
              </template>
            </el-table-column>
          </el-table>
          
          <div class="pagination-container">
            <el-pagination
              background
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="queryParams.pageNum"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="queryParams.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 异常检测弹窗 -->
    <el-dialog title="访问异常检测" :visible.sync="anomalyDialogVisible" width="60%">
      <el-alert
        v-if="anomalyList.length > 0"
        title="系统检测到以下访问异常波动，请注意查看"
        type="warning"
        :closable="false"
        show-icon
      />
      <el-alert
        v-else
        title="未检测到访问异常波动"
        type="success"
        :closable="false"
        show-icon
      />
      <el-table
        v-if="anomalyList.length > 0"
        :data="anomalyList"
        border
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="domainName" label="域名" width="180" />
        <el-table-column label="访问量变化" width="200">
          <template slot-scope="scope">
            <div>
              <span>{{ scope.row.pageViews.previous }} → {{ scope.row.pageViews.current }}</span>
              <span :class="['change-rate', scope.row.pageViews.change > 0 ? 'positive' : 'negative']">
                ({{ scope.row.pageViews.change > 0 ? '+' : '' }}{{ scope.row.pageViews.change }}%)
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="线索量变化" width="200">
          <template slot-scope="scope">
            <div>
              <span>{{ scope.row.inquiries.previous }} → {{ scope.row.inquiries.current }}</span>
              <span :class="['change-rate', scope.row.inquiries.change > 0 ? 'positive' : 'negative']">
                ({{ scope.row.inquiries.change > 0 ? '+' : '' }}{{ scope.row.inquiries.change }}%)
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="严重程度">
          <template slot-scope="scope">
            <el-tag :type="getSeverityType(scope.row.severity)">{{ getSeverityLabel(scope.row.severity) }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script lang="tsx" setup>
import * as echarts from 'echarts'

const props = defineProps({
  // 查询参数
  queryParams: {
    type: Object,
    default: () => ({
      dataType: 'domain',
      domainId: undefined,
      portfolioId: undefined,
      period: 'day',
      startDate: undefined,
      endDate: undefined,
      pageNum: 1,
      pageSize: 10
    })
  },
  // 日期范围
  dateRange: {
    type: Array,
    default: []
  },
  // 日期选择器选项
  pickerOptions: {
    type: Object,
    default: () => ({
      shortcuts: [
        {
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        },
        {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        },
        {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }
      ]
    })
  },
  // 域名选项
  domainOptions: {
    type: Array,
    default: []
  },
  // 米表选项
  portfolioOptions: {
    type: Array,
    default: []
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false
  },
  // 总数
  total: {
    type: Number,
    default: 0
  },
  // 访问数据
  visitData: {
    type: Array,
    default: []
  },
  // 总计统计
  totalStats: {
    type: Object,
    default: () => ({
      pageViews: 0,
      uniqueVisitors: 0,
      inquiryCount: 0,
      conversionRate: 0
    })
  },
  // 设备分布数据
  deviceStats: {
    type: Array,
    default: []
  },
  // 地域分布数据
  geoStats: {
    type: Array,
    default: []
  },
  // 流量来源数据
  refererStats: {
    type: Array,
    default: []
  },
  // 图表实例
  charts: {
    type: Object,
    default: () => ({
      visitTrend: null,
      device: null,
      geo: null,
      referer: null
    })
  },
  // 异常检测弹窗
  anomalyDialogVisible: {
    type: Boolean,
    default: false
  },
  // 异常列表
  anomalyList: {
    type: Array,
    default: []
  }
})

const emit = defineEmits(['update:queryParams', 'update:dateRange', 'update:pickerOptions', 'update:domainOptions', 'update:portfolioOptions', 'update:loading', 'update:total', 'update:visitData', 'update:totalStats', 'update:deviceStats', 'update:geoStats', 'update:refererStats', 'update:charts', 'update:anomalyDialogVisible', 'update:anomalyList'])

const handleQuery = () => {
  // Implementation of handleQuery
}

const resetQuery = () => {
  // Implementation of resetQuery
}

const handleSizeChange = (val) => {
  // Implementation of handleSizeChange
}

const handleCurrentChange = (val) => {
  // Implementation of handleCurrentChange
}

const initCharts = () => {
  // Implementation of initCharts
}

const resizeCharts = () => {
  // Implementation of resizeCharts
}

const disposeCharts = () => {
  // Implementation of disposeCharts
}

const getDeviceTypeName = (type) => {
  // Implementation of getDeviceTypeName
}

const checkAnomalies = () => {
  // Implementation of checkAnomalies
}

const getSeverityType = (severity) => {
  // Implementation of getSeverityType
}

const getSeverityLabel = (severity) => {
  // Implementation of getSeverityLabel
}
</script>

<style scoped lang="scss">
.mt-20 {
  margin-top: 20px;
}

.filter-container {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin: 10px 0;
}

.stat-desc {
  font-size: 14px;
  color: #909399;
}

.chart-container {
  padding: 10px;
}

.pagination-container {
  margin-top: 15px;
  text-align: right;
}

.change-rate {
  margin-left: 5px;
  font-weight: bold;
}

.positive {
  color: #67C23A;
}

.negative {
  color: #F56C6C;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .el-form-item {
    margin-bottom: 10px;
  }
  
  .stat-card {
    margin-bottom: 10px;
  }
}
</style>