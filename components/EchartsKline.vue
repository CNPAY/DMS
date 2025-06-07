<template>
  <div ref="chartRef" :style="{ width: '100%', height: height }"></div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'

interface Props {
  data: Array<{
    name: string
    data: [number, number, number, number] // [开盘价, 收盘价, 最低价, 最高价]
    volume: number
  }>
  title?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: '240px'
})

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)
  
  const upColor = '#ec0000'
  const downColor = '#00da3c'
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    grid: [
      {
        left: '3%',
        right: '4%',
        top: '5%',
        height: '65%'
      },
      {
        left: '3%',
        right: '4%',
        top: '75%',
        height: '20%'
      }
    ],
    xAxis: [
      {
        type: 'category',
        data: props.data.map(item => item.name),
        scale: true,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        splitNumber: 20,
        min: 'dataMin',
        max: 'dataMax',
        axisLabel: {
          color: '#6b7280',
          fontSize: 10
        }
      },
      {
        type: 'category',
        gridIndex: 1,
        data: props.data.map(item => item.name),
        scale: true,
        boundaryGap: false,
        axisLine: { onZero: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        splitNumber: 20,
        min: 'dataMin',
        max: 'dataMax'
      }
    ],
    yAxis: [
      {
        scale: true,
        splitArea: {
          show: true
        },
        axisLabel: {
          color: '#6b7280',
          fontSize: 10
        },
        splitLine: {
          lineStyle: {
            color: '#f3f4f6'
          }
        }
      },
      {
        scale: true,
        gridIndex: 1,
        splitNumber: 2,
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        type: 'candlestick',
        data: props.data.map(item => item.data),
        itemStyle: {
          color: upColor,
          color0: downColor,
          borderColor: upColor,
          borderColor0: downColor
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
          }
        }
      },
      {
        name: 'Volume',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: props.data.map(item => item.volume),
        itemStyle: {
          color: '#667eea'
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