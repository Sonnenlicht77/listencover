<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  /** 文档名称（真实名称，仅用于 aria-label） */
  docName: string;
  /** 当前段索引 */
  current: number;
  /** 总段数 */
  total: number;
  /** 伪装的音频文件名，空则使用默认 */
  fakeName?: string;
}>();

const { t } = useI18n();

/** 显示的伪装文件名 */
const displayName = computed(() => {
  return props.fakeName || 'meeting_recording_0915.mp3';
});

/** 副标题：段落位置 */
const subtitle = computed(() => {
  const cur = Math.min(props.current + 1, props.total);
  return `${cur} / ${props.total}`;
});
</script>

<template>
  <div class="track-info">
    <div class="track-name" :title="displayName" :aria-label="`${t('player.play')}: ${docName}`">
      {{ displayName }}
    </div>
    <div class="track-sub">{{ subtitle }}</div>
  </div>
</template>

<style scoped>
.track-info {
  text-align: center;
  padding: 0 8px;
  max-width: 100%;
}

.track-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--fg);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;
}

.track-sub {
  font-size: 12px;
  color: var(--muted);
  margin-top: 4px;
  user-select: none;
}
</style>
