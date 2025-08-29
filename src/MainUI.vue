<template>
  <div class="main-ui">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-text">管理面板</span>
        </div>
      </div>
      <nav class="sidebar-nav">
        <div
          v-for="item in menu"
          :key="item.path"
          :class="['sidebar-item', $route.path === item.path ? 'active' : '']"
          @click="go(item.path)"
        >
          <div class="item-icon">
            <svg v-if="item.path === '/online'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
            </svg>
            <svg v-else-if="item.path === '/user_management'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <svg v-else-if="item.path === '/Agency_management'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-.61.08-1.21.21-1.78L9.99 16v1c0 1.1.9 2 2 2v1.93C7.06 20.48 4 16.69 4 12zm14.89 2.41c-.26-.81-1-1.41-1.89-1.41h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41C17.92 5.77 20 8.65 20 12c0 .83-.13 1.64-.36 2.41z"/>
            </svg>
          </div>
          <span class="item-text">{{ item.name }}</span>
        </div>
      </nav>
    </aside>
    <div class="main-content">
      <header class="top-banner">
        <div class="banner-left">
          <!-- <h2>管理系统</h2> -->
        </div>
        <div class="banner-right">
          <div class="banner-item" @click="refreshData" title="刷新数据">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
          </div>
          <div class="banner-item github-dropdown" @click="toggleGitHubFlyout" title="项目GitHub" :class="{ 'active': showGitHubFlyout }">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"/>
            </svg>
            <div v-if="showGitHubFlyout" class="github-flyout" @click.stop>
              <div class="flyout-header">
                <h4>开源项目</h4>
                <span class="project-info">查看源代码</span>
              </div>
              <div class="flyout-content">
                <a href="https://github.com/mufengXD/Minecraft-Speed-Proxy-Web" target="_blank" class="github-link">
                  <div class="link-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"/>
                    </svg>
                  </div>
                  <div class="link-content">
                    <div class="link-title">管理控制面板</div>
                    <div class="link-subtitle">Web界面 • by @mufengXD</div>
                  </div>
                  <div class="link-arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M7 17L17 7m0 0H7m10 0v10"/>
                    </svg>
                  </div>
                </a>
                <a href="https://github.com/AllesUgo/Minecraft-Speed-Proxy" target="_blank" class="github-link">
                  <div class="link-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"/>
                    </svg>
                  </div>
                  <div class="link-content">
                    <div class="link-title">代理服务程序</div>
                    <div class="link-subtitle">代理服务 • by @AllesUgo</div>
                  </div>
                  <div class="link-arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M7 17L17 7m0 0H7m10 0v10"/>
                    </svg>
                  </div>
                </a>
              </div>
            </div>
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
    <div v-if="showSettings" class="settings-modal" @click.stop="closeSettings">
      <div class="settings-mask"></div>
      <div class="settings-content" @click.stop>
        <h3>系统设置</h3>
        <label for="maxUsersInput">最大在线人数：</label>
        <input
          id="maxUsersInput"
          type="number"
          v-model="maxUsersInput"
          placeholder="-1表示无限制"
          @keyup.enter="submitMaxUsers"
        />
        <!-- <div class="settings-desc">-1表示无限制</div> -->
        <div class="settings-actions">
          <button @click="submitMaxUsers">确认</button>
          <button @click="closeSettings">关闭</button>
        </div>
        <div v-if="settingsMsg" class="settings-msg">{{ settingsMsg }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/utils/axios.js'
import logManager from '@/utils/logManager.js'

export default {
  name: 'MainUI',
  data() {
    return {
      menu: [
        { name: '主页', path: '/online' },
        { name: '用户管理', path: '/user_management' },
        { name: '代理管理', path: '/Agency_management' }
      ],
      showSettings: false,
      showGitHubFlyout: false,
      maxUsersInput: '',
      settingsMsg: ''
    }
  },
  mounted() {
    // 添加全局点击监听器来关闭flyout
    document.addEventListener('click', this.handleGlobalClick);
  },
  beforeUnmount() {
    // 移除全局点击监听器
    document.removeEventListener('click', this.handleGlobalClick);
  },
  methods: {
    handleGlobalClick(event) {
      // 检查点击是否在GitHub下拉菜单外部
      const githubDropdown = event.target.closest('.github-dropdown');
      if (!githubDropdown && this.showGitHubFlyout) {
        this.closeGitHubFlyout();
      }
    },
    go(path) {
      this.$router.push(path)
    },
    refreshData() {
      // 通过路由重新加载当前页面来实现刷新
      const currentPath = this.$route.path;
      this.$router.replace('/temp').then(() => {
        this.$router.replace(currentPath);
      });
      // 调用GlobalLog提示
      logManager.success('已刷新');
    },
    toggleGitHubFlyout() {
      this.showGitHubFlyout = !this.showGitHubFlyout;
    },
    closeGitHubFlyout() {
      this.showGitHubFlyout = false;
    },
    openSettings() {
      this.showSettings = true;
      this.maxUsersInput = '';
      this.settingsMsg = '';
    },
    closeSettings() {
      this.showSettings = false;
    },
    async submitMaxUsers() {
      if (this.maxUsersInput === '') {
        this.settingsMsg = '请输入最大在线人数';
        return;
      }
      try {
        const response = await axios.post('/api/set_max_users', { max_users: Number(this.maxUsersInput) });
        if (response.data.status === 200) {
          this.settingsMsg = '设置成功';
          setTimeout(() => {
            this.closeSettings();
          }, 800);
        } else {
          this.settingsMsg = response.data.message || '设置失败';
        }
      } catch (err) {
        this.settingsMsg = '请求失败';
      }
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

/* 侧边栏样式 */
.sidebar { 
  width: 240px;
  background: linear-gradient(180deg, #f1f3f4 0%, #e8eaed 100%);
  border-right: 1px solid #dadce0;
  margin: 0; 
  padding: 0; 
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid #dadce0;
  background: #f8f9fa;
  height: 72px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #409eff;
}

.logo svg {
  fill: currentColor;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 0;
}

.sidebar-item { 
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  margin: 4px 12px;
  cursor: pointer;
  border-radius: 8px;
  color: #495057;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
}

.sidebar-item:hover {
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
  transform: translateX(2px);
}

.sidebar-item.active { 
  background: linear-gradient(135deg, #409eff, #337bb7);
  color: #fff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.sidebar-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background: #fff;
  border-radius: 0 2px 2px 0;
}

.item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.item-icon svg {
  fill: currentColor;
}

.item-text {
  flex: 1;
}
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.top-banner {
  height: 60px;
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
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

/* GitHub下拉菜单样式 */
.github-dropdown {
  position: relative;
}

.github-dropdown.active {
  background: #337bb7;
}

.github-flyout {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 280px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow: hidden;
  animation: flyoutFadeIn 0.2s ease-out;
}

.flyout-header {
  padding: 16px 20px 12px;
  border-bottom: 1px solid #f0f0f0;
  background: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flyout-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.powered-by {
  font-size: 11px;
  color: #6c757d;
  font-weight: 500;
  background: rgba(108, 117, 125, 0.1);
  padding: 2px 6px;
  border-radius: 8px;
  letter-spacing: 0.2px;
}

.project-info {
  font-size: 11px;
  color: #6c757d;
  font-weight: 500;
  background: rgba(108, 117, 125, 0.1);
  padding: 2px 6px;
  border-radius: 8px;
  letter-spacing: 0.2px;
}

.flyout-content {
  padding: 8px 0;
}

.github-link {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  text-decoration: none;
  color: #2c3e50;
  transition: all 0.2s ease;
  border: none;
  background: none;
}

.github-link:hover {
  background: #f8f9fa;
  transform: translateX(2px);
}

.link-icon {
  margin-right: 12px;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.link-content {
  flex: 1;
}

.link-title {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 2px;
}

.link-subtitle {
  font-size: 12px;
  color: #6c757d;
}

.link-arrow {
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.github-link:hover .link-arrow {
  transform: translate(2px, -2px);
}

@keyframes flyoutFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.content { 
  flex: 1; 
  padding: 24px; 
  overflow: auto;
  /* background-image: linear-gradient(to top, lightgrey 0%, lightgrey 1%, #e0e0e0 26%, #efefef 48%, #d9d9d9 75%, #bcbcbc 100%); */
}
.settings-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.settings-mask {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.3);
  z-index: 1;
}
.settings-content {
  position: relative;
  z-index: 2;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
  padding: 32px 28px 24px 28px;
  min-width: 320px;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.settings-content h3 {
  margin: 0 0 18px 0;
  font-size: 20px;
  color: #333;
}
.settings-content label {
  font-size: 15px;
  margin-bottom: 8px;
}
.settings-content input {
  margin-bottom: 8px;
  padding: 6px 10px;
  font-size: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 180px;
}
.settings-desc {
  font-size: 13px;
  color: #888;
  margin-bottom: 12px;
}
.settings-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}
.settings-actions button {
  padding: 6px 18px;
  font-size: 15px;
  border: none;
  border-radius: 5px;
  background: #409eff;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}
.settings-actions button:hover {
  background: #337bb7;
}
.settings-msg {
  color: #409eff;
  font-size: 14px;
  margin-top: 6px;
}
</style>