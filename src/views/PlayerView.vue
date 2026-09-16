<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { playerStore } from '@/stores/playerStore';
import { settingsStore } from '@/stores/settingsStore';
import { useKeyboard } from '@/composables/useKeyboard';
import { useDisguise } from '@/composables/useDisguise';

import PlayButton from '@/components/player/PlayButton.vue';
import ProgressBar from '@/components/player/ProgressBar.vue';
import TrackInfo from '@/components/player/TrackInfo.vue';
import SalesTable from '@/components/disguise/SalesTable.vue';
import DisguiseButton from '@/components/disguise/DisguiseButton.vue';

const emit = defineEmits<{
  /** 返回文档列表 */
  openShelf: [];
}>();

const { t } = useI18n();

const disguise = useDisguise();

/** 工具栏是否可见（播放中无操作时自动隐藏） */
const toolbarVisible = ref(true);
let idleTimer: number | null = null;

/** 当前是否处于播放中（用于判断是否启动自动隐藏） */
const isPlaying = computed(() => playerStore.speaking && !playerStore.paused);

/** 副标题文案 */
const statusText = computed(() => {
  if (!playerStore.doc) return t('player.ready');
  if (!playerStore.speaking) return t('player.ready');
  if (playerStore.paused) return t('player.paused');
  return t('player.playing');
});

/** 当前音色名称 */
const voiceLabel = computed(() => {
  return settingsStore.voiceName || t('player.defaultVoice');
});

/* ========== 自动隐藏工具栏 ========== */

function resetIdleTimer() {
  toolbarVisible.value = true;
  if (idleTimer !== null) clearTimeout(idleTimer);

  // 只有播放中才自动隐藏
  if (isPlaying.value && !disguise.active.value) {
    idleTimer = window.setTimeout(() => {
      toolbarVisible.value = false;
    }, 3500);
  }
}

function onUserActivity() {
  resetIdleTimer();
}

/* ========== 播放器快捷键 ========== */

useKeyboard({
  toggle: () => {
    if (!disguise.active.value) void playerStore.toggle();
  },
  prev: () => {
    if (!disguise.active.value) void playerStore.prev();
  },
  next: () => {
    if (!disguise.active.value) void playerStore.next();
  },
  openShelf: () => {
    if (!disguise.active.value) emit('openShelf');
  },
});

/* ========== 生命周期 ========== */

onMounted(() => {
  const events: (keyof DocumentEventMap)[] = ['mousemove', 'mousedown', 'keydown', 'touchstart'];
  events.forEach((ev) => document.addEventListener(ev, onUserActivity, { passive: true }));

  resetIdleTimer();
});

onUnmounted(() => {
  const events: (keyof DocumentEventMap)[] = ['mousemove', 'mousedown', 'keydown', 'touchstart'];
  events.forEach((ev) => document.removeEventListener(ev, onUserActivity));

  if (idleTimer !== null) clearTimeout(idleTimer);

  // 离开播放器时强制解除伪装，避免卡在伪装界面
  void disguise.hide();
});

/* ========== 交互 ========== */

function handleToggle() {
  void playerStore.toggle();
  resetIdleTimer();
}

function handlePrev() {
  void playerStore.prev();
  resetIdleTimer();
}

function handleNext() {
  void playerStore.next();
  resetIdleTimer();
}

function handleSeek(paragraphIndex: number) {
  void playerStore.jumpTo(paragraphIndex);
  resetIdleTimer();
}

function handleImport() {
  // 阶段 6 暂不实现，通过返回列表再上传
  emit('openShelf');
}

/* ========== 伪装交互 ========== */

function handleEnterDisguise() {
  void disguise.show();
  resetIdleTimer();
}

function handleExitDisguise() {
  void disguise.hide();
  resetIdleTimer();
}
</script>

<template>
  <div class="player-page">
    <!-- 顶部工具栏 -->
    <Transition name="toolbar">
      <header v-show="toolbarVisible && !disguise.active.value" class="toolbar">
        <button
          class="icon-btn"
          :title="t('shelf.title')"
          :aria-label="t('shelf.title')"
          @click="emit('openShelf')"
        >
          ☰
        </button>
        <button
          class="icon-btn"
          :title="t('import.title')"
          :aria-label="t('import.title')"
          @click="handleImport"
        >
          📂
        </button>
        <span class="spacer"></span>
      </header>
    </Transition>

    <!-- 播放器主体 -->
    <main class="stage">
      <div v-if="!playerStore.doc" class="no-doc">
        <p>{{ t('player.noDocument') }}</p>
        <button class="btn solid" @click="emit('openShelf')">
          {{ t('shelf.title') }}
        </button>
      </div>

      <div v-else class="player-card">
        <TrackInfo
          :doc-name="playerStore.doc.name"
          :current="playerStore.cur"
          :total="playerStore.total"
        />

        <div class="play-area">
          <PlayButton
            :speaking="playerStore.speaking"
            :paused="playerStore.paused"
            @toggle="handleToggle"
          />
        </div>

        <ProgressBar
          :current="playerStore.cur"
          :total="playerStore.total"
          :total-chars="playerStore.doc.totalChars"
          :rate="settingsStore.rate"
          @seek="handleSeek"
        />

        <div class="nav-area">
          <button
            class="nav-btn"
            :title="t('player.prev')"
            :aria-label="t('player.prev')"
            @click="handlePrev"
          >
            ⏮
          </button>
          <button
            class="nav-btn"
            :title="t('player.next')"
            :aria-label="t('player.next')"
            @click="handleNext"
          >
            ⏭
          </button>
        </div>

        <div class="meta-area">
          <span>{{ t('player.speed') }} {{ settingsStore.rate.toFixed(1) }}x</span>
          <span class="dot">·</span>
          <span>{{ t('player.voice') }}：{{ voiceLabel }}</span>
        </div>

        <div v-if="playerStore.error" class="error-tip">
          {{ playerStore.error }}
        </div>
      </div>
    </main>

    <!-- 底部状态栏 -->
    <Transition name="statusbar">
      <footer v-show="toolbarVisible && !disguise.active.value" class="statusbar">
        <span>{{ statusText }}</span>
        <div class="progress-mini">
          <i :style="{ width: playerStore.progressPct + '%' }"></i>
        </div>
        <span>{{ Math.round(playerStore.progressPct) }}%</span>
      </footer>
    </Transition>

    <!-- 浮动伪装按钮：仅在非伪装状态显示 -->
    <DisguiseButton v-if="!disguise.active.value" @toggle="handleEnterDisguise" />

    <!-- 伪装界面：点击品牌区域返回 -->
    <SalesTable v-if="disguise.active.value" @back="handleExitDisguise" />
  </div>
</template>
<style scoped>
.player-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg);
  color: var(--fg);
}

/* ========== 顶部工具栏 ========== */
.toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: var(--panel);
  border-bottom: 1px solid var(--line);
  flex: none;
}

.spacer {
  flex: 1;
}

.icon-btn {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  color: var(--fg);
  cursor: pointer;
  transition: background 0.15s;
}

.icon-btn:hover:not(:disabled) {
  background: var(--btn);
}

.icon-btn:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

.icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ========== 主区域 ========== */
.stage {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
}

.no-doc {
  text-align: center;
  color: var(--muted);
  font-size: 14px;
}

.no-doc p {
  margin-bottom: 16px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font: inherit;
  font-size: 13px;
  padding: 8px 18px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--panel);
  color: var(--fg);
  cursor: pointer;
  transition: background 0.15s;
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

/* ========== 播放器卡片 ========== */
.player-card {
  width: 100%;
  max-width: 420px;
  padding: 28px 24px 24px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
}

.play-area {
  display: flex;
  justify-content: center;
  padding: 4px 0;
}

.nav-area {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.nav-btn {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--fg);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.nav-btn:hover {
  background: var(--btn);
}

.nav-btn:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 3px;
}

.meta-area {
  display: flex;
  justify-content: center;
  gap: 8px;
  font-size: 11.5px;
  color: var(--muted);
  user-select: none;
}

.meta-area .dot {
  opacity: 0.5;
}

.error-tip {
  padding: 8px 12px;
  background: rgba(192, 57, 43, 0.08);
  border: 1px solid rgba(192, 57, 43, 0.3);
  border-radius: 6px;
  color: #c0392b;
  font-size: 12px;
  text-align: center;
}

/* ========== 底部状态栏 ========== */
.statusbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 16px;
  background: var(--panel);
  border-top: 1px solid var(--line);
  font-size: 11.5px;
  color: var(--muted);
  flex: none;
}

.progress-mini {
  flex: 1;
  height: 3px;
  background: var(--line);
  border-radius: 2px;
  overflow: hidden;
}

.progress-mini i {
  display: block;
  height: 100%;
  background: var(--accent);
  transition: width 0.3s;
}

/* ========== 过渡 ========== */
.toolbar-enter-active,
.toolbar-leave-active,
.statusbar-enter-active,
.statusbar-leave-active {
  transition:
    opacity 0.25s,
    transform 0.25s;
}

.toolbar-enter-from,
.toolbar-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

.statusbar-enter-from,
.statusbar-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>
