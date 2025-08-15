<template>
  <input type="text" v-model="password" placeholder="请输入密码" />
  <button :disabled="LoginState" @click="login">登陆</button>
  <p>发送的内容：{{ sendJson }}</p>
  <p v-if="loginMsg">{{ loginMsg }}</p>
</template>

<script>
import axios from './utils/axios.js'

  export default {
    data() {
      return {
        password: '',
        LoginState: false,
        loginMsg: ''
      };
    },
    computed: {
      sendJson() {
        return JSON.stringify({ password: this.password });
      }
    },
    methods: {
      async login() {
        try {
          // 不使用 withCredentials，避免 CORS 问题
          const response = await axios.post('/api/login', { password: this.password });
          const result = response.data;
          if (result.status === 200) {
            this.loginMsg = result.message; // 登陆成功
            
            // 如果后端返回了 token，保存到 localStorage
            if (result.token) {
              localStorage.setItem('token', result.token);
            }
            
            window.location.href = '/main-ui.html'; // 跳转到 main-ui.html
          } else if (result.status === 401) {
            this.loginMsg = result.message; // 登陆失败
          } else {
            this.loginMsg = '未知错误';
          }
        } catch (error) {
          // axios 拦截器会处理 401 错误，这里处理其他错误
          this.loginMsg = '请求失败';
          console.error('请求失败', error);
        }
      }
    }
  }
</script>