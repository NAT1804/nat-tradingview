<script setup lang="ts">
import { watch } from 'vue'
import { useTheme } from '@/composables/useTheme'
import SunIcon from '@/assets/icons/sun.svg'
import MoonIcon from '@/assets/icons/moon.svg'

// Use the theme composable
const { isDarkMode, toggleTheme } = useTheme()

// Optional props for customization
interface Props {
  variant?: 'default' | 'compact' | 'large'
  showLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  showLabel: true
})

// Emit theme change event for parent components
const emit = defineEmits<{
  themeChanged: [isDark: boolean]
}>()

// Watch for theme changes and emit events
watch(isDarkMode, (newValue) => {
  emit('themeChanged', newValue)
})
</script>

<template>
  <div class="theme-switch">
    <button @click="toggleTheme" class="theme-toggle-btn" :class="{ 'dark': isDarkMode }" :title="'Toggle Theme'"
      :aria-label="'Toggle Theme'">
      <span v-if="showLabel" class="theme-label">
        {{ isDarkMode ? 'Dark Mode' : 'Light Mode' }}
      </span>
      <div class="switch-track">
        <div class="switch-thumb" :class="{ 'dark': isDarkMode }">
          <div class="icon-container">
            <Transition name="icon-fade" mode="out-in">
              <img v-if="!isDarkMode" key="sun" class="theme-icon sun-icon" :src="SunIcon" alt="Sun logo" />
              <img v-else key="moon" class="theme-icon moon-icon" :src="MoonIcon" alt="Moon logo" />
            </Transition>
          </div>
        </div>
      </div>
    </button>
  </div>
</template>

<style scoped>
@reference "../style.css";

.theme-switch {
  @apply flex items-center;
}

.theme-toggle-btn {
  @apply flex items-center gap-3 p-2 rounded-lg transition-all duration-300 ease-in-out focus:outline-none;
  background: transparent;
  border: none;
  cursor: pointer;
}

.switch-track {
  @apply relative w-12 h-6 rounded-full transition-all duration-300 ease-in-out bg-primary;
}

.theme-toggle-btn.dark .switch-track {
  @apply bg-primary;
}

.switch-thumb {
  @apply absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ease-in-out flex items-center justify-center;
  transform: translateX(0);
}

.switch-thumb.dark {
  transform: translateX(1.5rem);
  /* 24px */
  @apply bg-gray-100;
}

.icon-container {
  @apply relative w-4 h-4 flex items-center justify-center;
}

.theme-icon {
  @apply absolute;
  width: 12px;
  height: 12px;
}

.sun-icon {
  @apply text-yellow-600;
}

.moon-icon {
  @apply text-blue-600;
}

.theme-label {
  @apply text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300;
  user-select: none;
}

/* Icon transition animations */
.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: all 0.2s ease;
}

.icon-fade-enter-from {
  opacity: 0;
  transform: scale(0.8) rotate(-90deg);
}

.icon-fade-leave-to {
  opacity: 0;
  transform: scale(0.8) rotate(90deg);
}

.icon-fade-enter-to,
.icon-fade-leave-from {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

/* Hover and focus effects */
.theme-toggle-btn:hover .switch-track {
  @apply shadow-lg;
  transform: scale(1.05);
}

.theme-toggle-btn:hover .switch-thumb {
  @apply shadow-lg;
  transform: translateX(0) scale(1.1);
}

.theme-toggle-btn.dark:hover .switch-thumb {
  transform: translateX(1.5rem) scale(1.1);
}

.theme-toggle-btn:active .switch-track {
  transform: scale(0.95);
}

/* Accessibility - reduced motion */
@media (prefers-reduced-motion: reduce) {

  .switch-track,
  .switch-thumb,
  .theme-icon,
  .icon-fade-enter-active,
  .icon-fade-leave-active {
    transition: none !important;
  }
}

/* Compact variant */
.theme-switch.compact .theme-label {
  @apply hidden;
}

.theme-switch.compact .theme-toggle-btn {
  @apply gap-0 p-1;
}

/* Large variant */
.theme-switch.large .switch-track {
  @apply w-16 h-8;
}

.theme-switch.large .switch-thumb {
  @apply w-7 h-7 top-0.5 left-0.5;
}

.theme-switch.large .switch-thumb.dark {
  transform: translateX(2rem);
}

.theme-switch.large .theme-icon {
  width: 16px;
  height: 16px;
}

.theme-switch.large:hover .switch-thumb.dark {
  transform: translateX(2rem) scale(1.1);
}
</style>