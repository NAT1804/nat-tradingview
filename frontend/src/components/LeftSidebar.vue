<script setup lang="ts">
import { ref } from 'vue'

// Props for handling collapsed state and toggle function
interface Props {
  isCollapsed: boolean
}

defineProps<Props>()

// Emit for toggle functionality and tool selection
const emit = defineEmits<{
  toggle: []
  toolSelected: [toolId: string, toolType: string]
}>()

// Chart type state
const selectedChartType = ref('candlestick')
const selectedTimeframe = ref('1h')
const showVolume = ref(true)
const showGrid = ref(true)
const showCrosshair = ref(true)

// Trading tools configuration with categories
const chartTypes = [
  { id: 'candlestick', name: 'Candlestick', icon: '📊', category: 'chart-type', active: true },
  { id: 'line', name: 'Line', icon: '📈', category: 'chart-type', active: false },
  { id: 'area', name: 'Area', icon: '📉', category: 'chart-type', active: false },
  { id: 'bar', name: 'Bar', icon: '📊', category: 'chart-type', active: false },
  { id: 'heikin-ashi', name: 'Heikin Ashi', icon: '🕯️', category: 'chart-type', active: false },
]

const timeframes = [
  { id: '1m', name: '1m', icon: '⏱️', category: 'timeframe', active: false },
  { id: '5m', name: '5m', icon: '⏱️', category: 'timeframe', active: false },
  { id: '15m', name: '15m', icon: '⏱️', category: 'timeframe', active: false },
  { id: '1h', name: '1h', icon: '⏱️', category: 'timeframe', active: true },
  { id: '4h', name: '4h', icon: '⏱️', category: 'timeframe', active: false },
  { id: '1d', name: '1d', icon: '⏱️', category: 'timeframe', active: false },
  { id: '1w', name: '1w', icon: '⏱️', category: 'timeframe', active: false },
]

const chartTools = [
  { id: 'volume', name: 'Volume', icon: '📊', category: 'indicator', active: false },
  { id: 'ma', name: 'MA', icon: '📈', category: 'indicator', active: false },
  { id: 'ema', name: 'EMA', icon: '📈', category: 'indicator', active: false },
  { id: 'bollinger', name: 'Bollinger', icon: '📊', category: 'indicator', active: false },
  { id: 'rsi', name: 'RSI', icon: '📊', category: 'indicator', active: false },
  { id: 'macd', name: 'MACD', icon: '📊', category: 'indicator', active: false },
  { id: 'fibonacci', name: 'Fibonacci', icon: '📐', category: 'drawing', active: false },
  { id: 'trendline', name: 'Trendline', icon: '📏', category: 'drawing', active: false },
  { id: 'horizontal-line', name: 'H-Line', icon: '➖', category: 'drawing', active: false },
  { id: 'vertical-line', name: 'V-Line', icon: '➡️', category: 'drawing', active: false },
  { id: 'rectangle', name: 'Rectangle', icon: '⬜', category: 'drawing', active: false },
  { id: 'ellipse', name: 'Ellipse', icon: '⭕', category: 'drawing', active: false },
  { id: 'text', name: 'Text', icon: '📝', category: 'drawing', active: false },
]

const chartSettings = [
  { id: 'grid', name: 'Grid', icon: '🔲', category: 'settings', active: true },
  { id: 'crosshair', name: 'Crosshair', icon: '➕', category: 'settings', active: true },
  { id: 'scale', name: 'Scale', icon: '📏', category: 'settings', active: false },
  { id: 'time', name: 'Time', icon: '🕐', category: 'settings', active: true },
  { id: 'price', name: 'Price', icon: '💰', category: 'settings', active: true },
  { id: 'fullscreen', name: 'Fullscreen', icon: '⛶', category: 'settings', active: false },
  { id: 'screenshot', name: 'Screenshot', icon: '📸', category: 'settings', active: false },
]

const analysisTools = [
  { id: 'pattern-recognition', name: 'Patterns', icon: '🔍', category: 'analysis', active: false },
  { id: 'support-resistance', name: 'S/R Levels', icon: '📊', category: 'analysis', active: false },
  { id: 'pivot-points', name: 'Pivot Points', icon: '🎯', category: 'analysis', active: false },
  { id: 'order-flow', name: 'Order Flow', icon: '📊', category: 'analysis', active: false },
  { id: 'market-profile', name: 'Market Profile', icon: '📊', category: 'analysis', active: false },
]

const selectTool = (tool: any) => {
  console.log('Tool selected:', tool)

  // Update active state based on category
  if (tool.category === 'chart-type') {
    chartTypes.forEach(t => t.active = t.id === tool.id)
    selectedChartType.value = tool.id
  } else if (tool.category === 'timeframe') {
    timeframes.forEach(t => t.active = t.id === tool.id)
    selectedTimeframe.value = tool.id
  } else if (tool.category === 'indicator') {
    tool.active = !tool.active
  } else if (tool.category === 'drawing') {
    tool.active = !tool.active
  } else if (tool.category === 'settings') {
    tool.active = !tool.active
    // Handle specific settings
    if (tool.id === 'grid') showGrid.value = tool.active
    if (tool.id === 'crosshair') showCrosshair.value = tool.active
    if (tool.id === 'volume') showVolume.value = tool.active
  } else if (tool.category === 'analysis') {
    tool.active = !tool.active
  }

  // Emit tool selection event
  emit('toolSelected', tool.id, tool.category)
}
</script>

<template>
  <div class="left-panel__container">
    <div class="tools-sections">
      <!-- Chart Types Section -->
      <div class="tool-section">
        <div class="tools-grid">
          <button v-for="tool in chartTypes" :key="tool.id" @click="selectTool(tool)" class="tool-button"
            :class="{ 'active': tool.active }" :title="tool.name" :aria-label="tool.name">
            <span class="tool-icon">{{ tool.icon }}</span>
          </button>
        </div>
      </div>

      <!-- Timeframes Section -->
      <div class="tool-section">
        <div class="tools-grid">
          <button v-for="tool in timeframes" :key="tool.id" @click="selectTool(tool)" class="tool-button"
            :class="{ 'active': tool.active }" :title="tool.name" :aria-label="tool.name">
            <span class="tool-icon">{{ tool.icon }}</span>
          </button>
        </div>
      </div>

      <!-- Indicators & Tools Section -->
      <div class="tool-section">
        <div class="tools-grid">
          <button v-for="tool in chartTools" :key="tool.id" @click="selectTool(tool)" class="tool-button"
            :class="{ 'active': tool.active }" :title="tool.name" :aria-label="tool.name">
            <span class="tool-icon">{{ tool.icon }}</span>
          </button>
        </div>
      </div>

      <!-- Chart Settings Section -->
      <div class="tool-section">
        <div class="tools-grid">
          <button v-for="tool in chartSettings" :key="tool.id" @click="selectTool(tool)" class="tool-button"
            :class="{ 'active': tool.active }" :title="tool.name" :aria-label="tool.name">
            <span class="tool-icon">{{ tool.icon }}</span>
          </button>
        </div>
      </div>

      <!-- Analysis Tools Section -->
      <div class="tool-section">
        <div class="tools-grid">
          <button v-for="tool in analysisTools" :key="tool.id" @click="selectTool(tool)" class="tool-button"
            :class="{ 'active': tool.active }" :title="tool.name" :aria-label="tool.name">
            <span class="tool-icon">{{ tool.icon }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "../style.css";

.left-panel__container {
  @apply relative h-full overflow-y-auto;
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* Internet Explorer 10+ */
}

.left-panel__container::-webkit-scrollbar {
  width: 0;
  background: transparent;
}

.tools-sections {
  @apply space-y-4 p-3;
}

.tool-section {
  @apply space-y-2;
}

.tools-grid {
  @apply grid grid-cols-1 gap-1;
}

.tool-button {
  @apply w-full p-2 rounded-lg transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 hover:bg-gray-50;
  min-height: 40px;
  aspect-ratio: 1;
}

.tool-button.active {
  @apply bg-blue-50 ring-2 ring-blue-200 text-blue-700;
}

.tool-button:hover {
  @apply transform scale-105;
}

.tool-icon {
  @apply text-lg;
}

/* Dark theme support */
.dark .tool-button {
  @apply hover:bg-gray-800;
}

.dark .tool-button.active {
  @apply bg-blue-900 ring-blue-700 text-blue-300;
}
</style>