import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCameraStore = defineStore('camera', () => {
  // 摄像头状态
  const stream = ref<MediaStream | null>(null)
  const facingMode = ref<'user' | 'environment'>('environment')
  const isReady = ref(false)

  // 启动摄像头
  async function startCamera(constraints?: MediaStreamConstraints) {
    try {
      if (stream.value) {
        stopCamera()
      }

      const defaultConstraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode.value,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(
        constraints || defaultConstraints
      )

      stream.value = mediaStream
      isReady.value = true

      return mediaStream
    } catch (error) {
      console.error('摄像头启动失败:', error)
      isReady.value = false
      throw error
    }
  }

  // 停止摄像头
  function stopCamera() {
    if (stream.value) {
      stream.value.getTracks().forEach(track => track.stop())
      stream.value = null
    }
    isReady.value = false
  }

  // 切换前后摄像头
  async function switchCamera() {
    facingMode.value = facingMode.value === 'user' ? 'environment' : 'user'
    await startCamera()
  }

  return {
    stream,
    facingMode,
    isReady,
    startCamera,
    stopCamera,
    switchCamera,
  }
})
