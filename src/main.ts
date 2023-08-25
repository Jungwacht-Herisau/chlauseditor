import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { ApiClient } from '@/api'

import router from './router'

const app = createApp(App)

app.use(router)

const apiClient = new ApiClient({BASE: 'http://127.0.0.1:8000'});
app.provide('api', apiClient)

app.mount('#app')
