import axios from 'axios';

// 创建 axios 实例
const axiosInstance = axios.create({
  timeout: 10000
  // 不加 withCredentials，保证请求最普通
});

// 请求拦截器：自动添加 Authorization 头
axiosInstance.interceptors.request.use(
  config => {
    // 获取本地存储的 token（如果有的话）
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    // 请求成功，直接返回响应
    return response;
  },
  error => {
    // 检查是否是 401 未授权错误
    if (error.response && error.response.status === 401) {
      // 清除本地 token
      localStorage.removeItem('token');
      
      // 提示用户并跳转到登录页
      alert('登录已过期，请重新登录');
      
      // 使用多种方式确保跳转成功
      setTimeout(() => {
        window.location.replace('/');
      }, 100);
      
      return Promise.reject(error);
    }
    
    // 其他错误正常抛出
    return Promise.reject(error);
  }
);

export default axiosInstance;
