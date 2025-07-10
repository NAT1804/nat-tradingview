<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { createChart } from 'lightweight-charts'

interface Props {
  data?: Array<{ time: string; value: number }>
  width?: number
  height?: number
  symbol?: string
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  width: 800,
  height: 400,
  symbol: 'BTC/USD'
})

const chartContainer = ref<HTMLDivElement>()
let chart: any = null
let lineSeries: any = null

const initChart = () => {
  if (!chartContainer.value) return

  // Create chart
  chart = createChart(chartContainer.value, {
    width: props.width,
    height: props.height,
    layout: {
      background: { color: '#ffffff' },
      textColor: '#333',
    },
    grid: {
      vertLines: { color: '#f0f0f0' },
      horzLines: { color: '#f0f0f0' },
    },
    crosshair: {
      mode: 1,
    },
    rightPriceScale: {
      borderColor: '#cccccc',
    },
    timeScale: {
      borderColor: '#cccccc',
      timeVisible: true,
      secondsVisible: false,
    },
  })

  // Create line series
  lineSeries = chart.addLineSeries({
    color: '#2962FF',
    lineWidth: 2,
  })

  // Set data
  if (props.data.length > 0 && lineSeries) {
    lineSeries.setData(props.data)
  }

  // Fit content
  chart.timeScale().fitContent()
}

const updateChartData = (newData: Array<{ time: string; value: number }>) => {
  if (lineSeries && newData.length > 0) {
    lineSeries.setData(newData)
    if (chart) {
      chart.timeScale().fitContent()
    }
  }
}

// Watch for data changes
watch(() => props.data, (newData) => {
  updateChartData(newData)
}, { deep: true })

// Watch for size changes
watch([() => props.width, () => props.height], () => {
  if (chart) {
    chart.applyOptions({
      width: props.width,
      height: props.height,
    })
  }
})

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  if (chart) {
    chart.remove()
    chart = null
  }
})
</script>

<template>
  <div class="chart-wrapper">
    <div class="chart-header">
      <h3 class="text-lg font-semibold text-gray-800">{{ symbol }}</h3>
    </div>
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<style scoped>
.chart-wrapper {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chart-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.chart-container {
  padding: 20px;
}
</style>