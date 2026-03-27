# 水印相机 H5 Demo

一个纯前端的水印相机 H5 应用，支持实时水印预览、GPS 定位、自定义文字、Logo 等功能。

## 功能特性

- ✅ 实时相机取景（支持前后摄像头切换）
- ✅ 实时水印预览（Canvas 2D 渲染）
- ✅ 时间戳水印（可自定义格式、大小、颜色）
- ✅ GPS 定位 + 地址解析（需配置腾讯位置服务 API Key）
- ✅ 自定义文字（两行，可自定义样式）
- ✅ Logo 水印（支持上传、大小、透明度调整）
- ✅ 设备信息水印（自动识别设备型号）
- ✅ 本地配置持久化（localStorage）
- ✅ 拍照后自动下载

## 技术栈

- **框架**: Vue 3 + TypeScript + Vite
- **UI**: Vant 4（移动端组件库）
- **状态管理**: Pinia
- **相机**: WebRTC getUserMedia + Canvas 2D
- **定位**: Geolocation API + 腾讯位置服务
- **部署**: 纯静态文件，支持任意 HTTPS 服务器

## 快速开始

### 1. 安装依赖

```bash
cd watermark-camera
npm install
```

### 2. HTTPS 配置（必须！）

由于浏览器安全限制，`getUserMedia`（调用摄像头）**必须在 HTTPS 环境下运行**（localhost 除外）。

#### 方式 A：使用 Vite 内置 HTTPS（推荐）

Vite 5+ 支持一键 HTTPS：

```bash
npm run dev -- --https
```

如果提示证书问题，可添加参数：

```bash
npm run dev -- --https --strictPort
```

#### 方式 B：使用 mkcert 生成本地证书（macOS）

```bash
# 1. 安装 mkcert
brew install mkcert
brew install nss  # Firefox 用户需要

# 2. 生成并安装本地 CA
mkcert -install

# 3. 生成证书
cd watermark-camera
mkcert localhost 127.0.0.1 ::1

# 4. 修改 vite.config.ts
# 取消注释 https 配置，填入证书路径：
# key: './localhost-key.pem',
# cert: './localhost.pem',

# 5. 启动开发服务器
npm run dev
```

#### 方式 C：使用 ngrok（分享给真机测试）

```bash
# 1. 安装 ngrok
brew install ngrok

# 2. 启动 Vite 开发服务器
npm run dev

# 3. 在另一个终端启动 ngrok
ngrok http 5173

# 4. 用 ngrok 生成的 HTTPS 地址在手机上打开
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 `https://localhost:5173`（或 ngrok 生成的 HTTPS 地址）

### 4. API 配置（可选）

如果要启用地址解析功能，需要配置以下 API Key：

1. **腾讯位置服务**
   - 注册账号：https://lbs.qq.com/
   - 创建应用，获取 Key（选择 WebService API）
   - 在设置页输入 Key

2. **和风天气**（天气功能待实现）
   - 注册账号：https://dev.qweather.com/
   - 获取 API Key

## 兼容性

| 平台 | 相机支持 | 备注 |
|------|----------|------|
| iOS Safari 14.3+ | ✅ | 完全支持 |
| Android Chrome | ✅ | 完全支持 |
| 微信内置浏览器 | ⚠️ | iOS 微信对 getUserMedia 支持不稳定，建议引导"在浏览器中打开" |
| 微信浏览器（Android） | ✅ | 基本支持 |

## 项目结构

```
watermark-camera/
├── src/
│   ├── components/     # 组件
│   │   └── WatermarkCanvas.vue  # 水印渲染引擎
│   ├── stores/         # 状态管理
│   │   ├── camera.ts   # 相机状态
│   │   └── watermark.ts # 水印配置
│   ├── views/          # 页面
│   │   ├── CameraView.vue  # 相机取景页
│   │   └── SettingsView.vue # 设置页
│   ├── utils/          # 工具函数
│   │   └── location.ts # 定位相关
│   ├── App.vue
│   └── main.ts
├── vite.config.ts
└── README.md
```

## 部署

### 生产构建

```bash
npm run build
```

构建产物在 `dist/` 目录，可直接部署到任何 HTTPS 服务器：

- Nginx / Apache
- Vercel / Netlify
- 腾讯云 COS / 阿里云 OSS
- 自己的服务器

### 部署示例（Nginx）

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /path/to/watermark-camera/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 常见问题

### Q: 微信浏览器打不开摄像头？

**A:** iOS 微信内置浏览器对 `getUserMedia` 支持不稳定。Demo 中已添加检测逻辑，会提示用户"点击右上角在浏览器中打开"。

### Q: 没有域名和服务器怎么办？

**A:** 可以本地运行（localhost），或使用 ngrok 生成临时 HTTPS 链接分享给手机测试。

### Q: 为什么相机权限被拒绝？

**A:** 检查以下几点：
1. 确保使用 HTTPS（或 localhost）
2. 检查浏览器是否授予了相机和位置权限
3. iOS 上可能需要在系统设置中手动授权

### Q: 地址解析不准确？

**A:** 腾讯位置服务的 WebService API 免费版有精度限制，可以考虑升级付费版，或者使用高德地图 API。

## 待实现功能

- [ ] 天气信息水印（集成和风天气 API）
- [ ] 拍照历史管理（IndexedDB）
- [ ] 批量导出照片
- [ ] 照片上传到服务器
- [ ] 多套水印模板管理
- [ ] 照片防篡改校验
- [ ] 工程记录特化功能（项目管理、分类标签、PDF 导出）

## License

MIT

---

**作者**: D  
**日期**: 2026-03-26
