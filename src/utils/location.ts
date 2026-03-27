// GPS 和地址解析工具

export interface LocationData {
  lat: number
  lng: number
  address: string
}

// WGS84 转 GCJ02 (火星坐标系)
function wgs84togcj02(lat: number, lng: number): [number, number] {
  const a = 6378245.0
  const ee = 0.00669342162296594323

  if (outOfChina(lat, lng)) {
    return [lat, lng]
  }

  let dLat = transformLat(lng - 105.0, lat - 35.0)
  let dLng = transformLng(lng - 105.0, lat - 35.0)
  const radLat = (lat / 180.0) * Math.PI
  let magic = Math.sin(radLat)
  magic = 1 - ee * magic * magic
  const sqrtMagic = Math.sqrt(magic)

  dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * Math.PI)
  dLng = (dLng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * Math.PI)

  return [lat + dLat, lng + dLng]
}

function transformLat(lng: number, lat: number): number {
  let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng))
  ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0
  ret += (20.0 * Math.sin(lat * Math.PI) + 40.0 * Math.sin(lat / 3.0 * Math.PI)) * 2.0 / 3.0
  ret += (160.0 * Math.sin(lat / 12.0 * Math.PI) + 320 * Math.sin(lat * Math.PI / 30.0)) * 2.0 / 3.0
  return ret
}

function transformLng(lng: number, lat: number): number {
  let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng))
  ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0
  ret += (20.0 * Math.sin(lng * Math.PI) + 40.0 * Math.sin(lng / 3.0 * Math.PI)) * 2.0 / 3.0
  ret += (150.0 * Math.sin(lng / 12.0 * Math.PI) + 300.0 * Math.sin(lng / 30.0 * Math.PI)) * 2.0 / 3.0
  return ret
}

function outOfChina(lat: number, lng: number): boolean {
  if (lng < 72.004 || lng > 137.8347) return true
  if (lat < 0.8293 || lat > 55.8271) return true
  return false
}

// 获取当前 GPS 位置
export function getCurrentLocation(): Promise<LocationData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持 GPS 定位'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const [gcjLat, gcjLng] = wgs84togcj02(latitude, longitude)
        resolve({
          lat: gcjLat,
          lng: gcjLng,
          address: `${gcjLat.toFixed(6)}, ${gcjLng.toFixed(6)}`,
        })
      },
      (error) => {
        reject(new Error(`GPS 定位失败: ${error.message}`))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  })
}

// 使用腾讯位置服务逆地理编码
export async function reverseGeocode(
  lat: number,
  lng: number,
  key: string
): Promise<string> {
  try {
    const response = await fetch(
      `https://apis.map.qq.com/ws/geocoder/v1/?location=${lat},${lng}&key=${key}&get_poi=0`
    )
    const data = await response.json()

    if (data.status === 0) {
      const { address } = data.result
      return address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    } else {
      console.error('逆地理编码失败:', data.message)
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
  } catch (error) {
    console.error('地址解析请求失败:', error)
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }
}

// 获取设备信息
export function getDeviceInfo(): string {
  const ua = navigator.userAgent

  // 简单识别设备型号（实际生产中可以用更完整的 User-Agent 解析库）
  let device = '未知设备'
  if (ua.includes('iPhone')) {
    const match = ua.match(/iPhone\s*OS\s*(\d+)_(\d+)/)
    if (match) {
      device = `iPhone iOS ${match[1]}.${match[2]}`
    } else {
      device = 'iPhone'
    }
  } else if (ua.includes('Android')) {
    const match = ua.match(/Android\s*(\d+)\.(\d+)/)
    if (match) {
      device = `Android ${match[1]}.${match[2]}`
    } else {
      device = 'Android'
    }
  }

  return device
}

// 格式化时间
export function formatTime(date: Date, format: string): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}
