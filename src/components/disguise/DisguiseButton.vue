<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const emit = defineEmits<{
  toggle: [];
}>();

const { t } = useI18n();
</script>

<template>
  <button
    class="disguise-btn"
    :title="t('boss.switch')"
    :aria-label="t('boss.switch')"
    @click="emit('toggle')"
  >
    <span class="icon">▣</span>
    <span class="tip">{{ t('boss.switch') }}</span>
  </button>
</template>

<style scoped>
.disguise-btn {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 50;

  width: 40px;
  height: 40px;
  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 15px;
  line-height: 1;

  background: var(--panel);
  color: var(--fg);
  border: 1px solid var(--line);

  cursor: pointer;
  opacity: 0.3;
  transition:
    opacity 0.2s,
    transform 0.15s,
    box-shadow 0.2s;

  /* 避免遮挡内容 */
  user-select: none;
}

.disguise-btn:hover,
.disguise-btn:focus-visible {
  opacity: 1;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  outline: none;
}

.disguise-btn:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

.disguise-btn:active {
  transform: scale(0.94);
}

.tip {
  position: absolute;
  right: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 4px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s;
}

.disguise-btn:hover .tip {
  opacity: 1;
}
/* 触屏设备：默认不透明，避免用户不知道有这个按钮 */
@media (hover: none) {
  .disguise-btn {
    opacity: 0.7;
  }
}
</style>
