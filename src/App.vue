<script setup lang="ts">
import { ref } from 'vue';
import ShelfView from '@/views/ShelfView.vue';

type View = 'shelf' | 'player';

const currentView = ref<View>('shelf');

function handleOpenPlayer() {
  // 阶段 6 会把这里改为切换到 PlayerView
  // 当前先保持 shelf 视图，只记录状态
  currentView.value = 'player';
}
</script>

<template>
  <ShelfView v-if="currentView === 'shelf'" @open-player="handleOpenPlayer" />

  <div v-else class="placeholder">
    <h1>播放器视图</h1>
    <p>阶段 6 实现</p>
    <button @click="currentView = 'shelf'">返回文档列表</button>
  </div>
</template>

<style scoped>
.placeholder {
  padding: 40px;
  text-align: center;
  font-family: -apple-system, 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
  color: #666;
}

.placeholder h1 {
  font-size: 18px;
  margin-bottom: 8px;
  color: #2b2b2b;
}

.placeholder p {
  font-size: 13px;
  margin-bottom: 20px;
}

.placeholder button {
  padding: 8px 18px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
}
</style>
