// 全局日志管理器
class LogManager {
  constructor() {
    this.listeners = new Set();
  }
  
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
  
  emit(message) {
    this.listeners.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('Log listener error:', error);
      }
    });
  }
  
  // 便捷方法
  success(message, duration = 3000) {
    this.emit({ message, type: 'success', duration });
  }
  
  error(message, duration = 3000) {
    this.emit({ message, type: 'error', duration });
  }
  
  warning(message, duration = 3000) {
    this.emit({ message, type: 'warning', duration });
  }
  
  info(message, duration = 3000) {
    this.emit({ message, type: 'info', duration });
  }
}

const logManager = new LogManager();

// 添加到Vue原型，方便在组件中使用
export const installLogManager = (Vue) => {
  Vue.prototype.$log = logManager;
};

export default logManager;
