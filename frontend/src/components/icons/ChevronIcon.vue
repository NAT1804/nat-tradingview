<script setup lang="ts">
interface Props {
  size?: number | string
  color?: string
  direction?: 'left' | 'right' | 'up' | 'down'
  strokeWidth?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  color: 'currentColor',
  direction: 'left',
  strokeWidth: 2
})

// Calculate rotation based on direction
const getRotation = () => {
  switch (props.direction) {
    case 'right': return 'rotate(180deg)'
    case 'up': return 'rotate(90deg)'
    case 'down': return 'rotate(-90deg)'
    default: return 'rotate(0deg)' // left
  }
}
</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="9" height="27" viewBox="0 0 9 27" class="chevron-icon"
    :style="{ transform: getRotation() }">
    <g fill="none" fill-rule="evenodd">
      <path class="background" :fill="color" fill-opacity="0.1"
        d="M4.5.5a4 4 0 0 1 4 4v18a4 4 0 1 1-8 0v-18a4 4 0 0 1 4-4z" />
      <path class="arrow" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round"
        fill="none" d="M5.5 10l-2 3.5 2 3.5" />
    </g>
  </svg>
</template>

<style scoped>
.chevron-icon {
  transition: transform 0.3s ease;
  flex-shrink: 0;
  z-index: 10;
  display: inline-block;
}

.background {
  transition: fill 0.3s ease;
}

.arrow {
  transition: stroke 0.3s ease;
}
</style>