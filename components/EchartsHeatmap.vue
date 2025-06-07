<template>
  <div ref="chartRef" :style="{ width: '100%', height: height }"></div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'

interface Props {
  data: Array<[number, number, number]> // [x, y, value]
  title?: string
  height?: string
  xAxisData?: string[]
  yAxisData?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  height: '240px',
  xAxisData: () => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  yAxisData: () => ['Morning', 'Afternoon', 'Evening', 'Night']
})

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)
  
  const option = {
    tooltip: {
      position: 'top',
      formatter: function (params: any) {
        return `${props.yAxisData[params.data[1]]}, ${props.xAxisData[params.data[0]]}: ${params.data[2]}`
      }
    },
    grid: {
      height: '60%',
      top: '10%',
      left: '10%',
      right: '10%'
    },
    xAxis: {
      type: 'category',
      data: props.xAxisData,
      splitArea: {
        show: true
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 10
      }
    },
    yAxis: {
      type: 'category',
      data: props.yAxisData,
      splitArea: {
        show: true
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 10
      }
    },
    visualMap: {
      min: 0,
      max: 10,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '5%',
      inRange: {
        color: ['#e8f3ff', '#667eea']
      },
      textStyle: {
        color: '#6b7280',
        fontSize: 10
      }
    },
    series: [
      {
        name: '访问热度',
        type: 'heatmap',
        data: props.data,
        label: {
          show: false
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  chartInstance.setOption(option)
}

onMounted(() => {
  nextTick(() => {
    initChart()
  })
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
})

watch(() => props.data, () => {
  if (chartInstance) {
    initChart()
  }
}, { deep: true })

// 响应式调整
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script> 