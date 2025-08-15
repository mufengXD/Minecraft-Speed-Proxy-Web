import { createApp } from 'vue'
import MainUI from './MainUI.vue'
import router from './router/index.js'

createApp(MainUI).use(router).mount('#main-ui')