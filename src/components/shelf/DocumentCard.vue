<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DocumentRecord } from '@/types';

const props = defineProps<{
  doc: DocumentRecord;
}>();

const emit = defineEmits<{
  open: [id: string];
  delete: [id: string];
}>();

const { t } = useI18n();

/** 封面首字母 */
const initial = computed(() => {
  return (props.doc.name.trim().charAt(0) || '书').toUpperCase();
});

/** 封面背景色：根据名称哈希生成稳定色相 */
const coverStyle = computed(() => {
  let hash = 0;
  for (let i = 0; i < props.doc.name.length; i++) {
    hash = (hash * 31 + props.doc.name.charCodeAt(i)) % 360;
  }
  return {
    background: `hsl(${hash}, 42%, 52%)`,
  };
});

/** 阅读进度百分比 */
const progressPct = computed(() => {
  const total = props.doc.paragraphs.length || 1;
  const cur = props.doc.progress.cur || 0;
  return Math.min(100, Math.round((cur / total) * 100));
});

/** 格式 + 段落数 + 语言 */
const metaLine = computed(() => {
  const ext = props.doc.ext.toUpperCase();
  const paragraphs = t('shelf.paragraphs', { n: props.doc.paragraphs.length });
  const lang = props.doc.language === 'zh' ? '中文' : 'English';
  return `${ext} · ${paragraphs} · ${lang}`;
});

/** 进度文案 */
const progressText = computed(() => {
  if (progressPct.value === 0) return t('shelf.notStarted');
  return t('shelf.progress', { n: progressPct.value });
});

function handleOpen() {
  emit('open', props.doc.id);
}

function handleDelete(e: Event) {
  e.stopPropagation();
  emit('delete', props.doc.id);
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleOpen();
  }
}
</script>

<template>
  <article
    class="doc-card"
    role="button"
    tabindex="0"
    :aria-label="`打开 ${doc.name}`"
    @click="handleOpen"
    @keydown="handleKeydown"
  >
    <div class="cover" :style="coverStyle">
      {{ initial }}
    </div>

    <div class="meta">
      <div class="name" :title="doc.name">{{ doc.name }}</div>
      <div class="sub">{{ metaLine }}</div>
      <div class="progress">
        <i :style="{ width: progressPct + '%' }"></i>
      </div>
      <div class="pct">{{ progressText }}</div>
    </div>

    <button
      class="del"
      type="button"
      :aria-label="`删除 ${doc.name}`"
      :title="t('common.delete')"
      @click="handleDelete"
    >
      ✕
    </button>
  </article>
</template>

<style scoped>
.doc-card {
  position: relative;
  display: flex;
  gap: 12px;
  padding: 12px 14px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 10px;
  cursor: pointer;
  transition:
    border-color 0.15s,
    transform 0.15s,
    box-shadow 0.15s;
}

.doc-card:hover,
.doc-card:focus-visible {
  border-color: var(--accent);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  outline: none;
}

.doc-card:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

.cover {
  width: 42px;
  height: 56px;
  border-radius: 6px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  box-shadow: inset -3px 0 0 rgba(0, 0, 0, 0.15);
  user-select: none;
}

.meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name {
  font-size: 14px;
  font-weight: 600;
  color: var(--fg);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sub {
  font-size: 11.5px;
  color: var(--muted);
}

.progress {
  height: 3px;
  background: var(--line);
  border-radius: 2px;
  overflow: hidden;
  margin-top: auto;
}

.progress i {
  display: block;
  height: 100%;
  background: var(--accent);
  transition: width 0.2s;
}

.pct {
  font-size: 11px;
  color: var(--muted);
}

.del {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 26px;
  height: 26px;
  min-width: 26px;
  min-height: 26px;
  padding: 0;
  border-radius: 6px;
  border: 1px solid var(--line);
  background: var(--bg);
  color: var(--muted);
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  opacity: 0;
  transition:
    opacity 0.15s,
    background 0.15s,
    color 0.15s;
}

.doc-card:hover .del,
.doc-card:focus-within .del {
  opacity: 1;
}

.del:hover {
  background: #e05a5a;
  color: #fff;
  border-color: #e05a5a;
}

.del:focus-visible {
  opacity: 1;
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}
</style>
