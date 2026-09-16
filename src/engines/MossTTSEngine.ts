import { TTSEngine } from './TTSEngine';
import type { SpeakOptions } from '@/types';

/**
 * MOSS-TTS-Nano 本地模型引擎（增强层，预留）
 * 后续迭代实现，CPU 推理友好
 */
export class MossTTSEngine extends TTSEngine {
  readonly id = 'moss-tts-nano';
  readonly name = 'MOSS-TTS-Nano';

  async isAvailable(): Promise<boolean> {
    return false;
  }

  async getVoices(): Promise<SpeechSynthesisVoice[]> {
    return [];
  }

  async speak(_text: string, _options?: SpeakOptions): Promise<void> {
    throw new Error('MOSS-TTS-Nano engine not implemented yet');
  }

  async pause(): Promise<void> {
    throw new Error('MOSS-TTS-Nano engine not implemented yet');
  }

  async resume(): Promise<void> {
    throw new Error('MOSS-TTS-Nano engine not implemented yet');
  }

  async stop(): Promise<void> {
    throw new Error('MOSS-TTS-Nano engine not implemented yet');
  }
}
