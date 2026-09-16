import { TTSEngine } from './TTSEngine';
import type { SpeakOptions } from '@/types';

/**
 * Web Speech API 保底层引擎
 * 零依赖、零配置、完全离线
 */
export class WebSpeechEngine extends TTSEngine {
  readonly id = 'web-speech';
  readonly name = 'Web Speech API';

  async isAvailable(): Promise<boolean> {
    if (!('speechSynthesis' in window)) return false;
    const voices = speechSynthesis.getVoices();
    // voices 可能异步加载，首次可能为空数组
    // 这里不阻塞，返回 true 让上层继续；真正调用 speak 时会再次检查
    return voices.length > 0 || speechSynthesis.getVoices().length === 0;
  }

  async getVoices(): Promise<SpeechSynthesisVoice[]> {
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) return voices;

    // 等待 voiceschanged 事件
    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve([]), 2000);
      speechSynthesis.addEventListener(
        'voiceschanged',
        () => {
          clearTimeout(timer);
          resolve(speechSynthesis.getVoices());
        },
        { once: true }
      );
    });
  }

  async speak(text: string, options?: SpeakOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options?.lang ?? 'zh-CN';
      if (options?.voice) utterance.voice = options.voice;
      utterance.rate = options?.rate ?? 1;

      utterance.onend = () => resolve();
      utterance.onerror = (e) => {
        // interrupted / canceled 是正常中断，不视为错误
        if (e.error === 'interrupted' || e.error === 'canceled') {
          resolve();
        } else {
          reject(new Error(`TTS 错误: ${e.error}`));
        }
      };

      speechSynthesis.speak(utterance);
    });
  }

  async pause(): Promise<void> {
    speechSynthesis.pause();
  }

  async resume(): Promise<void> {
    speechSynthesis.resume();
  }

  async stop(): Promise<void> {
    speechSynthesis.cancel();
  }
}
