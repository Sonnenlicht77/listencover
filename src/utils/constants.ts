import type { Settings } from '@/types';

/* ========== IndexedDB ========== */
export const DB_NAME = 'listencover';
export const DB_VERSION = 1;
export const STORE_DOCS = 'docs';

/* ========== 文件限制 ========== */
/** 硬上限 10MB */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
/** 推荐上限 5MB */
export const RECOMMENDED_FILE_SIZE = 5 * 1024 * 1024;
/** 段落数上限 */
export const MAX_PARAGRAPHS = 50000;

/* ========== 存储 key ========== */
export const SETTINGS_KEY = 'listencover-settings';

/* ========== 默认设置 ========== */
export const DEFAULT_SETTINGS: Settings = {
  lang: 'zh-CN',
  rate: 1,
  voiceName: null,
  theme: 'day',
  bossKey: '~',
  bossPause: true,
  autoPauseOnBlur: true,
  ttsEngine: 'web-speech',
};

/* ========== TTS ========== */
/** 中文语音优选列表，按优先级排序 */
export const PREFERRED_VOICES_ZH = [
  'Microsoft Xiaoxiao',
  'Microsoft Yunxi',
  'Microsoft Yaoyao',
  'Google 普通话',
  'Ting-Ting',
];

/** 英文语音优选列表 */
export const PREFERRED_VOICES_EN = [
  'Google US English',
  'Samantha',
  'Microsoft Zira',
  'Microsoft David',
];

/** 长时间朗读保活间隔（毫秒） */
export const KEEPALIVE_INTERVAL = 5000;

/** 单块朗读的最大字符数 */
export const MAX_CHUNK_LENGTH = 110;
