import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useWatermarkStore = defineStore('watermark', () => {
  // 水印配置
  const config = ref({
    // 时间戳
    time: {
      enabled: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      position: 'bottom-left',
      fontSize: 14,
      color: '#FFFFFF',
      bgColor: 'rgba(0, 0, 0, 0.5)',
    },
    // GPS + 地址
    location: {
      enabled: true,
      position: 'bottom-left',
      fontSize: 12,
      color: '#FFFFFF',
      bgColor: 'rgba(0, 0, 0, 0.5)',
      showAddress: true,
      showCoords: false,
    },
    // 自定义文字
    customText: {
      enabled: true,
      text1: '',
      text2: '',
      position: 'top-left',
      fontSize: 14,
      color: '#FFFFFF',
      bgColor: 'rgba(0, 0, 0, 0.5)',
    },
    // Logo
    logo: {
      enabled: false,
      imageUrl: '',
      position: 'top-right',
      width: 80,
      opacity: 1,
    },
    // 设备信息
    device: {
      enabled: true,
      position: 'bottom-right',
      fontSize: 10,
      color: '#CCCCCC',
      bgColor: 'transparent',
    },
  })

  // 当前定位信息
  const location = ref({
    lat: 0,
    lng: 0,
    address: '获取中...',
  })

  // 保存配置到 localStorage
  function saveConfig() {
    localStorage.setItem('watermark-config', JSON.stringify(config.value))
  }

  // 从 localStorage 加载配置
  function loadConfig() {
    const saved = localStorage.getItem('watermark-config')
    if (saved) {
      config.value = { ...config.value, ...JSON.parse(saved) }
    }
  }

  // 更新配置
  function updateConfig(path: string, value: any) {
    const keys = path.split('.')
    let obj = config.value as any
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]]
    }
    obj[keys[keys.length - 1]] = value
    saveConfig()
  }

  // 初始化时加载配置
  loadConfig()

  return {
    config,
    location,
    saveConfig,
    loadConfig,
    updateConfig,
  }
})
