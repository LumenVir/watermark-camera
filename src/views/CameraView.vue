<template>
  <div class="camera-view">
    <!-- 权限检查提示 -->
    <div v-if="!isHttps" class="https-warning">
      ⚠️ 必须在 HTTPS 环境下使用才能访问摄像头
      <p>本地开发请使用 Vite 的 HTTPS 模式或配置证书</p>
    </div>

    <!-- 微信浏览器提示 -->
    <div v-if="isWeChat" class="wechat-warning">
      💡 检测到微信浏览器，请点击右上角在浏览器中打开
      <p>微信内置浏览器对相机支持不稳定</p>
    </div>

    <!-- 相机取景框 -->
    <div class="camera-container">
      <video
        ref="videoRef"
        class="camera-video"
        autoplay
        playsinline
        muted
      ></video>

      <!-- 水印 Canvas -->
      <WatermarkCanvas
        v-if="videoRef"
        ref="watermarkCanvasRef"
        :video-element="videoRef"
        @captured="onCaptured"
      />

      <!-- 快门按钮 -->
      <div class="shutter-button" @click="takePhoto">
        <div class="shutter-inner"></div>
      </div>

      <!-- 前后摄像头切换 -->
      <div class="camera-switch" @click="switchCamera">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M20 11c0 1.5-.4 2.9-1.1 4.2l-1.6-.9c.5-1 .8-2.1.8-3.3 0-1.5-.5-2.9-1.3-4l1.6-.9c.9 1.3 1.6 3 1.6 4.9z"/>
          <path d="M4 13c0-1.5.4-2.9 1.1-4.2l1.6.9c-.5 1-.8 2.1-.8 3.3 0 1.5.5 2.9 1.3 4l-1.6.9c-.9-1.3-1.6-3-1.6-4.9z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </div>

      <!-- 设置按钮 -->
      <div class="settings-button" @click="$emit('open-settings')">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
        </svg>
      </div>
    </div>

    <!-- 拍照结果预览 -->
    <div v-if="capturedImage" class="captured-preview" @click="capturedImage = ''">
      <img :src="capturedImage" alt="Captured" />
      <p>点击任意处关闭</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import WatermarkCanvas from '../components/WatermarkCanvas.vue'
import { useCameraStore } from '../stores/camera'
import { useWatermarkStore } from '../stores/watermark'
import { getCurrentLocation } from '../utils/location'

defineEmits<{
  'open-settings': []
}>()

const videoRef = ref<HTMLVideoElement>()
const watermarkCanvasRef = ref()
const cameraStore = useCameraStore()
const watermarkStore = useWatermarkStore()
const capturedImage = ref('')

// 检测是否 HTTPS
const isHttps = computed(() => {
  return location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1'
})

// 检测微信浏览器
const isWeChat = computed(() => {
  return /micromessenger/i.test(navigator.userAgent)
})

// 启动相机
async function startCamera() {
  try {
    const stream = await cameraStore.startCamera()
    if (videoRef.value) {
      videoRef.value.srcObject = stream
    }
  } catch (error: any) {
    alert(`相机启动失败: ${error.message}`)
  }
}

// 切换前后摄像头
async function switchCamera() {
  await cameraStore.switchCamera()
}

// 拍照
function takePhoto() {
  if (watermarkCanvasRef.value) {
    watermarkCanvasRef.value.capture()
  }
}

// 拍照完成回调
function onCaptured(blob: Blob) {
  const url = URL.createObjectURL(blob)
  capturedImage.value = url

  // 自动下载
  const a = document.createElement('a')
  a.href = url
  a.download = `watermark-${Date.now()}.jpg`
  a.click()
}

// 更新位置
async function updateLocation() {
  try {
    const locationData = await getCurrentLocation()
    watermarkStore.location = {
      lat: locationData.lat,
      lng: locationData.lng,
      address: locationData.address,
    }

    // TODO: 调用腾讯位置服务逆地理编码
    // const address = await reverseGeocode(locationData.lat, locationData.lng, 'YOUR_TENCENT_KEY')
    // watermarkStore.location.address = address
  } catch (error: any) {
    console.error('定位失败:', error)
    watermarkStore.location.address = '定位失败'
  }
}

onMounted(() => {
  if (isHttps.value) {
    startCamera()
    updateLocation()
  }
})

onUnmounted(() => {
  cameraStore.stopCamera()
})
</script>

<style scoped>
.camera-view {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  overflow: hidden;
}

.https-warning,
.wechat-warning {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 68, 68, 0.9);
  color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  z-index: 100;
  max-width: 300px;
}

.https-warning p,
.wechat-warning p {
  margin-top: 10px;
  font-size: 14px;
  opacity: 0.9;
}

.camera-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.shutter-button {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  width: 70px;
  height: 70px;
  border: 3px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
}

.shutter-button:active {
  background: rgba(255, 255, 255, 0.3);
}

.shutter-inner {
  width: 56px;
  height: 56px;
  background: white;
  border-radius: 50%;
}

.camera-switch {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
}

.settings-button {
  position: absolute;
  left: 20px;
  top: 20px;
  width: 50px;
  height: 50px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
}

.captured-preview {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  cursor: pointer;
}

.captured-preview img {
  max-width: 90%;
  max-height: 80%;
  border-radius: 10px;
}

.captured-preview p {
  color: white;
  margin-top: 20px;
  font-size: 14px;
}
</style>
