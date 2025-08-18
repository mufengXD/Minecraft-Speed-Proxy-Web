<template>
  <div class="global-log-container">
    <transition name="log-fade" mode="out-in">
      <div v-if="currentMessage" :key="messageKey" class="log-message" :class="messageType">
        {{ currentMessage }}
      </div>
      <div v-else class="log-placeholder">
        <!-- 占位，保持高度 -->
      </div>
    </transition>
  </div>
</template>

<script>
import logManager from '../utils/logManager.js'

export default {
  name: 'GlobalLog',
  data() {
    return {
      currentMessage: '',
      messageType: 'info',
      messageKey: 0,
      hideTimer: null,
      removeListener: null
    }
  },
  mounted() {
    // 使用日志管理器监听事件
    this.removeListener = logManager.addListener(this.showMessage);
  },
  beforeUnmount() {
    // 清理事件监听
    if (this.removeListener) {
      this.removeListener();
    }
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
    }
  },
  beforeDestroy() {
    // Vue 2 兼容性
    if (this.removeListener) {
      this.removeListener();
    }
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
    }
  },
  methods: {
    showMessage({ message, type = 'info', duration = 3000 }) {
      try {
        // 清除之前的定时器
        if (this.hideTimer) {
          clearTimeout(this.hideTimer);
          this.hideTimer = null;
        }
        
        // 设置新消息
        this.currentMessage = message;
        this.messageType = type;
        this.messageKey++; // 强制重新渲染动画
        
        // 设置自动隐藏
        this.hideTimer = setTimeout(() => {
          this.currentMessage = '';
          this.messageType = 'info';
          this.hideTimer = null;
        }, duration);
      } catch (error) {
        console.error('GlobalLog showMessage error:', error);
      }
    }
  }
}
</script>

<style scoped>
.global-log-container {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  width: 80%;
  max-width: 600px;
  min-height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.log-message {
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  max-width: 100%;
  word-wrap: break-word;
}

.log-message.success {
  background: rgba(40, 167, 69, 0.9);
  color: white;
  border: 1px solid rgba(40, 167, 69, 0.3);
}

.log-message.error {
  background: rgba(220, 53, 69, 0.9);
  color: white;
  border: 1px solid rgba(220, 53, 69, 0.3);
}

.log-message.warning {
  background: rgba(255, 193, 7, 0.9);
  color: #212529;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.log-message.info {
  background: rgba(23, 162, 184, 0.9);
  color: white;
  border: 1px solid rgba(23, 162, 184, 0.3);
}

.log-placeholder {
  height: 40px;
  width: 100%;
}

/* 淡出动画 */
.log-fade-enter-active,
.log-fade-leave-active {
  transition: all 0.4s ease;
}

.log-fade-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}

.log-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.log-fade-enter-to,
.log-fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>
