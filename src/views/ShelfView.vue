<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { shelfStore } from '@/stores/shelfStore';
import { playerStore } from '@/stores/playerStore';
import { parseFiles } from '@/composables/useFileParser';
import DocumentCard from '@/components/shelf/DocumentCard.vue';
import DropOverlay from '@/components/shelf/DropOverlay.vue';

const emit = defineEmits<{
  /** 用户打开某个文档，请求父组件切换到播放器视图 */
  openPlayer: [];
}>();

const { t } = useI18n();

const fileInput = ref<HTMLInputElement | null>(null);
const dragActive = ref(false);
const parsing = ref(false);
const parsingText = ref('');
const toast = ref<{ text: string; type: 'ok' | 'error' } | null>(null);

/** 拖拽深度计数，避免子元素触发 dragleave 造成闪烁 */
let dragDepth = 0;
let toastTimer: number | null = null;

function showToast(text: string, type: 'ok' | 'error' = 'ok') {
  toast.value = { text, type };
  if (toastTimer !== null) clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.value = null;
  }, 3000);
}

onMounted(async () => {
  // 只在首次挂载时加载，避免视图切换时重复请求
  if (!shelfStore.initialized) {
    await shelfStore.load();
  }
});

function triggerSelect() {
  fileInput.value?.click();
}

/**
 * 统一处理文件导入流程
 */
async function handleFiles(files: File[]) {
  if (!files.length) return;

  parsing.value = true;
  parsingText.value = t('import.parsing', { cur: 1, total: files.length });

  try {
    const { successes, failures } = await parseFiles(files);

    if (successes.length) {
      await shelfStore.addMany(successes);
    }

    if (successes.length && !failures.length) {
      showToast(t('shelf.importSuccess', { n: successes.length }), 'ok');
    } else if (successes.length && failures.length) {
      showToast(
        t('shelf.importPartial', {
          ok: successes.length,
          fail: failures.length,
        }),
        'ok'
      );
    } else if (failures.length) {
      showToast(failures[0].reason, 'error');
    }
  } catch (e) {
    showToast((e as Error).message, 'error');
  } finally {
    parsing.value = false;
    parsingText.value = '';
  }
}

function onFileInputChange(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files.length) {
    void handleFiles([...input.files]);
    input.value = '';
  }
}

/* ========== 拖拽事件 ========== */

function onDragEnter(e: DragEvent) {
  e.preventDefault();
  dragDepth++;
  if (e.dataTransfer?.types.includes('Files')) {
    dragActive.value = true;
  }
}

function onDragOver(e: DragEvent) {
  e.preventDefault();
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'copy';
  }
}

function onDragLeave(e: DragEvent) {
  e.preventDefault();
  dragDepth--;
  if (dragDepth <= 0) {
    dragDepth = 0;
    dragActive.value = false;
  }
}

function onDrop(e: DragEvent) {
  e.preventDefault();
  dragDepth = 0;
  dragActive.value = false;
  const files = e.dataTransfer?.files;
  if (files && files.length) {
    void handleFiles([...files]);
  }
}

/* ========== 卡片操作 ========== */

async function handleOpen(id: string) {
  const doc = shelfStore.getById(id);
  if (!doc) {
    showToast(t('common.error'), 'error');
    return;
  }
  await playerStore.loadDoc(doc);
  emit('openPlayer');
}

async function handleDelete(id: string) {
  const doc = shelfStore.getById(id);
  if (!doc) return;

  const confirmed = window.confirm(t('shelf.deleteConfirm', { name: doc.name }));
  if (!confirmed) return;

  await shelfStore.remove(id);

  // 如果删的是当前播放的文档，重置播放器
  if (playerStore.doc?.id === id) {
    await playerStore.reset();
  }

  showToast(t('shelf.deleted'), 'ok');
}
</script>

<template>
  <div
    class="shelf"
    @dragenter="onDragEnter"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <header class="head">
      <h1>{{ t('shelf.title') }}</h1>
      <span v-if="shelfStore.docs.length" class="count">
        {{ t('shelf.count', { n: shelfStore.docs.length }) }}
      </span>
      <div class="spacer"></div>
      <button class="btn solid" @click="triggerSelect">＋ {{ t('shelf.add') }}</button>
    </header>

    <input
      ref="fileInput"
      type="file"
      accept=".txt,.md,.markdown"
      multiple
      style="display: none"
      @change="onFileInputChange"
    />

    <main class="body">
      <div v-if="shelfStore.loading" class="state">
        {{ t('common.loading') }}
      </div>

      <div v-else-if="shelfStore.error" class="state error">
        {{ shelfStore.error }}
      </div>

      <div v-else-if="!shelfStore.docs.length" class="empty">
        <div class="empty-icon">📄</div>
        <h2>{{ t('shelf.empty') }}</h2>
        <p>{{ t('shelf.emptyHint') }}</p>
        <button class="btn solid lg" @click="triggerSelect">
          {{ t('shelf.upload') }}
        </button>
      </div>

      <div v-else class="grid">
        <DocumentCard
          v-for="doc in shelfStore.docs"
          :key="doc.id"
          :doc="doc"
          @open="handleOpen"
          @delete="handleDelete"
        />
      </div>
    </main>

    <!-- 解析中遮罩 -->
    <Transition name="fade">
      <div v-if="parsing" class="parsing-mask">
        <div class="parsing-card">
          <div class="spinner"></div>
          <div class="parsing-text">{{ parsingText }}</div>
          <div class="parsing-hint">{{ t('import.parsingLocal') }}</div>
        </div>
      </div>
    </Transition>

    <!-- 拖拽遮罩 -->
    <DropOverlay :visible="dragActive" />

    <!-- 底部提示 -->
    <Transition name="toast">
      <div v-if="toast" class="toast" :class="toast.type">
        {{ toast.text }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.shelf {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg);
  color: var(--fg);
}

/* ========== 顶部工具栏 ========== */
.head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: var(--panel);
  border-bottom: 1px solid var(--line);
  flex: none;
}

.head h1 {
  font-size: 16px;
  font-weight: 700;
}

.count {
  font-size: 12px;
  color: var(--muted);
}

.spacer {
  flex: 1;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font: inherit;
  font-size: 13px;
  padding: 6px 14px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--panel);
  color: var(--fg);
  cursor: pointer;
  transition: background 0.15s;
}

.btn:hover {
  background: var(--btn);
}

.btn:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

.btn.solid {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.btn.solid:hover {
  opacity: 0.9;
  background: var(--accent);
}

.btn.lg {
  padding: 10px 22px;
  font-size: 14px;
}

/* ========== 主区域 ========== */
.body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.state {
  padding: 40px 20px;
  text-align: center;
  color: var(--muted);
  font-size: 14px;
}

.state.error {
  color: #c0392b;
}

/* ========== 空状态 ========== */
.empty {
  max-width: 400px;
  margin: 8vh auto 0;
  text-align: center;
  padding: 0 20px;
}

.empty-icon {
  font-size: 52px;
  line-height: 1;
  margin-bottom: 16px;
  opacity: 0.7;
}

.empty h2 {
  font-size: 16px;
  margin-bottom: 8px;
  color: var(--fg);
}

.empty p {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.8;
  margin-bottom: 24px;
}

/* ========== 文档网格 ========== */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
  max-width: 1080px;
  margin: 0 auto;
}

/* ========== 解析中遮罩 ========== */
.parsing-mask {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.parsing-card {
  background: var(--panel);
  border-radius: 12px;
  padding: 28px 36px;
  text-align: center;
  max-width: 90vw;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.spinner {
  width: 34px;
  height: 34px;
  border: 3px solid var(--line);
  border-top-color: var(--accent);
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.parsing-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--fg);
  margin-bottom: 6px;
}

.parsing-hint {
  font-size: 12px;
  color: var(--muted);
}

/* ========== Toast ========== */
.toast {
  position: fixed;
  left: 50%;
  bottom: 40px;
  transform: translateX(-50%);
  z-index: 400;
  background: rgba(0, 0, 0, 0.86);
  color: #fff;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 13px;
  max-width: 80vw;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.toast.error {
  background: #c0392b;
}

/* ========== 过渡动画 ========== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.25s,
    transform 0.25s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(16px);
}
</style>
