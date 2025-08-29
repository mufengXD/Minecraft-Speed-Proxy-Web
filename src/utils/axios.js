import axios from 'axios';

// 可统一修改请求前缀
const API_BASE_URL = 'http://127.0.0.1:20220';

// 创建 axios 实例
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

// 添加一个标志位，用于防止重复弹窗
let isUnauthorizedHandled = false;

// 请求拦截器：自动添加 Authorize 头
axiosInstance.interceptors.request.use(
  config => {
    // 获取本地存储的 token（如果有的话）
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorize = token;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器：统一处理 401 响应
axiosInstance.interceptors.response.use(
  response => {
    // 检查响应体中是否包含401状态
    if (response.data && response.data.status === 401) {
      // 如果当前在登录页面，则不处理401错误
      if (window.location.pathname === '/' || window.location.pathname === '/src/App.vue') {
        return response;
      }
      
      if (!isUnauthorizedHandled) {
        isUnauthorizedHandled = true;
        

        localStorage.removeItem('token');
        
        // 提示用户并跳转到登录页
        alert('登录已过期，请重新登录');
        
        setTimeout(() => {
          window.location.replace('/');
        }, 100);
      }
      
      return Promise.reject(new Error('Unauthorized'));
    }
    
    return response;
  },
  error => {
    if (error.response && error.response.status === 401) {
      // 如果当前在登录页面，则不处理401错误
      if (window.location.pathname === '/' || window.location.pathname === '/src/App.vue') {
        return Promise.reject(error);
      }
      
      // 只有当未处理过401错误时才执行登出逻辑
      if (!isUnauthorizedHandled) {
        isUnauthorizedHandled = true;
        
        // 清除本地 token
        localStorage.removeItem('token');
        

        alert('登录已过期，请重新登录');
        
        setTimeout(() => {
          window.location.replace('/');
        }, 100);
      }
      
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

// 添加一个方法用于重置标志位，可以在登录成功后调用
export function resetUnauthorizedHandler() {
  isUnauthorizedHandled = false;
}

export default axiosInstance;