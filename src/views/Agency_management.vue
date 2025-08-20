<template>
  <div class="proxy-management">
    <div class="header-section">
      <h2>代理管理</h2>
      <div class="header-actions">
        <button @click="showAddDialog" class="btn-primary">添加代理</button>
        <button @click="batchSetProxyDialog" class="btn-secondary" :disabled="selectedProxies.length === 0">批量设置代理</button>
        <button @click="batchDelete" class="btn-danger" :disabled="selectedProxies.length === 0">批量删除</button>
      </div>
    </div>

    <div class="table-container">
      <table class="proxy-table">
        <thead>
          <tr>
            <th>
              <input type="checkbox" @change="selectAll" :checked="isAllSelected">
            </th>
            <th>玩家名</th>
            <th>白名单状态</th>
            <th>代理IP</th>
            <th>代理端口</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="proxy in paginatedProxies" 
            :key="proxy.id"
            :class="{ 'selected': selectedProxies.includes(proxy.id) }"
            @click="toggleSelect(proxy.id)"
          >
            <td>
              <input 
                type="checkbox" 
                :checked="selectedProxies.includes(proxy.id)"
                @click.stop
                @change="toggleSelect(proxy.id)"
              >
            </td>
            <td>{{ proxy.username }}</td>
            <td>
              <span :class="['status-badge', isUserInWhitelist(proxy.username) ? 'status-active' : 'status-inactive']">
                {{ isUserInWhitelist(proxy.username) ? '白名单玩家' : '普通玩家' }}
              </span>
            </td>
            <td>{{ proxy.proxy_target_addr }}</td>
            <td>{{ proxy.proxy_target_port }}</td>
            <td>
              <button @click.stop="editProxy(proxy)" class="btn-edit">设置代理</button>
              <button @click.stop="deleteProxySingle(proxy)" class="btn-delete-single">删除代理</button>
            </td>
          </tr>
          <tr v-if="paginatedProxies.length === 0">
            <td colspan="6" class="no-data">暂无代理数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页控件 -->
    <div class="pagination-container" v-if="proxyList.length > 0">
      <div class="pagination-info">
        共 {{ totalProxies }} 条记录，第 {{ currentPage }} / {{ totalPages }} 页
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

    <!-- 添加/编辑代理弹窗 -->
    <div v-if="showProxyDialog" class="modal-overlay" @click="closeProxyDialog">
      <div class="modal-content" @click.stop>
        <h3>{{ isEditing ? '设置代理' : '添加代理' }}</h3>
        <div class="form-group">
          <label>玩家名：</label>
          <input 
            v-model="proxyForm.username" 
            type="text" 
            :readonly="isEditing"
            placeholder="请输入玩家名"
            @keyup.enter="submitProxy"
          >
        </div>
        <div class="form-group">
          <label>代理IP：</label>
          <input 
            v-model="proxyForm.proxy_address" 
            type="text" 
            placeholder="请输入代理IP"
            @keyup.enter="submitProxy"
          >
        </div>
        <div class="form-group">
          <label>代理端口：</label>
          <input 
            v-model="proxyForm.proxy_port" 
            type="number" 
            placeholder="请输入代理端口"
            @keyup.enter="submitProxy"
          >
        </div>
        <div class="modal-actions">
          <button @click="submitProxy" class="btn-primary">确认</button>
          <button @click="closeProxyDialog" class="btn-secondary">取消</button>
        </div>
        <div v-if="proxyMsg" class="modal-msg">{{ proxyMsg }}</div>
      </div>
    </div>

    <!-- 批量设置代理弹窗 -->
    <div v-if="showBatchDialog" class="modal-overlay" @click="closeBatchDialog">
      <div class="modal-content" @click.stop>
        <h3>批量设置代理</h3>
        <div class="form-group">
          <label>代理IP：</label>
          <input 
            v-model="batchForm.proxy_address" 
            type="text" 
            placeholder="请输入代理IP"
            @keyup.enter="submitBatchProxy"
          >
        </div>
        <div class="form-group">
          <label>代理端口：</label>
          <input 
            v-model="batchForm.proxy_port" 
            type="number" 
            placeholder="请输入代理端口"
            @keyup.enter="submitBatchProxy"
          >
        </div>
        <div class="selected-info">
          已选择 {{ selectedProxies.length }} 个玩家
        </div>
        <div class="modal-actions">
          <button @click="submitBatchProxy" class="btn-primary">确认</button>
          <button @click="closeBatchDialog" class="btn-secondary">取消</button>
        </div>
        <div v-if="batchMsg" class="modal-msg">{{ batchMsg }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import MultiSelect from '../components/MultiSelect.vue'
import axios from '../utils/axios.js'
import logManager from '@/utils/logManager.js'

export default {
  name: 'ProxyManage',
  components: { MultiSelect },
  data() {
    return {
      proxyList: [], // 代理列表数据
      selectedProxies: [], // 选中的代理ID列表
      currentPage: 1,
      pageSize: 10,
      whitelist: [],
      
      // 添加/编辑代理弹窗
      showProxyDialog: false,
      isEditing: false,
      proxyForm: {
        id: null,
        username: '',
        proxy_address: '',
        proxy_port: ''
      },
      proxyMsg: '',
      
      // 批量设置代理弹窗
      showBatchDialog: false,
      batchForm: {
        proxy_address: '',
        proxy_port: ''
      },
      batchMsg: ''
    }
  },
  computed: {
    totalProxies() {
      return this.proxyList.length;
    },
    totalPages() {
      return Math.ceil(this.totalProxies / this.pageSize);
    },
    paginatedProxies() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.proxyList.slice(start, end);
    },
    isAllSelected() {
      return this.paginatedProxies.length > 0 && 
             this.paginatedProxies.every(proxy => this.selectedProxies.includes(proxy.id));
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
    await this.fetchProxyList();
    await this.fetchWhitelist(); // 挂载时获取白名单
  },
  methods: {
    async fetchProxyList() {
      try {
        const response = await axios.get('/api/get_user_proxies');
        if (response.data && response.data.status === 200 && Array.isArray(response.data.user_proxies)) {
          // 将user_proxies数组映射为代理列表
          this.proxyList = response.data.user_proxies.map((item, idx) => ({
            id: idx + 1, // 可用idx做唯一id，实际应用可用后端id
            username: item.username,
            proxy_target_addr: item.proxy_target_addr,
            proxy_target_port: item.proxy_target_port
          }));
          logManager.success('获取代理列表成功');
        } else {
          this.proxyList = [];
          logManager.error('代理数据异常');
        }
      } catch (error) {
        this.proxyList = [];
        logManager.error('获取代理列表失败');
      }
    },
    
    async fetchWhitelist() {
      try {
        const response = await axios.get('/api/get_whitelist');
        if (response.data.status === 200) {
          this.whitelist = response.data.white_list || [];
        } else {
          this.whitelist = [];
        }
      } catch (error) {
        this.whitelist = [];
      }
    },
    
    isUserInWhitelist(username) {
      return this.whitelist.includes(username);
    },
    
    // 添加代理
    async addProxy(proxyData) {
      try {
        const response = await axios.post('/api/set_user_proxy', {
          username: proxyData.username,
          proxy_address: proxyData.proxy_address,
          proxy_port: parseInt(proxyData.proxy_port)
        });
        if (response.data && response.data.status === 200) {
          await this.fetchProxyList();
          logManager.success('添加代理成功');
          return true;
        } else {
          logManager.error(`添加代理失败：${response.data?.message || '未知错误'}`);
          return false;
        }
      } catch (error) {
        console.error('添加代理失败:', error);
        logManager.error(`添加代理失败：${error.response?.data?.message || error.message}`);
        return false;
      }
    },
    
    // 设置代理
    async setProxy(proxyData) {
      try {
        const response = await axios.post('/api/set_user_proxy', {
          username: proxyData.username,
          proxy_address: proxyData.proxy_address,
          proxy_port: parseInt(proxyData.proxy_port)
        });
        if (response.data && response.data.status === 200) {
          await this.fetchProxyList();
          logManager.success('设置代理成功');
          return true;
        } else {
          logManager.error(`设置代理失败：${response.data?.message || '未知错误'}`);
          return false;
        }
      } catch (error) {
        console.error('设置代理失败:', error);
        logManager.error(`设置代理失败：${error.response?.data?.message || error.message}`);
        return false;
      }
    },
    
    // 批量设置代理（循环调用单个设置接口）
    async batchSetProxy(proxyData, playerIds) {
      try {
        logManager.info(`开始批量设置代理，共${playerIds.length}个玩家...`);
        let successCount = 0;
        let failCount = 0;
        
        // 循环调用单个设置代理接口
        for (const playerId of playerIds) {
          const proxy = this.proxyList.find(p => p.id === playerId);
          if (!proxy) {
            failCount++;
            continue;
          }            try {
            const response = await axios.post('/api/set_user_proxy', {
              username: proxy.username,
              proxy_address: proxyData.proxy_address,
              proxy_port: parseInt(proxyData.proxy_port)
            });
            
            if (response.data && response.data.status === 200) {
              successCount++;
            } else {
              failCount++;
            }
          } catch (error) {
            console.error(`设置代理失败 (${proxy.username}):`, error);
            failCount++;
          }
        }
        
        // 刷新列表
        await this.fetchProxyList();
        
        // 显示结果
        if (failCount === 0) {
          logManager.success(`批量设置代理成功，共${successCount}个玩家`);
        } else if (successCount === 0) {
          logManager.error(`批量设置代理失败，${failCount}个玩家操作失败`);
        } else {
          logManager.warning(`批量设置代理完成：成功${successCount}个，失败${failCount}个`);
        }
        
        return successCount > 0;
      } catch (error) {
        console.error('批量设置代理失败:', error);
        logManager.error('批量设置代理失败');
        return false;
      }
    },
    
    // 删除代理
    async deleteProxy(playerIds) {
      try {
        logManager.info(`开始删除代理，共${playerIds.length}个玩家...`);
        let successCount = 0;
        let failCount = 0;
        
        // 循环调用删除接口
        for (const playerId of playerIds) {
          const proxy = this.proxyList.find(p => p.id === playerId);
          if (!proxy) {
            failCount++;
            continue;
          }
          
          try {
            const response = await axios.post('/api/remove_user_proxy', {
              username: proxy.username
            });
            
            if (response.data && response.data.status === 200) {
              successCount++;
            } else {
              failCount++;
            }
          } catch (error) {
            console.error(`删除代理失败 (${proxy.username}):`, error);
            failCount++;
          }
        }
        
        // 刷新列表
        await this.fetchProxyList();
        
        // 显示结果
        if (failCount === 0) {
          logManager.success(`删除代理成功，共${successCount}个玩家`);
        } else if (successCount === 0) {
          logManager.error(`删除代理失败，${failCount}个玩家操作失败`);
        } else {
          logManager.warning(`删除代理完成：成功${successCount}个，失败${failCount}个`);
        }
        
        return successCount > 0;
      } catch (error) {
        console.error('删除代理失败:', error);
        logManager.error('删除代理失败');
        return false;
      }
    },
    
    // 选择相关方法
    toggleSelect(proxyId) {
      const index = this.selectedProxies.indexOf(proxyId);
      if (index > -1) {
        this.selectedProxies.splice(index, 1);
      } else {
        this.selectedProxies.push(proxyId);
      }
    },
    
    selectAll() {
      if (this.isAllSelected) {
        this.selectedProxies = this.selectedProxies.filter(id => 
          !this.paginatedProxies.some(proxy => proxy.id === id)
        );
      } else {
        this.paginatedProxies.forEach(proxy => {
          if (!this.selectedProxies.includes(proxy.id)) {
            this.selectedProxies.push(proxy.id);
          }
        });
      }
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
    },
    
    // 弹窗相关方法
    showAddDialog() {
      this.isEditing = false;
      this.proxyForm = {
        id: null,
        username: '',
        proxy_address: 'mc.hypixel.net',
        proxy_port: 25565
      };
      this.proxyMsg = '';
      this.showProxyDialog = true;
    },
    
    editProxy(proxy) {
      this.isEditing = true;
      this.proxyForm = {
        id: proxy.id,
        username: proxy.username,
        proxy_address: proxy.proxy_target_addr,
        proxy_port: proxy.proxy_target_port
      };
      this.proxyMsg = '';
      this.showProxyDialog = true;
    },
    
    closeProxyDialog() {
      this.showProxyDialog = false;
    },
    
    async submitProxy() {
      if (!this.proxyForm.username || !this.proxyForm.proxy_address || !this.proxyForm.proxy_port) {
        this.proxyMsg = '请填写完整信息';
        return;
      }
      
      let success = false;
      if (this.isEditing) {
        success = await this.setProxy(this.proxyForm);
      } else {
        success = await this.addProxy(this.proxyForm);
      }
      
      if (success) {
        this.closeProxyDialog();
      }
    },
    
    // 批量操作相关方法
    batchSetProxyDialog() {
      this.batchForm = {
        proxy_address: '',
        proxy_port: ''
      };
      this.batchMsg = '';
      this.showBatchDialog = true;
    },
    
    closeBatchDialog() {
      this.showBatchDialog = false;
    },
    
    async submitBatchProxy() {
      if (!this.batchForm.proxy_address || !this.batchForm.proxy_port) {
        this.batchMsg = '请填写完整信息';
        return;
      }
      
      const success = await this.batchSetProxy(this.batchForm, this.selectedProxies);
      if (success) {
        this.selectedProxies = [];
        this.closeBatchDialog();
      }
    },
    
    async batchDelete() {
      if (this.selectedProxies.length === 0) return;
      
      if (confirm(`确定要删除选中的 ${this.selectedProxies.length} 个代理吗？`)) {
        const success = await this.deleteProxy(this.selectedProxies);
        if (success) {
          this.selectedProxies = [];
        }
      }
    },
    
    // 删除单个代理
    async deleteProxySingle(proxy) {
      if (confirm(`确定要删除玩家 "${proxy.username}" 的代理设置吗？`)) {
        const success = await this.deleteProxy([proxy.id]);
        if (success) {
          // 如果删除的是当前选中的项，从选中列表中移除
          const index = this.selectedProxies.indexOf(proxy.id);
          if (index > -1) {
            this.selectedProxies.splice(index, 1);
          }
        }
      }
    }
  }
}
</script>

<style scoped>
.proxy-management {
  padding: 20px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-section h2 {
  margin: 0;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-primary, .btn-secondary, .btn-danger, .btn-edit, .btn-delete-single {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #409eff;
  color: white;
}

.btn-primary:hover {
  background-color: #66b1ff;
}

.btn-secondary {
  background-color: #909399;
  color: white;
}

.btn-secondary:hover {
  background-color: #a6a9ad;
}

.btn-danger {
  background-color: #f56c6c;
  color: white;
}

.btn-danger:hover {
  background-color: #f78989;
}

.btn-edit {
  background-color: #67c23a;
  color: white;
  padding: 4px 8px;
  font-size: 12px;
  margin-right: 8px;
}

.btn-edit:hover {
  background-color: #85ce61;
}

.btn-delete-single {
  background-color: #f56c6c;
  color: white;
  padding: 4px 8px;
  font-size: 12px;
}

.btn-delete-single:hover {
  background-color: #f78989;
}

.btn-primary:disabled, .btn-secondary:disabled, .btn-danger:disabled {
  background-color: #c0c4cc;
  cursor: not-allowed;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
}

.proxy-table {
  width: 100%;
  border-collapse: collapse;
}

.proxy-table th,
.proxy-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
}

.proxy-table th {
  background-color: #f5f7fa;
  font-weight: 600;
  color: #333;
}

.proxy-table tr {
  cursor: pointer;
  transition: background-color 0.3s;
}

.proxy-table tr:hover {
  background-color: #f5f7fa;
}

.proxy-table tr.selected {
  background-color: #ecf5ff;
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

.no-data {
  text-align: center;
  color: #909399;
  font-style: italic;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  min-width: 400px;
  max-width: 500px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  margin: 0 0 20px 0;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: #333;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #409eff;
}

.form-group input:readonly {
  background-color: #f5f7fa;
  color: #909399;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.modal-msg {
  color: #f56c6c;
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
}

.selected-info {
  background-color: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 16px;
  color: #409eff;
  font-size: 14px;
}
</style>
