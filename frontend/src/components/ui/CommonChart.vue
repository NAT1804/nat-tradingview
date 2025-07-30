<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type Time,
  LineSeries,
  CandlestickSeries,
  AreaSeries,
  HistogramSeries
} from 'lightweight-charts'

interface CandlestickDataPoint {
  time: number
  open: number
  high: number
  low: number
  close: number
}

interface LineDataPoint {
  time: number
  value: number
}

interface AreaDataPoint {
  time: number
  value: number
}

interface Props {
  data?: Array<CandlestickDataPoint | LineDataPoint | AreaDataPoint>
  width?: number
  height?: number
  symbol?: string
  chartType?: 'line' | 'candlestick' | 'area'
  theme?: 'light' | 'dark'
  autoResize?: boolean
  showVolume?: boolean
  volumeData?: Array<{ time: number; value: number }>
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  width: 800,
  height: 400,
  symbol: 'BTC/USD',
  chartType: 'line',
  theme: 'light',
  autoResize: true,
  showVolume: false,
  volumeData: () => []
})

const chartContainer = ref<HTMLDivElement>()
let chart: IChartApi | null = null
let mainSeries: ISeriesApi<any> | null = null
let volumeSeries: ISeriesApi<any> | null = null
let resizeObserver: ResizeObserver | null = null
let isInitialLoad = ref(true)

// Theme configurations
const themeConfig = computed(() => {
  const isDark = props.theme === 'dark'
  return {
    layout: {
      background: { color: isDark ? '#1a1a1a' : '#ffffff' },
      textColor: isDark ? '#d1d5db' : '#333333',
    },
    grid: {
      vertLines: { color: isDark ? '#374151' : '#f0f0f0' },
      horzLines: { color: isDark ? '#374151' : '#f0f0f0' },
    },
    crosshair: {
      mode: 1,
    },
    rightPriceScale: {
      borderColor: isDark ? '#4b5563' : '#cccccc',
    },
    timeScale: {
      borderColor: isDark ? '#4b5563' : '#cccccc',
      timeVisible: true,
      secondsVisible: false,
    },
  }
})

const initChart = () => {
  if (!chartContainer.value) return

  // Create chart
  chart = createChart(chartContainer.value, {
    width: props.width,
    height: props.height,
    ...themeConfig.value,
    handleScroll: {
      mouseWheel: true,
      pressedMouseMove: true,
    },
    handleScale: {
      axisPressedMouseMove: true,
      mouseWheel: true,
      pinch: true,
    },
  })

  // Create main series based on chart type
  createMainSeries()

  // Create volume series if needed
  if (props.showVolume && props.volumeData.length > 0) {
    createVolumeSeries()
  }

  // Set data
  updateChartData()

  // Fit content only on initial load
  if (isInitialLoad.value) {
    chart.timeScale().fitContent()
    isInitialLoad.value = false
  }

  // Handle resize if auto-resize is enabled
  if (props.autoResize) {
    handleResize()
  }
}

const createMainSeries = () => {
  if (!chart) return

  switch (props.chartType) {
    case 'line':
      mainSeries = chart.addSeries(LineSeries, {
        color: props.theme === 'dark' ? '#60a5fa' : '#2563eb',
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 6,
      })
      break
    case 'candlestick':
      mainSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderUpColor: '#22c55e',
        borderDownColor: '#ef4444',
        wickUpColor: '#22c55e',
        wickDownColor: '#ef4444',
      })
      break
    case 'area':
      mainSeries = chart.addSeries(AreaSeries, {
        topColor: props.theme === 'dark' ? 'rgba(96, 165, 250, 0.4)' : 'rgba(37, 99, 235, 0.4)',
        bottomColor: props.theme === 'dark' ? 'rgba(96, 165, 250, 0.0)' : 'rgba(37, 99, 235, 0.0)',
        lineColor: props.theme === 'dark' ? '#60a5fa' : '#2563eb',
        lineWidth: 2,
      })
      break
  }
}

const createVolumeSeries = () => {
  if (!chart) return

  volumeSeries = chart.addSeries(HistogramSeries, {
    color: props.theme === 'dark' ? '#6b7280' : '#9ca3af',
    priceFormat: {
      type: 'volume',
    },
    priceScaleId: 'volume',
  })

  chart.priceScale('volume').applyOptions({
    scaleMargins: {
      top: 0.8,
      bottom: 0,
    },
  })

  if (props.volumeData.length > 0) {
    const volumeData = props.volumeData.map(item => ({
      time: item.time as Time,
      value: item.value
    })).sort((a, b) => new Date(a.time as string).getTime() - new Date(b.time as string).getTime())
    volumeSeries.setData(volumeData)
  }
}

const updateChartData = () => {
  if (!mainSeries || props.data.length === 0) return

  // Store current visible range before updating data
  const currentVisibleRange = chart?.timeScale().getVisibleRange()

  // Transform data based on chart type
  let transformedData: any[] = []

  if (props.chartType === 'line' || props.chartType === 'area') {
    transformedData = props.data.map(item => ({
      time: item.time as Time,
      value: 'value' in item ? item.value : ('close' in item ? item.close : 0)
    }))
  } else if (props.chartType === 'candlestick') {
    transformedData = props.data
      .filter(item => 'open' in item && 'high' in item && 'low' in item && 'close' in item)
      .map(item => ({
        time: item.time as Time,
        open: (item as CandlestickDataPoint).open,
        high: (item as CandlestickDataPoint).high,
        low: (item as CandlestickDataPoint).low,
        close: (item as CandlestickDataPoint).close
      }))
  }

  mainSeries.setData(transformedData)

  // Restore visible range after data update (but not on initial load)
  if (!isInitialLoad.value && currentVisibleRange && chart) {
    // Use a small delay to ensure the data is properly set
    setTimeout(() => {
      try {
        chart?.timeScale().setVisibleRange(currentVisibleRange)
      } catch (error) {
        // If setting the range fails (e.g., data is out of range), fit content
        console.warn('Failed to restore visible range, fitting content instead')
        chart?.timeScale().fitContent()
      }
    }, 50)
  }
}

const handleResize = () => {
  if (!chart || !chartContainer.value) return

  resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect
      chart?.applyOptions({
        width: width,
        height: height,
      })
    }
  })

  resizeObserver.observe(chartContainer.value)
}

// Watch for data changes
watch(() => props.data, () => {
  updateChartData()
}, { deep: true })

// Watch for chart type changes
watch(() => props.chartType, () => {
  if (chart && mainSeries) {
    // Store current visible range
    const currentVisibleRange = chart.timeScale().getVisibleRange()

    chart.removeSeries(mainSeries)
    createMainSeries()
    updateChartData()

    // Restore visible range after chart type change
    if (currentVisibleRange) {
      setTimeout(() => {
        try {
          chart?.timeScale().setVisibleRange(currentVisibleRange)
        } catch (error) {
          chart?.timeScale().fitContent()
        }
      }, 100)
    }
  }
})

// Watch for theme changes
watch(() => props.theme, () => {
  if (chart) {
    // Store current visible range
    const currentVisibleRange = chart.timeScale().getVisibleRange()

    chart.applyOptions(themeConfig.value)

    // Recreate series with new theme colors
    if (mainSeries) {
      chart.removeSeries(mainSeries)
      createMainSeries()
      updateChartData()
    }

    if (volumeSeries && props.showVolume) {
      chart.removeSeries(volumeSeries)
      createVolumeSeries()
    }

    // Restore visible range after theme change
    if (currentVisibleRange) {
      setTimeout(() => {
        try {
          chart?.timeScale().setVisibleRange(currentVisibleRange)
        } catch (error) {
          chart?.timeScale().fitContent()
        }
      }, 100)
    }
  }
})

// Watch for size changes
watch([() => props.width, () => props.height], () => {
  if (chart && !props.autoResize) {
    chart.applyOptions({
      width: props.width,
      height: props.height,
    })
  }
})

// Watch for volume data changes
watch(() => props.volumeData, () => {
  if (volumeSeries && props.volumeData.length > 0) {
    const volumeData = props.volumeData.map(item => ({
      time: item.time as Time,
      value: item.value
    }))
    volumeSeries.setData(volumeData)
  }
}, { deep: true })

// Watch for showVolume changes
watch(() => props.showVolume, (newVal) => {
  if (newVal && !volumeSeries) {
    createVolumeSeries()
  } else if (!newVal && volumeSeries) {
    chart?.removeSeries(volumeSeries)
    volumeSeries = null
  }
})

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }

  if (chart) {
    chart.remove()
    chart = null
    mainSeries = null
    volumeSeries = null
  }
})

// Expose methods for external control
defineExpose({
  fitContent: () => chart?.timeScale().fitContent(),
  scrollToPosition: (position: number) => chart?.timeScale().scrollToPosition(position, false),
  setVisibleRange: (range: { from: Time; to: Time }) => chart?.timeScale().setVisibleRange(range),
  takeScreenshot: () => chart?.takeScreenshot(),
})
</script>

<template>
  <div class="chart-wrapper" :class="{ 'dark': theme === 'dark' }">
    <div ref="chartContainer" class="chart-container" :style="{
      width: autoResize ? '100%' : `${width}px`,
      height: autoResize ? '100%' : `${height}px`
    }"></div>
  </div>
</template>

<style scoped>
@reference "../../style.css";

.chart-wrapper {
  min-height: 300px;
  width: 100%;
  height: 100%;
}

.chart-container {
  @apply relative;
  min-height: 250px;
}

.chart-container:empty::before {
  content: 'Loading chart...';
  @apply absolute inset-0 flex items-center justify-center;
}
</style>