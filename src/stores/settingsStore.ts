import { reactive, watch } from 'vue';
import type { Settings } from '@/types';
import { DEFAULT_SETTINGS, SETTINGS_KEY } from '@/utils/constants';
import { setLocale } from '@/i18n';

/**
 * 从 localStorage 加载设置
 * 缺失字段用默认值补齐
 */
function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * 应用主题到 body class
 */
function applyTheme(theme: Settings['theme']): void {
  document.body.classList.remove('theme-day', 'theme-night', 'theme-sepia');
  document.body.classList.add(`theme-${theme}`);
}

/**
 * 全局设置 Store
 * 任何字段变化都会自动持久化到 localStorage
 */
export const settingsStore = reactive<Settings>(loadSettings());

// 初始化：应用主题 + 同步语言
applyTheme(settingsStore.theme);
setLocale(settingsStore.lang);

// 深度监听，持久化
watch(
  settingsStore,
  (val) => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(val));
    } catch {
      // 隐私模式或存储满时静默失败
    }
  },
  { deep: true }
);

// 主题变化时更新 body class
watch(
  () => settingsStore.theme,
  (theme) => applyTheme(theme)
);

// 语言变化时同步 i18n
watch(
  () => settingsStore.lang,
  (lang) => setLocale(lang)
);
