import { reactive } from 'vue';
import type { DocumentRecord } from '@/types';
import { useTTS } from '@/composables/useTTS';
import { updateProgress } from '@/composables/useStorage';
import { splitChunks } from '@/utils/text';
import { settingsStore } from './settingsStore';

const tts = useTTS();

/** TTS 是否已初始化 */
let ttsInitialized = false;

/**
 * 等待指定毫秒
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 确保 TTS 已初始化
 */
async function ensureTTS(): Promise<boolean> {
  if (ttsInitialized && tts.available.value) return true;
  const ok = await tts.init();
  ttsInitialized = ok;
  return ok;
}

/**
 * 播放器 Store
 */
export const playerStore = reactive({
  /* ========== 状态 ========== */
  doc: null as DocumentRecord | null,
  cur: 0,
  speaking: false,
  paused: false,
  error: null as string | null,
  ttsReady: false,

  /* ========== 计算属性 ========== */
  get total(): number {
    return this.doc?.paragraphs.length ?? 0;
  },

  get currentParagraph(): string {
    return this.doc?.paragraphs[this.cur] ?? '';
  },

  get progressPct(): number {
    if (this.total === 0) return 0;
    return ((this.cur + 1) / this.total) * 100;
  },

  /* ========== 方法 ========== */

  /**
   * 初始化 TTS（应用启动时调用一次即可）
   */
  async initTTS(): Promise<boolean> {
    const ok = await ensureTTS();
    this.ttsReady = ok;
    if (!ok) {
      this.error = '没有可用的 TTS 引擎，请使用 Chrome / Edge 浏览器';
    }
    return ok;
  },

  /**
   * 加载文档，重置播放状态
   */
  async loadDoc(doc: DocumentRecord): Promise<void> {
    await this.stop();
    this.doc = doc;
    this.cur = Math.max(0, Math.min(doc.progress.cur, doc.paragraphs.length - 1));
    this.error = null;
  },

  /**
   * 播放：从当前段开始
   */
  async play(): Promise<void> {
    if (!this.doc) {
      this.error = '没有加载文档';
      return;
    }
    // 已在播放且未暂停
    if (this.speaking && !this.paused) return;
    // 已暂停，转为继续
    if (this.speaking && this.paused) {
      this.resume();
      return;
    }

    // 确保 TTS 已初始化
    const ttsOk = await ensureTTS();
    if (!ttsOk) {
      this.error = '没有可用的 TTS 引擎，请使用 Chrome / Edge 浏览器';
      return;
    }
    this.ttsReady = true;

    this.speaking = true;
    this.paused = false;
    this.error = null;

    // 后台运行，不 await
    this.playLoop().catch((e) => {
      this.error = (e as Error).message;
      this.speaking = false;
      this.paused = false;
    });
  },

  /**
   * 播放循环：从当前段开始逐段朗读
   */
  async playLoop(): Promise<void> {
    if (!this.doc) return;

    const doc = this.doc;
    const rate = settingsStore.rate;

    while (this.speaking && this.cur < this.total) {
      // 暂停等待
      if (this.paused) {
        await sleep(100);
        continue;
      }

      const paragraph = doc.paragraphs[this.cur];
      const chunks = splitChunks(paragraph);

      let interrupted = false;
      for (const chunk of chunks) {
        if (!this.speaking) return;
        if (this.paused) {
          interrupted = true;
          break;
        }
        await tts.speak(chunk, { rate });
      }

      if (!this.speaking) return;
      if (interrupted) continue;

      // 一段读完，保存进度
      await updateProgress(doc.id, this.cur);
      this.cur++;
    }

    // 全部读完
    this.speaking = false;
    this.paused = false;
  },

  /**
   * 暂停
   */
  async pause(): Promise<void> {
    if (!this.speaking || this.paused) return;
    this.paused = true;
    await tts.stop();
  },

  /**
   * 继续
   */
  resume(): void {
    if (!this.speaking || !this.paused) return;
    this.paused = false;
  },

  /**
   * 停止
   */
  async stop(): Promise<void> {
    this.speaking = false;
    this.paused = false;
    await tts.stop();
    if (this.doc) {
      await updateProgress(this.doc.id, this.cur);
    }
  },

  /**
   * 切换播放/暂停
   */
  async toggle(): Promise<void> {
    if (!this.speaking) {
      await this.play();
    } else if (this.paused) {
      this.resume();
    } else {
      await this.pause();
    }
  },

  /**
   * 下一段
   */
  async next(): Promise<void> {
    if (!this.doc) return;
    const wasSpeaking = this.speaking;
    await this.stop();
    this.cur = Math.min(this.cur + 1, this.total - 1);
    if (wasSpeaking) {
      await this.play();
    } else {
      await updateProgress(this.doc.id, this.cur);
    }
  },

  /**
   * 上一段
   */
  async prev(): Promise<void> {
    if (!this.doc) return;
    const wasSpeaking = this.speaking;
    await this.stop();
    this.cur = Math.max(this.cur - 1, 0);
    if (wasSpeaking) {
      await this.play();
    } else {
      await updateProgress(this.doc.id, this.cur);
    }
  },

  /**
   * 跳转到指定段
   */
  async jumpTo(index: number): Promise<void> {
    if (!this.doc) return;
    const wasSpeaking = this.speaking;
    await this.stop();
    this.cur = Math.max(0, Math.min(index, this.total - 1));
    if (wasSpeaking) {
      await this.play();
    } else {
      await updateProgress(this.doc.id, this.cur);
    }
  },

  /**
   * 重置
   */
  async reset(): Promise<void> {
    await this.stop();
    this.doc = null;
    this.cur = 0;
    this.error = null;
  },
});
