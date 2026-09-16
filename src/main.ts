import { createApp } from 'vue';
import { i18n } from './i18n';
import App from './App.vue';

import './assets/styles/index.css';
import { playerStore } from './stores/index.ts';

createApp(App).use(i18n).mount('#app');

// 应用挂载后初始化 TTS（不阻塞渲染）
playerStore.initTTS().catch(() => {
  // 失败时静默处理，UI 会在用户点击播放时再次提示
});
