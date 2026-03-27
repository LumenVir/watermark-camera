import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Vant from 'vant'
import 'vant/lib/index.css'

import App from './App.vue'

// 注册 Vant 全局组件
const app = createApp(App)
app.use(createPinia())
app.use(Vant)
app.mount('#app')
