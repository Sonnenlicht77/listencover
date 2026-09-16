import type { SpeakOptions } from '@/types';

/**
 * TTS 引擎抽象接口
 * 所有引擎实现（保底层、增强层、备选层）都必须实现此接口
 */
export abstract class TTSEngine {
  /** 引擎唯一标识，如 'web-speech' */
  abstract readonly id: string;

  /** 引擎显示名称，如 'Web Speech API' */
  abstract readonly name: string;

  /**
   * 检测引擎是否可用
   * 用于引擎管理器按优先级选择
   */
  abstract isAvailable(): Promise<boolean>;

  /**
   * 获取引擎支持的所有音色
   */
  abstract getVoices(): Promise<SpeechSynthesisVoice[]>;

  /**
   * 朗读一段文本
   * 返回 Promise，在朗读完成后 resolve
   */
  abstract speak(text: string, options?: SpeakOptions): Promise<void>;

  /** 暂停当前朗读 */
  abstract pause(): Promise<void>;

  /** 继续当前朗读 */
  abstract resume(): Promise<void>;

  /** 停止当前朗读 */
  abstract stop(): Promise<void>;
}
