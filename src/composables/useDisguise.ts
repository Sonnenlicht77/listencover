import { ref } from 'vue';
import { settingsStore } from '@/stores/settingsStore';
import { playerStore } from '@/stores/playerStore';

/** 伪装是否激活 */
const active = ref(false);

/**
 * 判断事件目标是否是输入元素
 */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!target) return false;
  const el = target as HTMLElement;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

/**
 * 伪装组合式函数
 */
export function useDisguise() {
  /**
   * 切换伪装状态
   */
  async function toggle(): Promise<void> {
    const next = !active.value;
    await setActive(next);
  }

  /**
   * 显示伪装
   */
  async function show(): Promise<void> {
    await setActive(true);
  }

  /**
   * 隐藏伪装
   */
  async function hide(): Promise<void> {
    await setActive(false);
  }

  /**
   * 设置伪装状态
   */
  async function setActive(next: boolean): Promise<void> {
    active.value = next;

    // 切换到伪装时暂停音频（如果配置开启）
    if (next && settingsStore.bossPause) {
      try {
        await playerStore.pause();
      } catch {
        // 暂停失败不阻塞伪装切换
      }
    }
  }

  return {
    active,
    toggle,
    show,
    hide,
    isTypingTarget,
  };
}
