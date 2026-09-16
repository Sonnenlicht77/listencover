import type { Lang } from '@/i18n';

/**
 * 主题选项
 */
export type Theme = 'day' | 'night' | 'sepia';

/**
 * 用户设置 — 存储在 localStorage 中
 */
export interface Settings {
  /** 界面语言 */
  lang: Lang;
  /** 朗读语速，0.5 – 2.5 */
  rate: number;
  /** 当前音色名称，null 表示使用默认 */
  voiceName: string | null;
  /** 界面主题 */
  theme: Theme;
  /** 伪装快捷键，默认 '~' */
  bossKey: string;
  /** 切换伪装时是否暂停朗读 */
  bossPause: boolean;
  /** 页面失焦时是否暂停朗读 */
  autoPauseOnBlur: boolean;
  /** 当前 TTS 引擎 ID */
  ttsEngine: string;
}
