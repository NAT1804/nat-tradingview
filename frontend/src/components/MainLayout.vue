<script setup lang="ts">
import { ref } from "vue";
import ChevronIcon from "./icons/ChevronIcon.vue";
import LeftSidebar from "./LeftSidebar.vue";
import Navigator from "./Navigator.vue";

const isLeftPanelCollapsed = ref(false);

const toggleLeftPanel = () => {
  isLeftPanelCollapsed.value = !isLeftPanelCollapsed.value;
  console.log(isLeftPanelCollapsed.value);
};
</script>

<template>
  <div class="layout">
    <div class="layout__top">
      <Navigator />
    </div>

    <div class="layout__left" :class="{ collapsed: isLeftPanelCollapsed }">
      <LeftSidebar :isCollapsed="isLeftPanelCollapsed" @toggle="toggleLeftPanel" />

    </div>

    <button @click="toggleLeftPanel" class="layout__left__toggle-btn" :class="{ collapsed: isLeftPanelCollapsed }"
      :title="isLeftPanelCollapsed
        ? 'Show Drawings Toolbar'
        : 'Hide Drawings Toolbar'
        ">
      <ChevronIcon class="text-foreground" :direction="isLeftPanelCollapsed ? 'right' : 'left'" />
    </button>

    <main class="layout__center" :class="{ expanded: isLeftPanelCollapsed }">
      <router-view />
    </main>

    <div class="layout__right"></div>
  </div>
</template>

<style scoped>
@reference "../style.css";

.layout {
  @apply relative w-full h-full min-h-screen;
}

.layout__top {
  @apply absolute top-0 left-0 w-full z-10 bg-layout-background;
  height: var(--layout-top-height);
}

.layout__left {
  @apply absolute left-0 z-10 transition-all duration-300 ease-in-out bg-layout-background;
  top: calc(var(--layout-top-height) + var(--layout-base-gap));
  width: var(--layout-sidebar-width);
  height: calc(100vh - var(--layout-top-height) - var(--layout-base-gap));
}

.layout__left.collapsed {
  width: var(--layout-sidebar-collapsed-width);
  overflow: hidden;
}

.layout__center {
  @apply absolute transition-all duration-300 ease-in-out bg-layout-background;
  top: calc(var(--layout-top-height) + var(--layout-base-gap));
  left: calc(var(--layout-sidebar-width) + var(--layout-base-gap));
  height: calc(100vh - var(--layout-top-height) - var(--layout-base-gap));
  width: calc(100vw - var(--layout-sidebar-width) - var(--layout-base-gap));
}

.layout__center.expanded {
  left: calc(var(--layout-sidebar-collapsed-width) + var(--layout-base-gap));
  width: calc(100vw - var(--layout-sidebar-collapsed-width) - var(--layout-base-gap));
}

.layout__right {
  @apply absolute top-0 right-0 w-0;
  top: calc(var(--layout-top-height) + var(--layout-base-gap));
  height: calc(100vh - var(--layout-top-height) - var(--layout-base-gap));
}

.layout__left__toggle-btn {
  @apply absolute transform w-fit h-fit transition-all duration-200 z-20 bg-layout-background;
  left: calc(var(--layout-sidebar-width) - var(--layout-base-gap));
  bottom: 58px;
}

.layout__left__toggle-btn.collapsed {
  left: 0;
}

.layout__left__toggle-btn:hover {
  @apply scale-110;
}
</style>
