<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import ThemeSwitch from './ThemeSwitch.vue'

const router = useRouter()
const route = useRoute()

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <nav class="h-full">
    <div class="container flex justify-between items-center mx-auto">
      <h1 class="text-xl font-bold">NAT TradingView</h1>
      <!-- <div class="space-x-4">
        <button @click="navigateTo('/')" class="px-4 py-2 rounded transition-colors hover:bg-gray-700"
          :class="{ 'bg-gray-700': route.path === '/' }">
          Chart View
        </button>
        <button @click="navigateTo('/settings')" class="px-4 py-2 rounded transition-colors hover:bg-gray-700"
          :class="{ 'bg-gray-700': route.path === '/settings' }">
          Settings
        </button>
      </div> -->
      <ThemeSwitch />
    </div>
  </nav>
</template>

<style scoped>
/* Navigation specific styles can be added here if needed */
</style>