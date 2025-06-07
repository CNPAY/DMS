<template>
  <div ref="chartRef" :style="{ width: '100%', height: height }"></div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'

interface Props {
  data: Array<{
    name: string
    value: number
    color: string
  }>
  title?: string
  height?: string
  centerText?: {
    value: string
    label: string
  }
  isDonut?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: '240px',
  isDonut: false
})

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      itemGap: 8,
      itemWidth: 12,
      itemHeight: 8,
      textStyle: {
        fontSize: 11,
        color: '#374151',
        fontWeight: 500
      },
      formatter: function(name: string) {
        const item = props.data.find(d => d.name === name)
        return item ? `${name} (${item.value})` : name
      }
    },
    series: [
      {
        name: props.title || '数据统计',
        type: 'pie',
        radius: props.isDonut ? ['40%', '60%'] : '60%',
        center: ['35%', '50%'],
        data: props.data.map(item => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: item.color
          }
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}\n{d}%',
          fontSize: 11,
          fontWeight: 600,
          color: '#374151',
          lineHeight: 14
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 25,
          smooth: false,
          lineStyle: {
            color: '#9ca3af',
            width: 1
          }
        }
      }
    ],
    graphic: props.centerText ? [
      {
        type: 'text',
        style: {
          text: props.centerText.value,
          textAlign: 'center',
          fontSize: props.isDonut ? 18 : 16,
          fontWeight: 'bold',
          color: '#1a1a1a',
          x: chartRef.value ? chartRef.value.offsetWidth * 0.35 : 100,
          y: chartRef.value ? chartRef.value.offsetHeight * 0.45 : 90
        }
      },
      {
        type: 'text',
        style: {
          text: props.centerText.label,
          textAlign: 'center',
          fontSize: 10,
          color: '#6b7280',
          x: chartRef.value ? chartRef.value.offsetWidth * 0.35 : 100,
          y: chartRef.value ? chartRef.value.offsetHeight * 0.55 : 110
        }
      }
    ] : []
  }

  chartInstance.setOption(option)
}

const updateChart = () => {
  if (chartInstance) {
    initChart()
  }
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

watch(() => props.data, updateChart, { deep: true })

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