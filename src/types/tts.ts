/**
 * 朗读选项
 */
export interface SpeakOptions {
  /** 语言代码，如 'zh-CN'、'en-US' */
  lang?: string;
  /** 指定音色 */
  voice?: SpeechSynthesisVoice | null;
  /** 语速，0.5 – 2.5 */
  rate?: number;
}
