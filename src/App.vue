<script setup lang="ts">
import { ref } from 'vue';
import ShelfView from '@/views/ShelfView.vue';
import PlayerView from '@/views/PlayerView.vue';

type View = 'shelf' | 'player';

const currentView = ref<View>('shelf');

function goToPlayer() {
  currentView.value = 'player';
}

function goToShelf() {
  currentView.value = 'shelf';
}
</script>

<template>
  <ShelfView v-if="currentView === 'shelf'" @open-player="goToPlayer" />
  <PlayerView v-else @open-shelf="goToShelf" />
</template>

<style scoped></style>
