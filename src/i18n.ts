import { createI18n } from 'vue-i18n';
import zhCN from './locales/zh-CN.json';
import en from './locales/en.json';

/** 支持的语言 */
export type Lang = 'zh-CN' | 'en';

/** 语言存储 key */
const LANG_STORAGE_KEY = 'lang';

/** 支持的语言列表 */
const SUPPORTED_LANGS: Lang[] = ['zh-CN', 'en'];

/**
 * 检测初始语言
 * 优先级：localStorage > 浏览器语言 > 默认中文
 */
function detectInitialLang(): Lang {
  const saved = localStorage.getItem(LANG_STORAGE_KEY);
  if (saved && SUPPORTED_LANGS.includes(saved as Lang)) {
    return saved as Lang;
  }
  const browser = navigator.language;
  if (browser.startsWith('zh')) return 'zh-CN';
  if (browser.startsWith('en')) return 'en';
  return 'zh-CN';
}

/**
 * i18n 实例
 */
export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: detectInitialLang(),
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    en,
  },
  // 缺失 key 时只警告，不报错，方便开发期排查
  missingWarn: import.meta.env.DEV,
  fallbackWarn: import.meta.env.DEV,
});

/**
 * 切换语言
 * @example setLocale('en')
 */
export function setLocale(locale: Lang): void {
  (i18n.global.locale as unknown as { value: Lang }).value = locale;
  localStorage.setItem(LANG_STORAGE_KEY, locale);
  document.documentElement.lang = locale;
}

/**
 * 获取当前语言
 */
export function getLocale(): Lang {
  return (i18n.global.locale as unknown as { value: Lang }).value;
}

/**
 * 获取支持的语言列表
 */
export function getSupportedLangs(): { value: Lang; label: string }[] {
  return [
    { value: 'zh-CN', label: '中文' },
    { value: 'en', label: 'English' },
  ];
}
