<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { setLocale, getLocale } from './i18n';

const { t } = useI18n();

function toggleLang() {
  setLocale(getLocale() === 'zh-CN' ? 'en' : 'zh-CN');
}
</script>

<template>
  <div class="app">
    <h1>{{ t('app.title') }}</h1>
    <p>{{ t('shelf.empty') }}</p>
    <button @click="toggleLang">切换语言 / Toggle</button>
    <p>当前语言 / Current: {{ getLocale() }}</p>
  </div>
</template>

<style scoped>
.app {
  padding: 24px;
  font-family: -apple-system, 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
}

h1 {
  font-size: 20px;
  margin-bottom: 8px;
}

p {
  color: #888;
  font-size: 14px;
  margin-bottom: 8px;
}

button {
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
}
</style>
