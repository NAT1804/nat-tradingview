<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import CommonChart from '../components/ui/CommonChart.vue'

// Sample chart data
const sampleData = ref<Array<{ time: string; value: number }>>([
  { time: '2024-01-01', value: 45000 },
  { time: '2024-01-02', value: 46000 },
  { time: '2024-01-03', value: 44000 },
  { time: '2024-01-04', value: 47000 },
  { time: '2024-01-05', value: 48000 },
  { time: '2024-01-06', value: 46500 },
  { time: '2024-01-07', value: 49000 },
  { time: '2024-01-08', value: 48500 },
  { time: '2024-01-09', value: 50000 },
  { time: '2024-01-10', value: 49500 },
])

const chartSymbol = ref('BTC/USD')
const chartWidth = ref(800)
const chartHeight = ref(500)

// Responsive chart sizing
const updateChartSize = () => {
  const container = document.querySelector('.layout__center')
  if (container) {
    const rect = container.getBoundingClientRect()
    chartWidth.value = Math.max(600, rect.width - 40) // 40px for padding
    chartHeight.value = Math.max(400, rect.height - 40)
  }
}

onMounted(() => {
  updateChartSize()
  window.addEventListener('resize', updateChartSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateChartSize)
})
</script>

<template>
  <div class="chart-view">
    <!-- <div class="chart-header">
      <h1 class="mb-4 text-3xl font-bold text-blue-600">Chart View</h1>
      <p class="mb-6 text-gray-600">Real-time trading chart with lightweight-charts</p>
    </div> -->

    <!-- <div class="chart-content">
      <CommonChart :data="sampleData" :symbol="chartSymbol" :width="chartWidth" :height="chartHeight" />
    </div> -->
  </div>
</template>

<style scoped>
@reference "../style.css";

.chart-view {
  width: 100%;
  height: 100%;
}

.chart-header {
  text-align: center;
  margin-bottom: 30px;
}

.chart-content {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.chart-info {
  max-width: 600px;
  margin: 0 auto;
}
</style>