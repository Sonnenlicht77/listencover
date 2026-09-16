<script setup lang="ts">
import { computed } from 'vue';
import { formatTime } from '@/utils/text';

const props = defineProps<{
  /** 当前段索引 */
  current: number;
  /** 总段数 */
  total: number;
  /** 当前段内的进度，0–1 */
  paragraphProgress?: number;
  /** 总字符数，用于估算时长 */
  totalChars?: number;
  /** 当前语速，用于估算时长 */
  rate?: number;
}>();

const emit = defineEmits<{
  seek: [paragraphIndex: number];
}>();

/** 进度百分比 */
const pct = computed(() => {
  if (props.total === 0) return 0;
  const base = props.current / props.total;
  const inParagraph = (props.paragraphProgress ?? 0) / props.total;
  return Math.min(100, (base + inParagraph) * 100);
});

/** 当前时间（估算） */
const currentTime = computed(() => {
  if (!props.totalChars || props.totalChars === 0) return '00:00';
  const rate = props.rate ?? 1;
  const charsPerSec = (270 * rate) / 60;
  const doneChars = (props.totalChars * pct.value) / 100;
  return formatTime(doneChars / charsPerSec);
});

/** 总时长（估算） */
const totalTime = computed(() => {
  if (!props.totalChars || props.totalChars === 0) return '00:00';
  const rate = props.rate ?? 1;
  const charsPerSec = (270 * rate) / 60;
  return formatTime(props.totalChars / charsPerSec);
});

/** 点击进度条跳转 */
function handleClick(e: MouseEvent) {
  const target = e.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const paragraphIndex = Math.floor(ratio * props.total);
  emit('seek', paragraphIndex);
}
</script>

<template>
  <div class="progress-row">
    <span class="time">{{ currentTime }}</span>
    <div
      class="track"
      role="slider"
      :aria-valuenow="Math.round(pct)"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="`播放进度 ${Math.round(pct)}%`"
      tabindex="0"
      @click="handleClick"
    >
      <i :style="{ width: pct + '%' }"></i>
    </div>
    <span class="time">{{ totalTime }}</span>
  </div>
</template>

<style scoped>
.progress-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.time {
  font-size: 11px;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
  min-width: 42px;
  text-align: center;
  user-select: none;
}

.track {
  flex: 1;
  height: 5px;
  background: var(--line);
  border-radius: 3px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
}

.track:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.track i {
  display: block;
  height: 100%;
  background: var(--accent);
  transition: width 0.2s linear;
  pointer-events: none;
}
</style>
