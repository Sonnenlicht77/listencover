import { TTSEngine } from './TTSEngine';
import type { SpeakOptions } from '@/types';

/**
 * Kokoro 本地模型引擎（增强层，预留）
 * 后续迭代实现，需要用户首次下载模型
 */
export class KokoroEngine extends TTSEngine {
  readonly id = 'kokoro';
  readonly name = 'Kokoro';

  async isAvailable(): Promise<boolean> {
    // TODO: 检测模型是否已下载
    return false;
  }

  async getVoices(): Promise<SpeechSynthesisVoice[]> {
    // TODO: 返回 Kokoro 支持的音色列表
    return [];
  }

  async speak(_text: string, _options?: SpeakOptions): Promise<void> {
    throw new Error('Kokoro engine not implemented yet');
  }

  async pause(): Promise<void> {
    throw new Error('Kokoro engine not implemented yet');
  }

  async resume(): Promise<void> {
    throw new Error('Kokoro engine not implemented yet');
  }

  async stop(): Promise<void> {
    throw new Error('Kokoro engine not implemented yet');
  }
}
