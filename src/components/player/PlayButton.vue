<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  speaking: boolean;
  paused: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  toggle: [];
}>();

const { t } = useI18n();

/** 当前按钮显示的状态 */
const state = computed<'play' | 'pause' | 'playing'>(() => {
  if (!props.speaking) return 'play';
  if (props.paused) return 'pause';
  return 'playing';
});

/** 按钮图标 */
const icon = computed(() => {
  switch (state.value) {
    case 'playing':
      return '❚❚';
    case 'pause':
      return '▶';
    case 'play':
    default:
      return '▶';
  }
});

/** aria-label */
const ariaLabel = computed(() => {
  switch (state.value) {
    case 'playing':
      return t('player.pause');
    case 'pause':
      return t('player.play');
    case 'play':
    default:
      return t('player.play');
  }
});

function handleClick() {
  if (props.disabled) return;
  emit('toggle');
}
</script>

<template>
  <button
    class="play-btn"
    :class="state"
    :disabled="disabled"
    :aria-label="ariaLabel"
    :title="ariaLabel"
    @click="handleClick"
  >
    {{ icon }}
  </button>
</template>

<style scoped>
.play-btn {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  border: 2px solid var(--fg);
  background: transparent;
  color: var(--fg);
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.15s,
    border-color 0.15s,
    transform 0.1s,
    color 0.15s;
  user-select: none;
}

.play-btn:hover:not(:disabled) {
  background: var(--btn);
}

.play-btn:active:not(:disabled) {
  transform: scale(0.96);
}

.play-btn:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 3px;
}

.play-btn.playing {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.play-btn.playing:hover:not(:disabled) {
  background: var(--accent);
  opacity: 0.9;
}

.play-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 暂停图标稍微小一点，视觉更平衡 */
.play-btn.playing {
  font-size: 22px;
  letter-spacing: 2px;
}
</style>
