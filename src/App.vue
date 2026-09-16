<script setup lang="ts">
import { ref } from 'vue';

const message = ref('listenCover');
</script>

<template>
  <div class="app">
    <h1>{{ message }}</h1>
  </div>
</template>

<style scoped>
.app {
  padding: 24px;
  font-family: -apple-system, 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
}
</style>
