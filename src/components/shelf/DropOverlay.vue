<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineProps<{
  visible: boolean;
}>();

const { t } = useI18n();
</script>

<template>
  <Transition name="fade">
    <div v-if="visible" class="overlay">
      <div class="content">
        <div class="icon">📄</div>
        <div class="text">{{ t('import.dragHint') }}</div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 110, 165, 0.85);
  pointer-events: none;
  backdrop-filter: blur(2px);
}

.content {
  text-align: center;
  color: #fff;
  padding: 40px;
  border: 4px dashed rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  max-width: 80vw;
}

.icon {
  font-size: 48px;
  margin-bottom: 12px;
  line-height: 1;
}

.text {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
