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
  color?: string
  smooth?: boolean
  area?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: '240px',
  color: '#667eea',
  smooth: true,
  area: false
})

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis'
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
      boundaryGap: false,
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
        data: props.data.map(item => item.value),
        type: 'line',
        smooth: props.smooth,
        lineStyle: {
          color: props.color,
          width: 3
        },
        itemStyle: {
          color: props.color,
          borderColor: '#fff',
          borderWidth: 2
        },
        areaStyle: props.area ? {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: props.color + '40'
            },
            {
              offset: 1,
              color: props.color + '10'
            }
          ])
        } : null,
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