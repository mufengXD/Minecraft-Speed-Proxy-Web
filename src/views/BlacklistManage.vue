<template>
  <div class="blacklist-management">
    <div class="header">
      <h2>黑名单管理</h2>
      <div class="actions">
        <button class="action-btn" @click="goBack">返回用户管理</button>
        <button class="action-btn add-btn" @click="handleAdd">添加黑名单</button>
        <button class="action-btn remove-btn" @click="handleBatchRemove" :disabled="selectedUsers.length === 0">批量移出</button>
      </div>
    </div>
    
    <div class="table-container">
      <table class="user-table">
        <thead>
          <tr>
            <th>
              <input type="checkbox" @change="toggleSelectAll" :checked="isAllSelected">
            </th>
            <th>用户名</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="username in paginatedUsers" :key="username" class="user-row">
            <td>
              <input 
                type="checkbox" 
                :value="username" 
                v-model="selectedUsers"
                @change="updateSelectAll"
              >
            </td>
            <td>{{ username }}</td>
            <td class="actions-cell">
              <button class="btn btn-remove" @click="removeFromBlacklist(username)">移出黑名单</button>
            </td>
          </tr>
          <tr v-if="blackList.length === 0">
            <td colspan="3" class="empty-message">暂无黑名单用户</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页控件 -->
    <div class="pagination" v-if="totalPages > 1">
      <button 
        class="page-btn" 
        @click="goToPage(1)" 
        :disabled="currentPage === 1"
        title="首页"
      >
        首页
      </button>
      <button 
        class="page-btn" 
        @click="goToPage(currentPage - 1)" 
        :disabled="currentPage === 1"
        title="上一页"
      >
        上一页
      </button>
      
      <span class="page-info">
        第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
      </span>
      
      <button 
        class="page-btn" 
        @click="goToPage(currentPage + 1)" 
        :disabled="currentPage === totalPages"
        title="下一页"
      >
        下一页
      </button>
      <button 
        class="page-btn" 
        @click="goToPage(totalPages)" 
        :disabled="currentPage === totalPages"
        title="末页"
      >
        末页
      </button>
      
      <select class="page-size-select" v-model="pageSize" @change="changePageSize">
        <option value="10">10条/页</option>
        <option value="20">20条/页</option>
        <option value="50">50条/页</option>
        <option value="100">100条/页</option>
      </select>
    </div>

    <!-- 添加黑名单弹窗 -->
    <div v-if="showAddDialog" class="dialog-overlay" @click="closeDialog">
      <div class="dialog" @click.stop>
        <h3>添加黑名单</h3>
        <input 
          type="text" 
          v-model="newUsername" 
          placeholder="请输入用户名"
          @keyup.enter="confirmAdd"
          class="input-field"
        >
        <div class="dialog-actions">
          <button class="btn btn-cancel" @click="closeDialog">取消</button>
          <button class="btn btn-confirm" @click="confirmAdd">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '../utils/axios.js'

export default {
  name: 'BlacklistManage',
  data() {
    return {
      blackList: [],
      selectedUsers: [],
      showAddDialog: false,
      newUsername: '',
      currentPage: 1,
      pageSize: 20,
      loading: false
    }
  },
  computed: {
    isAllSelected() {
      return this.paginatedUsers.length > 0 && this.selectedUsers.length === this.paginatedUsers.length
    },
    totalPages() {
      return Math.ceil(this.blackList.length / this.pageSize)
    },
    paginatedUsers() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.blackList.slice(start, end)
    }
  },
  mounted() {
    this.fetchBlacklist()
  },
  methods: {
    async fetchBlacklist() {
      try {
        this.loading = true
        console.log('开始获取黑名单数据...')
        const response = await axios.get('/api/get_blacklist')
        console.log('黑名单API响应:', response.data)
        
        if (response.data && response.data.status === 200) {
          // 根据实际API响应格式，使用 black_list 字段
          if (Array.isArray(response.data.black_list)) {
            this.blackList = response.data.black_list
          } else {
            this.blackList = []
            console.warn('black_list 不是数组:', response.data.black_list)
          }
        } else {
          this.blackList = []
          console.warn('API响应状态异常:', response.data)
        }
        
        console.log('处理后的黑名单数据:', this.blackList)
      } catch (error) {
        console.error('获取黑名单失败:', error)
        this.blackList = []
      } finally {
        this.loading = false
      }
    },
    
    toggleSelectAll() {
      if (this.isAllSelected) {
        this.selectedUsers = []
      } else {
        this.selectedUsers = [...this.paginatedUsers]
      }
    },
    
    updateSelectAll() {
      // 更新全选状态，无需额外操作
    },
    
    goBack() {
      this.$router.push('/user_management')
    },
    
    handleAdd() {
      this.showAddDialog = true
      this.newUsername = ''
    },
    
    closeDialog() {
      this.showAddDialog = false
      this.newUsername = ''
    },
    
    async confirmAdd() {
      if (!this.newUsername.trim()) {
        alert('请输入用户名')
        return
      }
      
      try {
        await axios.post('/api/add_blacklist', {
          username: this.newUsername.trim()
        })
        
        this.closeDialog()
        this.fetchBlacklist()
        alert('添加成功')
      } catch (error) {
        console.error('添加黑名单失败:', error)
        alert('添加失败：' + (error.response?.data?.message || error.message))
      }
    },
    
    async removeFromBlacklist(username) {
      if (!confirm(`确定要将 ${username} 移出黑名单吗？`)) {
        return
      }
      
      try {
        await axios.post('/api/remove_blacklist', {
          username: username
        })
        
        this.fetchBlacklist()
        this.selectedUsers = this.selectedUsers.filter(u => u !== username)
        alert('移出成功')
      } catch (error) {
        console.error('移出黑名单失败:', error)
        alert('移出失败：' + (error.response?.data?.message || error.message))
      }
    },
    
    async handleBatchRemove() {
      if (this.selectedUsers.length === 0) {
        alert('请选择要移出的用户')
        return
      }
      
      if (!confirm(`确定要批量移出 ${this.selectedUsers.length} 个用户吗？`)) {
        return
      }
      
      try {
        await axios.post('/api/batch_remove_blacklist', {
          usernames: this.selectedUsers
        })
        
        this.fetchBlacklist()
        this.selectedUsers = []
        alert('批量移出成功')
      } catch (error) {
        console.error('批量移出黑名单失败:', error)
        alert('批量移出失败：' + (error.response?.data?.message || error.message))
      }
    },
    
    // 分页相关方法
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        this.selectedUsers = [] // 切换页面时清空选择
      }
    },
    
    changePageSize() {
      this.currentPage = 1 // 重置到第一页
      this.selectedUsers = [] // 清空选择
    }
  }
}
</script>

<style scoped>
.blacklist-management {
  padding: 20px;
  background: #f5f5f5;
  min-height: calc(100vh - 60px);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
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
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.add-btn {
  background: #28a745;
  color: white;
}

.add-btn:hover:not(:disabled) {
  background: #218838;
}

.remove-btn {
  background: #dc3545;
  color: white;
}

.remove-btn:hover:not(:disabled) {
  background: #c82333;
}

.table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
  border-bottom: 1px solid #eee;
}

.user-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.user-row:hover {
  background: #f8f9fa;
}

.actions-cell {
  width: 120px;
}

.btn {
  padding: 4px 8px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 5px;
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn-remove {
  background: #dc3545;
  color: white;
}

.btn-remove:hover {
  background: #c82333;
}

.empty-message {
  text-align: center;
  color: #666;
  font-style: italic;
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  padding: 15px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.page-btn {
  padding: 6px 10px;
  border: 1px solid #ddd;
  background: white;
  color: #333;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
  min-width: 60px;
}

.page-btn:hover:not(:disabled) {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  margin: 0 8px;
  color: #666;
  font-size: 13px;
  white-space: nowrap;
}

.page-size-select {
  padding: 5px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 12px;
  margin-left: 8px;
}

/* 弹窗样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog {
  background: white;
  padding: 20px;
  border-radius: 8px;
  min-width: 300px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.dialog h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.input-field {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 15px;
  font-size: 14px;
}

.input-field:focus {
  outline: none;
  border-color: #007bff;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

.btn-cancel:hover {
  background: #5a6268;
}

.btn-confirm {
  background: #28a745;
  color: white;
}

.btn-confirm:hover {
  background: #218838;
}
</style>
