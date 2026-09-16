import type { TTSEngine } from './TTSEngine';
import { WebSpeechEngine } from './WebSpeechEngine';
import { KokoroEngine } from './KokoroEngine';
import { MossTTSEngine } from './MossTTSEngine';
import { EdgeTTSEngine } from './EdgeTTSEngine';

/**
 * TTS 引擎管理器
 * 按优先级选择可用引擎，统一对外提供调用接口
 */
export class TTSEngineManager {
  private engines = new Map<string, TTSEngine>();
  private activeEngine: TTSEngine | null = null;

  /**
   * 引擎优先级列表
   * 保底层在前，增强层和备选层后续迭代启用
   */
  private priority: string[] = [
    'web-speech',
    // 后续启用：
    // 'kokoro',
    // 'moss-tts-nano',
    // 'edge-tts',
  ];

  constructor() {
    this.register(new WebSpeechEngine());
    this.register(new KokoroEngine());
    this.register(new MossTTSEngine());
    this.register(new EdgeTTSEngine());
  }

  /**
   * 注册引擎
   */
  register(engine: TTSEngine): void {
    this.engines.set(engine.id, engine);
  }

  /**
   * 按优先级选择第一个可用引擎
   */
  async selectEngine(): Promise<TTSEngine> {
    for (const id of this.priority) {
      const engine = this.engines.get(id);
      if (engine && (await engine.isAvailable())) {
        this.activeEngine = engine;
        return engine;
      }
    }
    throw new Error('没有可用的 TTS 引擎');
  }

  /**
   * 获取当前活跃引擎
   */
  getEngine(): TTSEngine | null {
    return this.activeEngine;
  }

  /**
   * 获取所有已注册引擎（用于设置面板显示）
   */
  getAllEngines(): TTSEngine[] {
    return [...this.engines.values()];
  }
}

/** 全局单例 */
export const ttsManager = new TTSEngineManager();
