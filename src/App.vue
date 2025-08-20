<template>
  <div class="login-container">
    <!-- 背景动画 -->
    <div class="background-animation">
      <div class="minecraft-blocks">
        <div class="block block-1"></div>
        <div class="block block-2"></div>
        <div class="block block-3"></div>
        <div class="block block-4"></div>
        <div class="block block-5"></div>
        <div class="block block-6"></div>
      </div>
    </div>
    
    <!-- 登录卡片 -->
    <div class="login-card">
      <!-- 头部标题区域 -->
      <div class="login-header">
        <div class="logo-section">
          <div class="minecraft-logo">
            <!-- <div class="logo-icon">⛏️</div>
            <div class="logo-shine"></div> -->
          </div>
          <h1 class="main-title">欢迎使用</h1>
          <h2 class="sub-title">Minecraft-Speed-Proxy-Web</h2>
        </div>
        <p class="welcome-text">管理员控制面板</p>
      </div>
      
      <!-- 表单区域 -->
      <div class="login-form">
        <div class="input-group">
          <label for="password" class="input-label">
            管理员密码
          </label>
          <div class="input-wrapper">
            <input 
              id="password"
              type="password" 
              v-model="password" 
              placeholder="请输入管理员密码" 
              class="password-input"
              @keyup.enter="login"
              :disabled="LoginState"
            />
            <div class="input-focus-line"></div>
          </div>
        </div>
        
        <button 
          :disabled="LoginState || !password.trim()" 
          @click="login"
          class="login-button"
          :class="{ 'loading': LoginState }"
        >
          <span v-if="!LoginState" class="button-content">
            <i class="button-icon"></i>
            <span class="button-text">登录管理面板</span>
          </span>
          <span v-else class="button-content loading">
            <div class="loading-spinner"></div>
            <span class="button-text">登录中...</span>
          </span>
        </button>
        
        <!-- 状态消息 -->
        <transition name="message-fade">
          <div v-if="loginMsg" class="message" :class="messageType">
            <i class="message-icon">{{ messageIcon }}</i>
            <span class="message-text">{{ loginMsg }}</span>
          </div>
        </transition>
      </div>
      
      <!-- 底部信息 -->
      <div class="login-footer">
        <div class="version-info">
          <span class="version-label">Version</span>
          <span class="version-number">1.0.0</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from './utils/axios.js'

  export default {
    data() {
      return {
        password: '',
        LoginState: false,
        loginMsg: '',
        loginSuccess: false
      };
    },
    computed: {
      sendJson() {
        return JSON.stringify({ password: this.password });
      },
      messageType() {
        if (!this.loginMsg) return '';
        return this.loginSuccess ? 'success' : 'error';
      },
      messageIcon() {
        if (!this.loginMsg) return '';
        return this.loginSuccess ? '✅' : '❌';
      }
    },
    methods: {
      async login() {
        if (!this.password.trim()) {
          this.loginMsg = '请输入密码';
          this.loginSuccess = false;
          return;
        }
        
        this.LoginState = true;
        this.loginMsg = '';
        this.loginSuccess = false;
        
        try {
          // 不使用 withCredentials，避免 CORS 问题
          const response = await axios.post('/api/login', { password: this.password });
          const result = response.data;
          
          if (result.status === 200) {
            // 登录成功
            this.loginSuccess = true;
            this.loginMsg = result.message || '登录成功';
            
            // 如果后端返回了 token，保存到 localStorage
            if (result.token) {
              localStorage.setItem('token', result.token);
            }
            
            setTimeout(() => {
              window.location.href = '/src/main-ui.html'; // 跳转到 main-ui.html
            }, 1000);
          } else if (result.status === 401) {
            this.loginSuccess = false;
            this.loginMsg = result.message || '密码错误';
          } else {
            this.loginSuccess = false;
            this.loginMsg = '登录失败，请重试';
          }
        } catch (error) {
          this.loginSuccess = false;
          this.loginMsg = '连接服务器失败，请检查网络';
          console.error('请求失败', error);
        } finally {
          this.LoginState = false;
        }
      }
    }
  }
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 确保全屏覆盖，去除默认留白 */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

/* 主容器样式 */
.login-container {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #667eea 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
}

/* 背景动画 */
.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.minecraft-blocks {
  position: absolute;
  width: 100%;
  height: 100%;
}

.block {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  animation: float 6s ease-in-out infinite;
}

.block-1 {
  width: 40px;
  height: 40px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.block-2 {
  width: 30px;
  height: 30px;
  top: 20%;
  right: 15%;
  animation-delay: 1s;
}

.block-3 {
  width: 50px;
  height: 50px;
  bottom: 25%;
  left: 20%;
  animation-delay: 2s;
}

.block-4 {
  width: 35px;
  height: 35px;
  bottom: 15%;
  right: 25%;
  animation-delay: 3s;
}

.block-5 {
  width: 45px;
  height: 45px;
  top: 50%;
  left: 5%;
  animation-delay: 4s;
}

.block-6 {
  width: 25px;
  height: 25px;
  top: 30%;
  right: 5%;
  animation-delay: 5s;
}

/* 登录卡片 */
.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2);
  padding: 50px 40px;
  width: 100%;
  max-width: 480px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  animation: cardSlideIn 0.8s ease-out;
}

/* 头部区域 */
.login-header {
  margin-bottom: 40px;
}

.logo-section {
  margin-bottom: 20px;
}

.minecraft-logo {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.logo-icon {
  font-size: 60px;
  display: inline-block;
  animation: logoRotate 3s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.logo-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  animation: logoShine 3s ease-in-out infinite;
}

.main-title {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sub-title {
  font-size: 18px;
  font-weight: 600;
  color: #34495e;
  margin-bottom: 16px;
  line-height: 1.4;
  letter-spacing: 0.5px;
}

.welcome-text {
  font-size: 14px;
  color: #7f8c8d;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* 表单区域 */
.login-form {
  margin-bottom: 30px;
}

.input-group {
  margin-bottom: 30px;
  text-align: left;
}

.input-label {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
}

.input-label .icon {
  margin-right: 8px;
  font-size: 16px;
}

.input-wrapper {
  position: relative;
}

.password-input {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e1e8ed;
  border-radius: 16px;
  font-size: 16px;
  background: #f8f9fa;
  transition: all 0.3s ease;
  outline: none;
  font-family: inherit;
}

.password-input:focus {
  border-color: #667eea;
  background: #fff;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
}

.password-input:disabled {
  background: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
}

.input-focus-line {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  transform: translateX(-50%);
  transition: width 0.3s ease;
}

.password-input:focus + .input-focus-line {
  width: 100%;
}

/* 登录按钮 */
.login-button {
  width: 100%;
  padding: 16px 32px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  position: relative;
  overflow: hidden;
  margin-bottom: 20px;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
}

.login-button:active:not(:disabled) {
  transform: translateY(-1px);
}

.login-button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.button-icon {
  font-size: 18px;
}

.button-text {
  font-size: 16px;
  font-weight: 600;
}

/* 加载动画 */
.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 消息区域 */
.message {
  padding: 16px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.message.success {
  background: linear-gradient(135deg, #d4edda, #c3e6cb);
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: linear-gradient(135deg, #f8d7da, #f5c6cb);
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.message-icon {
  font-size: 16px;
}

.message-text {
  flex: 1;
}

/* 底部信息 */
.login-footer {
  border-top: 1px solid #e1e8ed;
  padding-top: 25px;
  margin-top: 25px;
}

.version-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 10px;
}

.version-label {
  font-size: 12px;
  color: #95a5a6;
  font-weight: 500;
}

.version-number {
  font-size: 12px;
  color: #667eea;
  font-weight: 600;
  background: rgba(102, 126, 234, 0.1);
  padding: 2px 8px;
  border-radius: 8px;
}

.copyright {
  font-size: 11px;
  color: #95a5a6;
  margin: 0;
  opacity: 0.8;
}

/* 动画 */
@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

@keyframes cardSlideIn {
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes logoRotate {
  0%, 100% {
    transform: rotateY(0deg);
  }
  50% {
    transform: rotateY(20deg);
  }
}

@keyframes logoShine {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 消息过渡动画 */
.message-fade-enter-active,
.message-fade-leave-active {
  transition: all 0.3s ease;
}

.message-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.message-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* 响应式设计 */
@media (max-width: 520px) {
  .login-card {
    padding: 40px 30px;
    margin: 0; /* 去除边距 */
    border-radius: 20px;
    max-width: 90vw; /* 确保不超出屏幕 */
  }
  
  .main-title {
    font-size: 28px;
  }
  
  .sub-title {
    font-size: 16px;
  }
  
  .logo-icon {
    font-size: 50px;
  }
}

@media (max-width: 400px) {
  .login-card {
    padding: 30px 20px;
    margin: 0; /* 去除边距 */
    max-width: 95vw; /* 确保不超出屏幕 */
  }
  
  .main-title {
    font-size: 24px;
  }
  
  .sub-title {
    font-size: 14px;
  }
}
</style>