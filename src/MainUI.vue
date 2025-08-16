<template>
  <div class="main-ui">
    <aside class="sidebar">
      <div
        v-for="item in menu"
        :key="item.path"
        :class="['sidebar-item', $route.path === item.path ? 'active' : '']"
        @click="go(item.path)"
      >
        {{ item.name }}
      </div>
    </aside>
    <div class="main-content">
      <header class="top-banner">
        <div class="banner-left">
          <!-- <h2>管理系统</h2> -->
        </div>
        <div class="banner-right">
          <div class="banner-item" @click="openGitHub" title="前往项目GitHub">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"/>
            </svg>
          </div>
          <div class="banner-item" @click="openSettings" title="打开设置">
            <svg width="20" height="20" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M27.526,18.036L27,17.732c-0.626-0.361-1-1.009-1-1.732s0.374-1.371,1-1.732l0.526-0.304  c1.436-0.83,1.927-2.662,1.098-4.098l-1-1.732c-0.827-1.433-2.666-1.925-4.098-1.098L23,7.339c-0.626,0.362-1.375,0.362-2,0  c-0.626-0.362-1-1.009-1-1.732V5c0-1.654-1.346-3-3-3h-2c-1.654,0-3,1.346-3,3v0.608c0,0.723-0.374,1.37-1,1.732  c-0.626,0.361-1.374,0.362-2,0L8.474,7.036C7.042,6.209,5.203,6.701,4.375,8.134l-1,1.732c-0.829,1.436-0.338,3.269,1.098,4.098  L5,14.268C5.626,14.629,6,15.277,6,16s-0.374,1.371-1,1.732l-0.526,0.304c-1.436,0.829-1.927,2.662-1.098,4.098l1,1.732  c0.828,1.433,2.667,1.925,4.098,1.098L9,24.661c0.626-0.363,1.374-0.361,2,0c0.626,0.362,1,1.009,1,1.732V27c0,1.654,1.346,3,3,3h2  c1.654,0,3-1.346,3-3v-0.608c0-0.723,0.374-1.37,1-1.732c0.625-0.361,1.374-0.362,2,0l0.526,0.304  c1.432,0.826,3.271,0.334,4.098-1.098l1-1.732C29.453,20.698,28.962,18.865,27.526,18.036z M16,21c-2.757,0-5-2.243-5-5s2.243-5,5-5  s5,2.243,5,5S18.757,21,16,21z"/>
            </svg>
          </div>
          <div class="banner-item" @click="logout" title="退出登录">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h7v2H5v14h7v2zm11-4l-1.375-1.45l2.55-2.55H9v-2h8.175l-2.55-2.55L16 7l5 5z"/>
            </svg>
          </div>
        </div>
      </header>
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import axios from '@/utils/axios.js'

export default {
  name: 'MainUI',
  data() {
    return {
      menu: [
        { name: '主页', path: '/online' },
        { name: '用户管理', path: '/user_management' },
        { name: '代理管理', path: '/Agency_management' }
      ]
    }
  },
  methods: {
    go(path) {
      this.$router.push(path)
    },
    openSettings() {
      alert('打开设置页面')
    },
    openGitHub() {
      window.open('https://github.com/AllesUgo/Minecraft-Speed-Proxy', '_blank');
    },
    async logout() {
      try {
        const response = await axios.get('/api/logout');
        const result = response.data;
        if (result.status === 200) {
          console.log('后端登出成功');
          console.log(result.message);
        } else if (result.status === 401) {
          console.error('401错误：未授权');
        } else {
          console.error('未知错误:', result);
        }
      } catch (error) {
        console.error('后端登出失败:', error);
      }
      // 再清除本地认证信息
      localStorage.removeItem('token');
      alert('已退出登录');
      window.location.href = '/';
    }
  }
}
</script>

<style>
.main-ui { 
  display: flex; 
  height: 100vh; 
  margin: 0; 
  padding: 0; 
}
.sidebar { 
  width: 120px;     /*侧边栏宽度*/
  background: #586360; 
  margin: 0; 
  padding: 0; 
}
.sidebar-item { 
  padding: 20px; 
  cursor: pointer; 
  margin: 0; 
  color: #fff;
  text-align: center;
}
.sidebar-item.active { 
  background: #3c6792; 
  color: #c2c2b3; 
}
.sidebar-item:hover {
  background: #4a7178;
}
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.top-banner {
  height: 60px;
  background: #f8f8f8;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.banner-left h2 {
  margin: 0;
  color: #333;
  font-size: 18px;
}
.banner-right {
  display: flex;
  gap: 16px;
}
.banner-item {
  padding: 12px;
  background: #409eff;
  color: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
}
.banner-item:hover {
  background: #337bb7;
}
.banner-item svg {
  fill: currentColor;
}
.content { 
  flex: 1; 
  padding: 24px; 
  overflow: auto;
}
</style>