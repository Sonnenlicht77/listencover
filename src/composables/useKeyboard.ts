import { onMounted, onUnmounted } from 'vue';

export interface KeyboardActions {
  /** 播放 / 暂停 */
  toggle?: () => void;
  /** 上一段 */
  prev?: () => void;
  /** 下一段 */
  next?: () => void;
  /** 伪装切换（阶段 7 实现） */
  toggleBoss?: () => void;
  /** 打开文档列表 */
  openShelf?: () => void;
  /** 是否启用（默认 true） */
  enabled?: boolean;
}

/**
 * 判断事件目标是否是输入元素
 * 是则不拦截键盘事件，避免影响用户输入
 */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!target) return false;
  const el = target as HTMLElement;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

/**
 * 绑定播放器键盘快捷键
 * 组件卸载时自动解绑
 */
export function useKeyboard(actions: KeyboardActions): void {
  function handler(e: KeyboardEvent) {
    if (actions.enabled === false) return;
    if (isTypingTarget(e.target)) return;

    // 有修饰键时不拦截（保留浏览器默认行为）
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    switch (e.key) {
      case ' ':
        e.preventDefault();
        actions.toggle?.();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        actions.prev?.();
        break;
      case 'ArrowRight':
        e.preventDefault();
        actions.next?.();
        break;
      case 'Escape':
        e.preventDefault();
        actions.toggleBoss?.();
        break;
      case 'b':
      case 'B':
        e.preventDefault();
        actions.openShelf?.();
        break;
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handler);
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', handler);
  });
}
