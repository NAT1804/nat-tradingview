<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import CommonChart from '../components/ui/CommonChart.vue'
import { useChartData } from '../composables/useChartData'
import { useTheme } from '../composables/useTheme'

// Use the theme composable
const { getTheme } = useTheme();

// Chart configuration
const currentSymbol = ref('btcusdt')
const currentInterval = ref('1h')
const chartType = ref<'line' | 'candlestick' | 'area'>('candlestick')
const showVolume = ref(true)
const chartWidth = ref(800)
const chartHeight = ref(500)

// Chart settings
const showGrid = ref(true)
const showCrosshair = ref(true)
const showTimeScale = ref(true)
const showPriceScale = ref(true)

// Active indicators and tools
const activeIndicators = ref<string[]>([])
const activeDrawings = ref<string[]>([])

// Initialize chart data composable
const {
  isLoading,
  subscribeToSymbol,
  getFormattedData,
  getFormattedVolumeData,
  disconnectWebSocket
} = useChartData({
  symbol: currentSymbol.value,
  interval: currentInterval.value,
  limit: 500,
  autoConnect: false // We'll manually connect
})

// Computed data for the chart
const chartData = computed(() => {
  return getFormattedData(chartType.value)
})

const volumeData = computed(() => {
  return getFormattedVolumeData()
})

// Symbol display name
const symbolDisplayName = computed(() => {
  return currentSymbol.value.toUpperCase().replace('USDT', '/USDT')
})

// Available intervals
const availableIntervals = [
  { value: '1m', label: '1m' },
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
  { value: '1h', label: '1h' },
  { value: '4h', label: '4h' },
  { value: '1d', label: '1d' },
]

// Handle tool selection from LeftSidebar
const handleToolSelection = (event: CustomEvent) => {
  const { toolId, toolType } = event.detail
  console.log('ChartView received tool selection:', toolId, toolType)

  switch (toolType) {
    case 'chart-type':
      handleChartTypeChange(toolId)
      break
    case 'timeframe':
      handleTimeframeChange(toolId)
      break
    case 'indicator':
      handleIndicatorToggle(toolId)
      break
    case 'drawing':
      handleDrawingToggle(toolId)
      break
    case 'settings':
      handleSettingToggle(toolId)
      break
    case 'analysis':
      handleAnalysisToggle(toolId)
      break
  }
}

const handleChartTypeChange = (chartTypeId: string) => {
  if (['line', 'candlestick', 'area'].includes(chartTypeId)) {
    chartType.value = chartTypeId as 'line' | 'candlestick' | 'area'
    console.log('Chart type changed to:', chartType.value)
  }
}

const handleTimeframeChange = (timeframeId: string) => {
  if (availableIntervals.some(interval => interval.value === timeframeId)) {
    currentInterval.value = timeframeId
    console.log('Timeframe changed to:', currentInterval.value)
    // Resubscribe to get new data
    subscribeToSymbol(currentSymbol.value, currentInterval.value)
  }
}

const handleIndicatorToggle = (indicatorId: string) => {
  const index = activeIndicators.value.indexOf(indicatorId)
  if (index > -1) {
    activeIndicators.value.splice(index, 1)
  } else {
    activeIndicators.value.push(indicatorId)
  }
  console.log('Active indicators:', activeIndicators.value)
}

const handleDrawingToggle = (drawingId: string) => {
  const index = activeDrawings.value.indexOf(drawingId)
  if (index > -1) {
    activeDrawings.value.splice(index, 1)
  } else {
    activeDrawings.value.push(drawingId)
  }
  console.log('Active drawings:', activeDrawings.value)
}

const handleSettingToggle = (settingId: string) => {
  switch (settingId) {
    case 'grid':
      showGrid.value = !showGrid.value
      break
    case 'crosshair':
      showCrosshair.value = !showCrosshair.value
      break
    case 'time':
      showTimeScale.value = !showTimeScale.value
      break
    case 'price':
      showPriceScale.value = !showPriceScale.value
      break
    case 'volume':
      showVolume.value = !showVolume.value
      break
    case 'fullscreen':
      toggleFullscreen()
      break
    case 'screenshot':
      takeScreenshot()
      break
  }
  console.log('Setting toggled:', settingId)
}

const handleAnalysisToggle = (analysisId: string) => {
  console.log('Analysis tool toggled:', analysisId)
  // Handle analysis tools like pattern recognition, support/resistance levels, etc.
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

const takeScreenshot = () => {
  // This will be handled by the CommonChart component
  console.log('Taking screenshot...')
}

// Watch for symbol or interval changes
watch([currentSymbol, currentInterval], async ([newSymbol, newInterval]) => {
  await subscribeToSymbol(newSymbol, newInterval)
})

// Responsive chart sizing
const updateChartSize = () => {
  const container = document.querySelector('.chart-container')
  if (container) {
    const rect = container.getBoundingClientRect()
    chartWidth.value = Math.max(600, rect.width - 40)
    chartHeight.value = Math.max(400, rect.height - 120) // Account for controls
  }
}

onMounted(async () => {
  updateChartSize()
  window.addEventListener('resize', updateChartSize)

  // Listen for tool selection events
  window.addEventListener('chartToolSelected', handleToolSelection as EventListener)

  // Initial data load
  await subscribeToSymbol(currentSymbol.value, currentInterval.value)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateChartSize)
  window.removeEventListener('chartToolSelected', handleToolSelection as EventListener)
  disconnectWebSocket()
})
</script>

<template>
  <div class="chart-view">
    <!-- Chart Container -->
    <div class="chart-container">
      <div v-if="isLoading && chartData.length === 0" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading chart data...</p>
      </div>

      <CommonChart v-else-if="chartData.length > 0" :data="chartData" :symbol="symbolDisplayName" :width="chartWidth"
        :height="chartHeight" :chart-type="chartType" :show-volume="showVolume && chartType === 'candlestick'"
        :volume-data="volumeData" :auto-resize="true" :theme="getTheme()" />

      <div v-else class="no-data-state">
        <p>No data available</p>
        <button @click="subscribeToSymbol(currentSymbol, currentInterval)" class="retry-button">
          Retry
        </button>
      </div>
    </div>

    <!-- Debug Info (can be removed in production) -->
    <div v-if="false" class="debug-info">
      <p>Chart Type: {{ chartType }}</p>
      <p>Timeframe: {{ currentInterval }}</p>
      <p>Show Volume: {{ showVolume }}</p>
      <p>Active Indicators: {{ activeIndicators.join(', ') }}</p>
      <p>Active Drawings: {{ activeDrawings.join(', ') }}</p>
    </div>
  </div>
</template>

<style scoped>
.chart-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chart-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.no-data-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #6b7280;
}

.retry-button {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.retry-button:hover {
  background: #2563eb;
}

.debug-info {
  position: fixed;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-size: 12px;
  z-index: 1000;
}
</style>