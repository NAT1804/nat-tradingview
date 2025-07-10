import { createRouter, createWebHistory } from "vue-router";
import ChartView from "../views/ChartView.vue";
import SettingsView from "../views/SettingsView.vue";

const routes = [
  {
    path: "/",
    name: "ChartView",
    component: ChartView,
  },
  {
    path: "/settings",
    name: "Settings",
    component: SettingsView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
