<template>
  <div class="user-management">
    <GlobalLog />
    <div class="header">
      <h2>用户管理</h2>
      <div class="header-right">
        <div class="whitelist-status" :class="{ 'status-enabled': whitelistStatus, 'status-disabled': !whitelistStatus }" @click="toggleWhitelistStatus">
          <span>白名单状态：{{ whitelistStatus ? '开启' : '关闭' }}</span>
          <i class="status-icon">{{ whitelistStatus ? '●' : '○' }}</i>
        </div>
        <div class="actions">
          <button class="action-btn blacklist-btn" @click="handleBlacklistManage">黑名单管理</button>
          <button class="action-btn whitelist-btn" @click="handleWhitelistManage">白名单管理</button>
        </div>
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
              <button class="btn btn-ban" @click="banUser(user)">添加黑名单</button>
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
import GlobalLog from '../components/GlobalLog.vue'
import logManager from '../utils/logManager.js'

export default {
  name: 'UserManage',
  components: { GlobalLog },
  data() {
    return {
      onlineUsers: [],
      whitelist: [], // 新增白名单列表
      whitelistStatus: false // 白名单开启状态
    }
  },
  async mounted() {
    await this.fetchOnlineUsers();
    await this.fetchWhitelist(); // 挂载时获取白名单
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
    async fetchWhitelist() {
      try {
        const response = await axios.get('/api/get_whitelist');
        if (response.data.status === 200) {
          this.whitelist = response.data.white_list || [];
          this.whitelistStatus = response.data.whitelist_status || false;
        } else {
          this.whitelist = [];
          this.whitelistStatus = false;
        }
      } catch (error) {
        this.whitelist = [];
        this.whitelistStatus = false;
      }
    },
    getWhitelistStatus(user) {
      // 查询玩家是否在白名单列表
      return this.whitelist.includes(user.username) ? '白名单玩家' : '非白名单玩家';
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
    async addToWhitelist(user) {
      try {
        logManager.info(`正在将 ${user.username} 添加到白名单...`);
        const response = await axios.post('/api/add_whitelist_user', { username: user.username });
        if (response.data && response.data.status === 200) {
          await this.fetchWhitelist();
          logManager.success(`成功将 ${user.username} 添加到白名单`);
        } else {
          logManager.error(`添加白名单失败：${response.data?.message || '未知错误'}`);
        }
      } catch (error) {
        logManager.error(`添加白名单失败：${error.response?.data?.message || error.message}`);
      }
    },
    async banUser(user) {
      try {
        logManager.info(`正在将 ${user.username} 添加到黑名单...`);
        const response = await axios.post('/api/add_blacklist_user', { username: user.username });
        if (response.data && response.data.status === 200) {
          logManager.success(`成功将 ${user.username} 添加到黑名单`);
        } else {
          logManager.error(`添加黑名单失败：${response.data?.message || '未知错误'}`);
        }
      } catch (error) {
        logManager.error(`添加黑名单失败：${error.response?.data?.message || error.message}`);
      }
    },
    async kickUser(user) {
      try {
        logManager.info(`正在踢出玩家 ${user.username}...`);
        const response = await axios.post('/api/kick_player', { username: user.username });
        if (response.data && response.data.status === 200) {
          await this.fetchOnlineUsers();
          logManager.success(`成功踢出玩家 ${user.username}`);
        } else {
          logManager.error(`踢出失败：${response.data?.message || '未知错误'}`);
        }
      } catch (error) {
        logManager.error(`踢出失败：${error.response?.data?.message || error.message}`);
      }
    },
    async toggleWhitelistStatus() {
      try {
        let response;
        const action = this.whitelistStatus ? '禁用' : '启用';
        logManager.info(`正在${action}白名单...`);
        
        if (this.whitelistStatus) {
          // 当前是开启状态，点击后禁用
          response = await axios.get('/api/disable_whitelist');
        } else {
          // 当前是关闭状态，点击后启用
          response = await axios.get('/api/enable_whitelist');
        }
        
        if (response.data && response.data.status === 200) {
          this.whitelistStatus = !this.whitelistStatus;
          logManager.success(`白名单已${this.whitelistStatus ? '启用' : '禁用'}`);
        } else {
          logManager.error(`操作失败：${response.data?.message || '未知错误'}`);
        }
      } catch (error) {
        logManager.error(`操作失败：${error.response?.data?.message || error.message}`);
      }
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

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.whitelist-status {
  padding: 8px 12px;
  border-radius: 6px;
  border: 2px solid;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  user-select: none;
}

.whitelist-status:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.status-enabled {
  background-color: #d4edda;
  border-color: #28a745;
  color: #155724;
}

.status-enabled:hover {
  background-color: #c3e6cb;
}

.status-disabled {
  background-color: #f8d7da;
  border-color: #dc3545;
  color: #721c24;
}

.status-disabled:hover {
  background-color: #f1b0b7;
}

.whitelist-status span {
  font-size: 14px;
  font-weight: 600;
}

.status-icon {
  font-size: 16px;
  font-weight: bold;
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
