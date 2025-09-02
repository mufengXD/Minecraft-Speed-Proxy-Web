import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/online' },
  { path: '/online', name: '在线列表', component: () => import('@/views/OnlineList.vue') },
  { path: '/user_management', name: '用户管理', component: () => import('@/views/user_management.vue') },
  { path: '/Agency_management', name: '代理管理', component: () => import('@/views/Agency_management.vue') },
  { path: '/MOTD_maker', name: 'MOTD制作', component: () => import('@/views/MOTD_maker.vue') },
  { path: '/whitelist_manage', name: '白名单管理', component: () => import('@/views/WhitelistManage.vue') },
  { path: '/blacklist_manage', name: '黑名单管理', component: () => import('@/views/BlacklistManage.vue') },
  { path: '/settings', name: '设置', component: () => import('@/views/Settings.vue') },
  { path: '/temp', name: '临时页面', component: { template: '<div></div>' } }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
