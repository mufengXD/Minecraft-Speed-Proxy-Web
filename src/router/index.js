import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/online' },
  { path: '/online', name: '在线列表', component: () => import('@/views/OnlineList.vue') },
  { path: '/whitelist', name: '白名单', component: () => import('@/views/Whitelist.vue') },
  { path: '/blacklist', name: '黑名单', component: () => import('@/views/Blacklist.vue') },
  { path: '/settings', name: '设置', component: () => import('@/views/Settings.vue') }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
