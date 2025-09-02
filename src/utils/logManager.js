// 全局日志管理器
class LogManager {
  constructor() {
    this.listeners = new Set();
  }
  
  addListener(callback) {
    this.listeners.add(callback);
    console.log('LogManager: Listener added, total listeners:', this.listeners.size);
    return () => {
      this.listeners.delete(callback);
      console.log('LogManager: Listener removed, total listeners:', this.listeners.size);
    };
  }
  
  emit(message) {
    console.log('LogManager: Emitting message to', this.listeners.size, 'listeners:', message);
    this.listeners.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('Log listener error:', error);
      }
    });
  }
  
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


export const installLogManager = (Vue) => {
  Vue.prototype.$log = logManager;
};

export default logManager;
