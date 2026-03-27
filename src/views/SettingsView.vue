<template>
  <div class="settings-view">
    <div class="settings-header">
      <button class="back-button" @click="$emit('back')">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        返回
      </button>
      <h1>水印设置</h1>
    </div>

    <div class="settings-content">
      <!-- 时间戳设置 -->
      <div class="setting-section">
        <div class="setting-header">
          <input type="checkbox" v-model="config.time.enabled" @change="watermarkStore.saveConfig()" />
          <span class="setting-title">时间戳</span>
        </div>

        <div v-if="config.time.enabled" class="setting-body">
          <div class="setting-row">
            <label>格式</label>
            <select v-model="config.time.format" @change="watermarkStore.saveConfig()">
              <option value="YYYY-MM-DD HH:mm:ss">2026-03-26 14:30:25</option>
              <option value="YYYY/MM/DD HH:mm">2026/03/26 14:30</option>
              <option value="HH:mm:ss">14:30:25</option>
              <option value="MM-DD HH:mm">03-26 14:30</option>
            </select>
          </div>
          <div class="setting-row">
            <label>字号</label>
            <input type="number" v-model.number="config.time.fontSize" min="10" max="30" @change="watermarkStore.saveConfig()" />
          </div>
          <div class="setting-row">
            <label>颜色</label>
            <input type="color" v-model="config.time.color" @change="watermarkStore.saveConfig()" />
          </div>
        </div>
      </div>

      <!-- 位置信息设置 -->
      <div class="setting-section">
        <div class="setting-header">
          <input type="checkbox" v-model="config.location.enabled" @change="watermarkStore.saveConfig()" />
          <span class="setting-title">位置信息</span>
        </div>

        <div v-if="config.location.enabled" class="setting-body">
          <div class="setting-row">
            <label>显示地址</label>
            <input type="checkbox" v-model="config.location.showAddress" @change="watermarkStore.saveConfig()" />
          </div>
          <div class="setting-row">
            <label>显示坐标</label>
            <input type="checkbox" v-model="config.location.showCoords" @change="watermarkStore.saveConfig()" />
          </div>
          <div class="setting-row">
            <label>字号</label>
            <input type="number" v-model.number="config.location.fontSize" min="8" max="24" @change="watermarkStore.saveConfig()" />
          </div>
        </div>
      </div>

      <!-- 自定义文字设置 -->
      <div class="setting-section">
        <div class="setting-header">
          <input type="checkbox" v-model="config.customText.enabled" @change="watermarkStore.saveConfig()" />
          <span class="setting-title">自定义文字</span>
        </div>

        <div v-if="config.customText.enabled" class="setting-body">
          <div class="setting-row">
            <label>第一行</label>
            <input type="text" v-model="config.customText.text1" placeholder="公司名称" @change="watermarkStore.saveConfig()" />
          </div>
          <div class="setting-row">
            <label>第二行</label>
            <input type="text" v-model="config.customText.text2" placeholder="项目名称" @change="watermarkStore.saveConfig()" />
          </div>
          <div class="setting-row">
            <label>字号</label>
            <input type="number" v-model.number="config.customText.fontSize" min="10" max="30" @change="watermarkStore.saveConfig()" />
          </div>
          <div class="setting-row">
            <label>颜色</label>
            <input type="color" v-model="config.customText.color" @change="watermarkStore.saveConfig()" />
          </div>
        </div>
      </div>

      <!-- Logo 设置 -->
      <div class="setting-section">
        <div class="setting-header">
          <input type="checkbox" v-model="config.logo.enabled" @change="watermarkStore.saveConfig()" />
          <span class="setting-title">Logo</span>
        </div>

        <div v-if="config.logo.enabled" class="setting-body">
          <div class="setting-row">
            <label>上传图片</label>
            <input type="file" accept="image/*" @change="handleLogoUpload" />
          </div>
          <div v-if="config.logo.imageUrl" class="logo-preview">
            <img :src="config.logo.imageUrl" alt="Logo" />
          </div>
          <div class="setting-row">
            <label>宽度</label>
            <input type="number" v-model.number="config.logo.width" min="20" max="200" @change="watermarkStore.saveConfig()" />
          </div>
          <div class="setting-row">
            <label>透明度</label>
            <input type="range" v-model.number="config.logo.opacity" min="0" max="1" step="0.1" @change="watermarkStore.saveConfig()" />
          </div>
        </div>
      </div>

      <!-- 设备信息设置 -->
      <div class="setting-section">
        <div class="setting-header">
          <input type="checkbox" v-model="config.device.enabled" @change="watermarkStore.saveConfig()" />
          <span class="setting-title">设备信息</span>
        </div>
      </div>

      <!-- API 配置 -->
      <div class="setting-section">
        <div class="setting-header">
          <span class="setting-title">API 配置</span>
        </div>
        <div class="setting-body">
          <div class="setting-row">
            <label>腾讯位置服务 Key</label>
            <input type="text" v-model="tencentKey" placeholder="请输入 Key" />
          </div>
          <div class="setting-row">
            <label>和风天气 Key</label>
            <input type="text" v-model="weatherKey" placeholder="请输入 Key" />
          </div>
          <div class="setting-links">
            <a href="https://lbs.qq.com/" target="_blank">腾讯位置服务注册 →</a>
            <a href="https://dev.qweather.com/" target="_blank">和风天气注册 →</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useWatermarkStore } from '../stores/watermark'

defineEmits<{
  back: []
}>()

const watermarkStore = useWatermarkStore()
const config = watermarkStore.config

const tencentKey = ref('')
const weatherKey = ref('')

// 处理 Logo 上传
function handleLogoUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      config.logo.imageUrl = e.target?.result as string
      watermarkStore.saveConfig()
    }
    reader.readAsDataURL(file)
  }
}
</script>

<style scoped>
.settings-view {
  position: relative;
  width: 100%;
  height: 100%;
  background: #1a1a1a;
  color: #fff;
  overflow-y: auto;
}

.settings-header {
  position: sticky;
  top: 0;
  background: rgba(26, 26, 26, 0.95);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  border-bottom: 1px solid #333;
  backdrop-filter: blur(10px);
  z-index: 10;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
}

h1 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.settings-content {
  padding: 20px;
}

.setting-section {
  background: #2a2a2a;
  border-radius: 10px;
  margin-bottom: 20px;
  overflow: hidden;
}

.setting-header {
  padding: 15px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #333;
}

.setting-header input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.setting-title {
  font-size: 16px;
  font-weight: 500;
}

.setting-body {
  padding: 15px 20px;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.setting-row:last-child {
  margin-bottom: 0;
}

.setting-row label {
  font-size: 14px;
  color: #aaa;
}

.setting-row input[type="text"],
.setting-row input[type="number"],
.setting-row select {
  padding: 8px 12px;
  border: 1px solid #444;
  border-radius: 5px;
  background: #333;
  color: #fff;
  font-size: 14px;
  min-width: 150px;
}

.setting-row input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.setting-row input[type="range"] {
  width: 120px;
}

.setting-row input[type="color"] {
  width: 40px;
  height: 30px;
  border: none;
  cursor: pointer;
}

.logo-preview {
  margin: 10px 0;
  padding: 10px;
  background: #333;
  border-radius: 5px;
  text-align: center;
}

.logo-preview img {
  max-width: 100px;
  max-height: 100px;
  object-fit: contain;
}

.setting-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}

.setting-links a {
  color: #4a9eff;
  text-decoration: none;
  font-size: 13px;
}

.setting-links a:hover {
  text-decoration: underline;
}
</style>
