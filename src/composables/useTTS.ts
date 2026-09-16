import { ref } from 'vue';
import type { SpeakOptions } from '@/types';
import { ttsManager } from '@/engines/TTSEngineManager';
import { PREFERRED_VOICES_ZH, PREFERRED_VOICES_EN, KEEPALIVE_INTERVAL } from '@/utils/constants';
import { splitChunks } from '@/utils/text';

/** 当前是否有可用 TTS 引擎 */
const available = ref(false);
/** 当前使用的音色 */
const currentVoice = ref<SpeechSynthesisVoice | null>(null);
/** 所有可用音色 */
const voices = ref<SpeechSynthesisVoice[]>([]);
/** 是否正在朗读 */
const speaking = ref(false);
/** 是否处于暂停 */
const paused = ref(false);

/** 保活定时器 */
let keepAliveTimer: number | null = null;
/** 当前朗读的 Promise 解析函数 */
let currentResolve: (() => void) | null = null;

/**
 * 按语言优选音色
 */
function pickVoice(
  allVoices: SpeechSynthesisVoice[],
  lang: 'zh' | 'en'
): SpeechSynthesisVoice | null {
  if (!allVoices.length) return null;

  const preferred = lang === 'zh' ? PREFERRED_VOICES_ZH : PREFERRED_VOICES_EN;

  for (const name of preferred) {
    const voice = allVoices.find((v) => v.name.includes(name));
    if (voice) return voice;
  }

  // 按语言前缀匹配
  const langPrefix = lang === 'zh' ? 'zh' : 'en';
  return allVoices.find((v) => v.lang.startsWith(langPrefix)) || allVoices[0];
}

/**
 * 启动保活定时器，防止 Chrome 静默停止
 */
function startKeepAlive(): void {
  stopKeepAlive();
  keepAliveTimer = window.setInterval(() => {
    if (!speaking.value || paused.value) return;
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
    }
  }, KEEPALIVE_INTERVAL);
}

/**
 * 停止保活定时器
 */
function stopKeepAlive(): void {
  if (keepAliveTimer !== null) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}

/**
 * TTS 组合式函数
 */
export function useTTS() {
  /**
   * 初始化：选择引擎、加载音色
   */
  async function init(): Promise<boolean> {
    try {
      const engine = await ttsManager.selectEngine();
      available.value = true;
      voices.value = await engine.getVoices();

      // 默认选中中文音色
      currentVoice.value = pickVoice(voices.value, 'zh');
      return true;
    } catch {
      available.value = false;
      return false;
    }
  }

  /**
   * 按语言切换音色
   */
  function selectVoiceByLang(lang: 'zh' | 'en'): void {
    currentVoice.value = pickVoice(voices.value, lang);
  }

  /**
   * 按名称选择音色
   */
  function selectVoiceByName(name: string): void {
    const voice = voices.value.find((v) => v.name === name);
    if (voice) currentVoice.value = voice;
  }

  /**
   * 朗读一段文本
   */
  async function speak(text: string, options?: SpeakOptions): Promise<void> {
    const engine = ttsManager.getEngine();
    if (!engine) {
      throw new Error('没有可用的 TTS 引擎');
    }

    speaking.value = true;
    paused.value = false;
    startKeepAlive();

    try {
      await engine.speak(text, {
        lang: currentVoice.value?.lang ?? 'zh-CN',
        voice: currentVoice.value,
        rate: options?.rate ?? 1,
      });
    } finally {
      speaking.value = false;
      paused.value = false;
      stopKeepAlive();
    }
  }

  /**
   * 朗读一整段（自动按标点分块）
   */
  async function speakParagraph(paragraph: string, rate = 1): Promise<void> {
    const chunks = splitChunks(paragraph);

    for (const chunk of chunks) {
      if (!speaking.value) return; // 被停止
      await speak(chunk, { rate });
    }
  }

  /**
   * 暂停
   */
  async function pause(): Promise<void> {
    const engine = ttsManager.getEngine();
    if (!engine || !speaking.value) return;
    await engine.pause();
    paused.value = true;
  }

  /**
   * 继续
   */
  async function resume(): Promise<void> {
    const engine = ttsManager.getEngine();
    if (!engine || !speaking.value || !paused.value) return;
    await engine.resume();
    paused.value = false;
  }

  /**
   * 停止
   */
  async function stop(): Promise<void> {
    const engine = ttsManager.getEngine();
    if (!engine) return;
    speaking.value = false;
    paused.value = false;
    stopKeepAlive();
    await engine.stop();
    if (currentResolve) {
      currentResolve();
      currentResolve = null;
    }
  }

  return {
    // 状态
    available,
    speaking,
    paused,
    voices,
    currentVoice,
    // 方法
    init,
    speak,
    speakParagraph,
    pause,
    resume,
    stop,
    selectVoiceByLang,
    selectVoiceByName,
    pickVoice,
  };
}
