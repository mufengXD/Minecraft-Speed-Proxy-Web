<template>
  <div class="user-management">
    <div class="header">
      <h2>用户管理</h2>
      <div class="actions">
        <button class="action-btn blacklist-btn" @click="handleBlacklistManage">黑名单管理</button>
        <button class="action-btn whitelist-btn" @click="handleWhitelistManage">白名单管理</button>
      </div>
    </div>
    
    <div class="table-container">
      <table class="user-table">
        <thead>
          <tr>
            <th>用户名</th>
            <th>白名单状态</th>
            <th>在线时间</th>
            <th>本次代理流量</th>
            <th>代理IP</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in onlineUsers" :key="user.uuid" class="user-row">
            <td>{{ user.username }}</td>
            <td>{{ getWhitelistStatus(user) }}</td>
            <td>{{ formatOnlineTime(user.online_time_stamp) }}</td>
            <td>{{ formatBytes(user.current_proxy_flow) }}</td>
            <td>{{ user.proxy_target }}</td>
            <td class="actions-cell">
              <button class="btn btn-whitelist" @click="addToWhitelist(user)">添加白名单</button>
              <button class="btn btn-ban" @click="banUser(user)">封禁</button>
              <button class="btn btn-kick" @click="kickUser(user)">踢出</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from '../utils/axios.js'

export default {
  name: 'UserManage',
  data() {
    return {
      onlineUsers: []
    }
  },
  async mounted() {
    await this.fetchOnlineUsers();
  },
  methods: {
    async fetchOnlineUsers() {
      try {
        const response = await axios.get('/api/get_online_users');
        if (response.data.status === 200) {
          this.onlineUsers = response.data.online_users;
          console.log('获取在线用户成功:', response.data);
          console.log('用户数据示例:', this.onlineUsers[0]); // 调试用户数据结构
        } else if (response.data.status === 401) {
          console.error('401错误：未授权访问在线用户列表');
          // axios 拦截器会自动处理 401 跳转，这里只记录日志
        } else {
          console.error('获取在线用户失败:', response.data.message);
        }
      } catch (error) {
        // axios 拦截器已处理 401 响应跳转，这里处理其他错误
        console.error('获取在线用户失败:', error);
      }
    },
    getWhitelistStatus(user) {
      // TODO: 实现白名单状态检查逻辑
      return '白名单玩家';
    },
    formatOnlineTime(timestamp) {
      // 格式化在线时间
      const now = Math.floor(Date.now() / 1000);
      const diff = now - timestamp;
      const minutes = Math.floor(diff / 60);
      const hours = Math.floor(minutes / 60);
      
      if (hours > 0) {
        return `${hours}小时${minutes % 60}分钟`;
      } else {
        return `${minutes}分钟`;
      }
    },
    formatBytes(bytes) {
      // 处理无效值
      if (bytes === undefined || bytes === null || isNaN(bytes) || bytes < 0) {
        return '0 B';
      }
      
      if (bytes === 0) return '0 B';
      
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    addToWhitelist(user) {
      // TODO: 实现添加白名单逻辑
      console.log('添加白名单:', user.username);
    },
    banUser(user) {
      // TODO: 实现封禁用户逻辑
      console.log('封禁用户:', user.username);
    },
    kickUser(user) {
      // TODO: 实现踢出用户逻辑
      console.log('踢出用户:', user.username);
    },
    handleBlacklistManage() {
      this.$router.push('/blacklist_manage')
    },
    handleWhitelistManage() {
      this.$router.push('/whitelist_manage')
    }
  }
}
</script>

<style scoped>
.user-management {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  color: #333;
}

.actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.blacklist-btn {
  background-color: #e74c3c;
  color: white;
}

.blacklist-btn:hover {
  background-color: #c0392b;
}

.whitelist-btn {
  background-color: #27ae60;
  color: white;
}

.whitelist-btn:hover {
  background-color: #229954;
}

.table-container {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.user-table thead {
  background-color: #f8f9fa;
  position: sticky;
  top: 0;
  z-index: 10;
}

.user-table th,
.user-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.user-table th {
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #ddd;
}

.user-row:hover {
  background-color: #f8f9fa;
}

.actions-cell {
  white-space: nowrap;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 5px;
  transition: background-color 0.3s;
}

.btn-whitelist {
  background-color: #3498db;
  color: white;
}

.btn-whitelist:hover {
  background-color: #2980b9;
}

.btn-ban {
  background-color: #e74c3c;
  color: white;
}

.btn-ban:hover {
  background-color: #c0392b;
}

.btn-kick {
  background-color: #f39c12;
  color: white;
}

.btn-kick:hover {
  background-color: #e67e22;
}
</style>
