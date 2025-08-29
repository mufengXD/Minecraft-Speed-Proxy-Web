<template>
  <div class="user-management">
    <GlobalLog />
    <div class="header">
      <h2>用户管理</h2>
      <div class="header-right">
        <div class="whitelist-status" :class="{ 'status-enabled': whitelistStatus, 'status-disabled': !whitelistStatus }" @click="toggleWhitelistStatus">
          <span>白名单状态：{{ whitelistStatus ? '开启' : '关闭' }}</span>
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
          <tr v-for="user in paginatedUsers" :key="user.uuid" class="user-row">
            <td>{{ user.username }}</td>
            <td>
              <span :class="['status-badge', isUserInWhitelist(user) ? 'status-active' : 'status-inactive']">
                {{ getWhitelistStatus(user) }}
              </span>
            </td>
            <td>{{ formatOnlineTime(user.online_time_stamp) }}</td>
            <td>{{ formatBytes(user.current_proxy_flow) }}</td>
            <td>{{ user.proxy_target }}</td>
            <td class="actions-cell">
              <button class="btn btn-whitelist" @click="addToWhitelist(user)">添加白名单</button>
              <button class="btn btn-ban" @click="banUser(user)">添加黑名单</button>
              <button class="btn btn-kick" @click="kickUser(user)">踢出</button>
            </td>
          </tr>
          <tr v-if="onlineUsers.length === 0">
            <td colspan="6" class="no-data">暂无在线用户</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页控件 -->
    <div class="pagination-container" v-if="onlineUsers.length > 0">
      <div class="pagination-info">
        共 {{ totalUsers }} 条记录，第 {{ currentPage }} / {{ totalPages }} 页
      </div>
      <div class="pagination-controls">
        <button @click="prevPage" :disabled="currentPage === 1" class="btn-pagination">上一页</button>
        <span class="page-numbers">
          <button 
            v-for="page in visiblePages" 
            :key="page"
            @click="goToPage(page)"
            :class="['btn-page', { 'active': page === currentPage }]"
          >
            {{ page }}
          </button>
        </span>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="btn-pagination">下一页</button>
      </div>
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
      whitelistStatus: false, // 白名单开启状态
      currentPage: 1,
      pageSize: 10
    }
  },
  computed: {
    totalUsers() {
      return this.onlineUsers.length;
    },
    totalPages() {
      return Math.ceil(this.totalUsers / this.pageSize);
    },
    paginatedUsers() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.onlineUsers.slice(start, end);
    },
    visiblePages() {
      const pages = [];
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.totalPages, this.currentPage + 2);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
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
    isUserInWhitelist(user) {
      // 判断用户是否在白名单中
      return this.whitelist.includes(user.username);
    },
    getWhitelistStatus(user) {
      // 查询玩家是否在白名单列表
      return this.whitelist.includes(user.username) ? '白名单玩家' : '普通玩家';
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
          window.location.reload(); // 刷新页面
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
    },
    changePage(page) {
      this.currentPage = page;
    },
    
    // 分页方法
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    
    goToPage(page) {
      this.currentPage = page;
    }
  }
}
</script>

<style scoped>
.user-management {
  padding: 20px;
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
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table th,
.user-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
}

.user-table th {
  background-color: #f5f7fa;
  font-weight: 600;
  color: #333;
}

.user-table tr {
  cursor: pointer;
  transition: background-color 0.3s;
}

.user-table tr:hover {
  background-color: #f5f7fa;
}

.no-data {
  text-align: center;
  color: #909399;
  font-style: italic;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background-color: #f0f9ff;
  color: #409eff;
  border: 1px solid #b3d8ff;
}

.status-inactive {
  background-color: #f5f7fa;
  color: #909399;
  border: 1px solid #d3d4d6;
}

.actions-cell {
  white-space: nowrap;
}

.btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 8px;
  transition: background-color 0.3s;
}

.btn-whitelist {
  background-color: #67c23a;
  color: white;
}

.btn-whitelist:hover {
  background-color: #85ce61;
}

.btn-ban {
  background-color: #f56c6c;
  color: white;
}

.btn-ban:hover {
  background-color: #f78989;
}

.btn-kick {
  background-color: #e6a23c;
  color: white;
}

.btn-kick:hover {
  background-color: #ebb563;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.pagination-info {
  color: #606266;
  font-size: 14px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-pagination, .btn-page {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  background: white;
  color: #606266;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-pagination:hover, .btn-page:hover {
  color: #409eff;
  border-color: #c6e2ff;
}

.btn-pagination:disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

.btn-page.active {
  background-color: #409eff;
  color: white;
  border-color: #409eff;
}

.page-numbers {
  display: flex;
  gap: 4px;
}
</style>
