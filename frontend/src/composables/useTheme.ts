import { ref, watch, onMounted, readonly } from "vue";

// Global theme state
const isDarkMode = ref(false);
const isInitialized = ref(false);

// Theme management functions
const applyTheme = (isDark: boolean) => {
  const html = document.documentElement;
  const body = document.body;

  if (isDark) {
    html.classList.add("dark");
    body.classList.add("dark");
  } else {
    html.classList.remove("dark");
    body.classList.remove("dark");
  }
};

const saveTheme = (isDark: boolean) => {
  localStorage.setItem("theme", isDark ? "dark" : "light");
};

const loadTheme = (): boolean => {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme) {
    return savedTheme === "dark";
  } else {
    // Check system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
};

const initializeTheme = () => {
  if (!isInitialized.value) {
    isDarkMode.value = loadTheme();
    applyTheme(isDarkMode.value);
    isInitialized.value = true;
  }
};

// Watch for theme changes and apply them
watch(
  isDarkMode,
  (newValue) => {
    if (isInitialized.value) {
      applyTheme(newValue);
      saveTheme(newValue);
    }
  },
  { immediate: false }
);

// Listen for system theme changes
const handleSystemThemeChange = (e: MediaQueryListEvent) => {
  if (!localStorage.getItem("theme")) {
    isDarkMode.value = e.matches;
  }
};

// Composable function
export function useTheme() {
  // Initialize theme on first use
  onMounted(() => {
    initializeTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", handleSystemThemeChange);

    // Cleanup function
    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  });

  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
  };

  const setTheme = (theme: "light" | "dark") => {
    isDarkMode.value = theme === "dark";
  };

  const getTheme = () => {
    return isDarkMode.value ? "dark" : "light";
  };

  return {
    isDarkMode: readonly(isDarkMode),
    toggleTheme,
    setTheme,
    getTheme,
    isInitialized: readonly(isInitialized),
  };
}

// Export for direct access if needed
export { isDarkMode, initializeTheme };
