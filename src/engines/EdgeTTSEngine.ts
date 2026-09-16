import { TTSEngine } from './TTSEngine';
import type { SpeakOptions } from '@/types';

/**
 * Edge TTS 引擎（备选层，预留）
 * 非官方接口，可能随时失效，需用户明确开启
 */
export class EdgeTTSEngine extends TTSEngine {
  readonly id = 'edge-tts';
  readonly name = 'Edge TTS';

  async isAvailable(): Promise<boolean> {
    return false;
  }

  async getVoices(): Promise<SpeechSynthesisVoice[]> {
    return [];
  }

  async speak(_text: string, _options?: SpeakOptions): Promise<void> {
    throw new Error('Edge TTS engine not implemented yet');
  }

  async pause(): Promise<void> {
    throw new Error('Edge TTS engine not implemented yet');
  }

  async resume(): Promise<void> {
    throw new Error('Edge TTS engine not implemented yet');
  }

  async stop(): Promise<void> {
    throw new Error('Edge TTS engine not implemented yet');
  }
}
