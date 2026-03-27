<template>
  <canvas
    ref="canvasRef"
    class="watermark-canvas"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useWatermarkStore } from '../stores/watermark'
import { formatTime, getDeviceInfo } from '../utils/location'

const props = defineProps<{
  videoElement: HTMLVideoElement | null
}>()

const emit = defineEmits<{
  captured: [blob: Blob]
}>()

const canvasRef = ref<HTMLCanvasElement>()
const watermarkStore = useWatermarkStore()
let animationFrameId: number | null = null
let logoImage: HTMLImageElement | null = null

// 预加载 Logo
function loadLogoImage(url: string) {
  if (!url) {
    logoImage = null
    return
  }

  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    logoImage = img
  }
  img.src = url
}

// 渲染每一帧
function renderFrame() {
  if (!canvasRef.value || !props.videoElement) return

  const canvas = canvasRef.value
  const video = props.videoElement
  const ctx = canvas.getContext('2d')

  if (!ctx) return

  // 设置 Canvas 尺寸与视频一致
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  // 绘制视频帧
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  // 渲染水印
  renderWatermark(ctx, canvas.width, canvas.height)

  // 继续下一帧
  animationFrameId = requestAnimationFrame(renderFrame)
}

// 渲染所有水印
function renderWatermark(ctx: CanvasRenderingContext2D, _width: number, height: number) {
  const { config } = watermarkStore
  const location = watermarkStore.location
  const padding = 10
  const lineHeight = 1.5

  // 时间戳
  if (config.time.enabled) {
    const time = formatTime(new Date(), config.time.format)
    drawText(
      ctx,
      time,
      config.time.position,
      padding,
      height - padding,
      config.time.fontSize,
      config.time.color,
      config.time.bgColor,
      'bottom',
    )
  }

  // 位置信息
  if (config.location.enabled) {
    const address = config.location.showAddress ? location.address : ''
    const coords = config.location.showCoords
      ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
      : ''

    let y = height - padding - (config.time.enabled ? config.time.fontSize * lineHeight : 0)

    if (address) {
      drawText(
        ctx,
        address,
        config.location.position,
        padding,
        y,
        config.location.fontSize,
        config.location.color,
        config.location.bgColor,
        'bottom',
      )
      y -= config.location.fontSize * lineHeight
    }

    if (coords) {
      drawText(
        ctx,
        coords,
        config.location.position,
        padding,
        y,
        config.location.fontSize,
        config.location.color,
        config.location.bgColor,
        'bottom',
      )
    }
  }

  // 自定义文字
  if (config.customText.enabled) {
    let y = padding + config.customText.fontSize * lineHeight

    if (config.customText.text2) {
      drawText(
        ctx,
        config.customText.text2,
        config.customText.position,
        padding,
        y,
        config.customText.fontSize,
        config.customText.color,
        config.customText.bgColor,
        'top',
      )
      y += config.customText.fontSize * lineHeight
    }

    if (config.customText.text1) {
      drawText(
        ctx,
        config.customText.text1,
        config.customText.position,
        padding,
        y,
        config.customText.fontSize,
        config.customText.color,
        config.customText.bgColor,
        'top',
      )
    }
  }

  // Logo
  if (config.logo.enabled && logoImage) {
    drawLogo(
      ctx,
      logoImage,
      config.logo.position,
      padding,
      config.logo.width,
      config.logo.opacity,
    )
  }

  // 设备信息
  if (config.device.enabled) {
    const device = getDeviceInfo()
    drawText(
      ctx,
      device,
      config.device.position,
      padding,
      height - padding,
      config.device.fontSize,
      config.device.color,
      config.device.bgColor,
      'bottom',
    )
  }
}

// 绘制文本
function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  position: string,
  padding: number,
  y: number,
  fontSize: number,
  color: string,
  bgColor: string,
  vertical: 'top' | 'bottom',
) {
  ctx.font = `${fontSize}px sans-serif`
  ctx.fillStyle = bgColor
  ctx.textBaseline = vertical === 'top' ? 'top' : 'bottom'
  ctx.textAlign = position === 'left' ? 'left' : 'right'

  const x = position === 'left' ? padding : ctx.canvas.width - padding

  // 绘制背景
  const metrics = ctx.measureText(text)
  const textWidth = metrics.width
  const textHeight = fontSize * 1.2
  const bgY = vertical === 'top' ? y - fontSize * 0.2 : y - textHeight + fontSize * 0.2
  const bgX = position === 'left' ? x - padding / 2 : x - textWidth - padding / 2

  if (bgColor !== 'transparent') {
    ctx.fillRect(bgX, bgY, textWidth + padding, textHeight)
  }

  // 绘制文字
  ctx.fillStyle = color
  ctx.fillText(text, x, y)
}

// 绘制 Logo
function drawLogo(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  position: string,
  padding: number,
  width: number,
  opacity: number,
) {
  const ratio = img.width / img.height
  const height = width / ratio

  let x: number, y: number

  if (position.includes('left')) {
    x = padding
  } else {
    x = ctx.canvas.width - width - padding
  }

  if (position.includes('top')) {
    y = padding
  } else {
    y = ctx.canvas.height - height - padding
  }

  ctx.globalAlpha = opacity
  ctx.drawImage(img, x, y, width, height)
  ctx.globalAlpha = 1
}

// 拍照
function capture() {
  if (!canvasRef.value) return

  canvasRef.value.toBlob((blob) => {
    if (blob) {
      emit('captured', blob)
    }
  }, 'image/jpeg', 0.95)
}

// 暴露拍照方法
defineExpose({
  capture,
})

// 监听 Logo 变化
watch(
  () => watermarkStore.config.logo.imageUrl,
  (url) => loadLogoImage(url),
  { immediate: true }
)

onMounted(() => {
  animationFrameId = requestAnimationFrame(renderFrame)
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>

<style scoped>
.watermark-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
