<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

// Props for handling collapsed state and toggle function
interface Props {
  isCollapsed: boolean
}

const props = defineProps<Props>()

// Emit for toggle functionality
const emit = defineEmits<{
  toggle: []
}>()

const navigateTo = (path: string) => {
  router.push(path)
}

const handleToggle = () => {
  emit('toggle')
}

// Trading tools configuration
const tradingTools = [
  { id: 1, name: 'Chart', icon: 'chart-line', active: true },
  { id: 2, name: 'Volume', icon: 'volume', active: false },
  { id: 3, name: 'Candlestick', icon: 'candlestick', active: false },
  { id: 4, name: 'Trend Up', icon: 'trend-up', active: false },
  { id: 5, name: 'Trend Down', icon: 'trend-down', active: false },
  { id: 6, name: 'Settings', icon: 'settings', active: false },
  { id: 7, name: 'Portfolio', icon: 'portfolio', active: false },
  { id: 8, name: 'Watchlist', icon: 'watchlist', active: false },
  { id: 9, name: 'Alerts', icon: 'alert', active: false },
  { id: 10, name: 'Search', icon: 'search', active: false }
]

const selectTool = (toolId: number) => {
  console.log('Tool selected:', toolId)
  // Handle tool selection logic here
}
</script>

<template>
  <div class="left-panel__container">
    <div class="tools-grid">
      <button v-for="tool in tradingTools" :key="tool.id" @click="selectTool(tool.id)" class="tool-button"
        :class="{ 'active': tool.active }" :title="tool.name" :aria-label="tool.name">
        <span class="tool-label">{{ tool.name }}</span>
      </button>
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

.tools-grid {
  @apply space-y-2;
}

.tool-button {
  @apply w-full p-2 rounded-lg transition-all duration-200 flex flex-col items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1;
  min-height: 48px;
}

.tool-button.active {
  @apply bg-blue-50 ring-2 ring-blue-200;
}

.tool-button:hover {
  @apply transform scale-105;
}

.tool-label {
  @apply text-xs font-medium text-foreground text-center leading-tight;
  font-size: 10px;
}

.tool-button.active .tool-label {
  @apply text-primary;
}
</style>