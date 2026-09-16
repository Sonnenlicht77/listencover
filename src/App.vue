<script setup lang="ts">
import { ref } from 'vue';

const message = ref('listenCover');
</script>

<template>
  <div class="app">
    <h1>{{ message }}</h1>
    <p>项目初始化中…</p>
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
}
</style>
