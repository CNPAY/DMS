<template>
  <div ref="chartRef" :style="{ width: '100%', height: height }"></div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'

interface Props {
  data: Array<{
    name: string
    value: number
  }>
  title?: string
  height?: string
  color?: string | string[]
}

const props = withDefaults(defineProps<Props>(), {
  height: '240px',
  color: '#667eea'
})

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: props.data.map(item => item.name),
      axisLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 11
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 11
      },
      splitLine: {
        lineStyle: {
          color: '#f3f4f6'
        }
      }
    },
    series: [
      {
        data: props.data.map((item, index) => ({
          value: item.value,
          itemStyle: {
            color: Array.isArray(props.color) ? props.color[index % props.color.length] : props.color
          }
        })),
        type: 'bar',
        barWidth: '60%',
        label: {
          show: true,
          position: 'top',
          fontSize: 11,
          fontWeight: 600,
          color: '#374151'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
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