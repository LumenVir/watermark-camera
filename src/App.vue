<template>
  <div id="app" class="app">
    <!-- 首页：相机取景 -->
    <CameraView v-if="currentPage === 'camera'" @open-settings="currentPage = 'settings'" />
    
    <!-- 设置页 -->
    <SettingsView v-else-if="currentPage === 'settings'" @back="currentPage = 'camera'" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CameraView from './views/CameraView.vue'
import SettingsView from './views/SettingsView.vue'

const currentPage = ref<'camera' | 'settings'>('camera')
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;
}

#app {
  width: 100%;
  height: 100%;
}

.app {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
