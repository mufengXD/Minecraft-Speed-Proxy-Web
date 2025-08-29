<template>
  <div class="grid-demo">
    <div class="grid-item">
      <div class="status-card">
        <div class="status-header">
          <div class="status-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h3 class="status-title">系统状态</h3>
        </div>
        <div class="status-content">
          <div class="status-item">
            <div class="status-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
              </svg>
              运行时长
            </div>
            <div class="status-value">{{ systemStartTime }}</div>
          </div>
          <div class="status-item">
            <div class="status-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              默认代理
            </div>
            <div class="status-value proxy-server">hypixel.net</div>
          </div>
          <div class="status-item">
            <div class="status-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                <path fill="currentColor" d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A3.01 3.01 0 0 0 16.78 7L15 7.8l-.72-1.93L16.78 5A5.01 5.01 0 0 1 21.5 8.5L24 16h-3v6h-1zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zm1.5 1h-3c-1.1 0-2 .9-2 2v5.5h2V22h3v-2.5h2V14c0-1.1-.9-2-2-2z"/>
              </svg>
              在线玩家
            </div>
            <div class="status-value player-count">{{ onlineUsers.length }} 人</div>
          </div>
        </div>
      </div>
    </div>
    <div class="grid-item">
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22 21H2l4-7h3l2 4h3l2-7h6v10z"/>
            </svg>
          </div>
          <h3 class="chart-title">累计在线时长前十</h3>
          <div class="chart-subtitle">单位：分钟</div>
        </div>
        <div ref="barChart" style="width: 100%; height: calc(100% - 60px); position: relative;">
          <div v-if="onlineUsers.length === 0" class="no-data">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            <span>暂无在线玩家数据</span>
          </div>
        </div>
      </div>
    </div>
    <div class="grid-item">
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
            </svg>
          </div>
          <h3 class="chart-title">历史玩家数量</h3>
          <div class="chart-subtitle">实时监控</div>
        </div>
        <div class="chart-controls">
          <button 
            v-for="option in timeRangeOptions" 
            :key="option.key"
            @click="changeTimeRange(option.key)"
            :class="['time-btn', { 'active': currentTimeRange === option.key }]"
          >
            {{ option.label }}
          </button>
        </div>
        <div ref="lineChart" style="width: 100%; height: calc(100% - 100px);"></div>
      </div>
    </div>
    <div class="grid-item">
      <div class="log-card">
        <div class="log-header">
          <div class="log-header-left">
            <div class="log-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6m4 18H6V4h7v5h5v11Z"/>
              </svg>
            </div>
            <h3 class="log-title">后端日志</h3>
            <div class="refresh-indicator" @mouseenter="showTooltip = true" @mouseleave="showTooltip = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <div v-if="showTooltip" class="custom-tooltip">数据每15秒自动刷新</div>
            </div>
          </div>
          <div class="log-subtitle clickable-area" @click="openLogModal">
            <span>点击查看详情</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24">
              <path fill="currentColor" d="M7 17L17 7m0 0H7m10 0v10"/>
            </svg>
          </div>
        </div>
        <div class="log-container">
          <div v-if="logs.length === 0" class="no-data">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            <span>暂无日志数据</span>
          </div>
          <div v-else class="log-list">
            <div 
              v-for="(log, index) in logs" 
              :key="index" 
              class="log-item"
            >
              <span class="log-time">{{ formatLogTime(log.timestamp) }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 日志弹窗 -->
  <div v-if="showLogModal" class="modal-overlay" @click="closeLogModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <div class="modal-title-section">
          <h3>后端日志</h3>
          <div class="modal-refresh-indicator" @mouseenter="showModalTooltip = true" @mouseleave="showModalTooltip = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <div v-if="showModalTooltip" class="modal-custom-tooltip">数据每15秒自动刷新</div>
          </div>
        </div>
        <button class="close-btn" @click="closeLogModal">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="log-controls">
          <div class="search-box">
            <input 
              v-model="logSearchKeyword" 
              placeholder="搜索关键字..." 
              class="search-input"
              @input="filterLogs"
            />
          </div>
          
          <div class="date-filter">
            <label>开始时间:</label>
            <input 
              type="date" 
              v-model="logStartDate" 
              @change="filterLogs"
              class="date-input"
            />
            
            <label>结束时间:</label>
            <input 
              type="date" 
              v-model="logEndDate" 
              @change="filterLogs"
              class="date-input"
            />
            
            <button @click="clearFilters" class="clear-btn">清空筛选</button>
          </div>
        </div>
        
        <div class="log-list-container">
          <div v-if="filteredLogs.length === 0" class="no-data">
            暂无匹配的日志数据
          </div>
          <div v-else class="log-list-modal">
            <div 
              v-for="(log, index) in filteredLogs" 
              :key="index" 
              class="log-item"
            >
              <span class="log-time">{{ formatLogTime(log.timestamp) }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MultiSelect from '../components/MultiSelect.vue'
import * as echarts from 'echarts';
import axios from '../utils/axios.js'

export default {
  name: 'OnlineList',
  components: { MultiSelect },
  data() {
    return {
      onlineOptions: [
        { label: '用户A', value: 'A' },
        { label: '用户B', value: 'B' }
      ],
      selected: [],
      chartHeight: 220,
      onlineUsers: [],
      systemStartTime: "获取中...",
      logs: [],
      refreshTimer: null,
      currentTimeRange: 'hour', // 当前选择的时间范围
      timeRangeOptions: [
        { key: 'hour', label: '近一小时', granularity: 'minute' },
        { key: 'day', label: '近一天', granularity: 'hour' },
        { key: 'week', label: '近一周', granularity: 'day' },
        { key: 'month', label: '近一月', granularity: 'day' }
      ],
      lineChartData: [], // 折线图数据
      
      // 日志弹窗相关数据
      showLogModal: false,
      logSearchKeyword: '',
      logStartDate: '',
      logEndDate: '',
      filteredLogs: [],
      
      // tooltip控制
      showTooltip: false,
      showModalTooltip: false
    }
  },
  
  async mounted() {
    // 获取在线用户数据
    await this.fetchOnlineUsers();
    
    // 获取系统启动时长
    await this.fetchSystemInfo();
    
    // 获取后端日志
    await this.fetchLogs();
    
    // 获取折线图数据
    await this.fetchLineChartData();
    
    // 等待DOM渲染完成后初始化图表
    this.$nextTick(() => {
      this.initCharts();
    });
    
    // 设置定时刷新（每15秒刷新一次）
    this.refreshTimer = setInterval(async () => {
      await this.fetchOnlineUsers();
      await this.fetchSystemInfo();
      await this.fetchLogs();
      await this.fetchLineChartData();
      this.updateCharts();
    }, 15000);
  },
  
  beforeUnmount() {
    // 清除定时器
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  },
  methods: {
    async fetchOnlineUsers() {
      try {
        const response = await axios.get('/api/get_online_users');
        if (response.data.status === 200) {
          this.onlineUsers = response.data.online_users;
          console.log('获取在线用户成功:', response.data);
        } else {
          console.error('获取在线用户失败:', response.data.message);
          this.onlineUsers = [];
        }
      } catch (error) {
        console.error('获取在线用户失败:', error);
        this.onlineUsers = [];
      }
    },
    
    async fetchSystemInfo() {
      try {
        const response = await axios.get('/api/get_start_time');
        if (response.data.status === 200) {
          const startTime = response.data.start_time;
          const nowTime = response.data.now_time;
          const uptimeSeconds = nowTime - startTime;
          
          console.log('获取系统时间成功:', {
            startTime,
            nowTime,
            uptimeSeconds,
            formatted: this.formatUptime(uptimeSeconds)
          });
          
          this.systemStartTime = this.formatUptime(uptimeSeconds);
        } else {
          console.error('获取系统时间失败:', response.data.message);
          this.systemStartTime = "未知";
        }
      } catch (error) {
        console.error('获取系统信息失败:', error);
        this.systemStartTime = "获取失败";
      }
    },
    
    async fetchLogs() {
      try {
        const response = await axios.get('/api/get_logs');
        if (response.data.status === 200) {
          // 接收到的日志数组反序显示但不重新排序
          this.logs = response.data.logs;
          console.log('获取后端日志成功:', response.data);
        } else {
          console.error('获取后端日志失败:', response.data.message);
          this.logs = [];
        }
      } catch (error) {
        console.error('获取后端日志失败:', error);
        this.logs = [];
      }
    },
    
    async fetchLineChartData() {
      try {
        const timeRange = this.timeRangeOptions.find(option => option.key === this.currentTimeRange);
        const now = Math.floor(Date.now() / 1000);
        let startTime, endTime;
        
        // 根据选择的时间范围计算起始和结束时间
        switch (this.currentTimeRange) {
          case 'hour':
            startTime = now - 3600; // 1小时前
            endTime = now;
            break;
          case 'day':
            startTime = now - 24 * 3600; // 1天前
            endTime = now;
            break;
          case 'week':
            startTime = now - 7 * 24 * 3600; // 1周前
            endTime = now;
            break;
          case 'month':
            startTime = now - 30 * 24 * 3600; // 1个月前（按30天计算）
            endTime = now;
            break;
          default:
            startTime = now - 3600;
            endTime = now;
        }
        
        const response = await axios.post('/api/get_online_number_list', {
          start_time: startTime,
          end_time: endTime,
          granularity: timeRange.granularity
        });
        
        if (response.data && response.data.status === 200) {
          this.lineChartData = response.data.user_numbers || [];
          console.log('获取折线图数据成功:', {
            timeRange: this.currentTimeRange,
            granularity: timeRange.granularity,
            dataLength: this.lineChartData.length,
            data: this.lineChartData
          });
        } else {
          console.error('获取折线图数据失败:', response.data?.message);
          this.lineChartData = [];
        }
      } catch (error) {
        console.error('获取折线图数据失败:', error);
        this.lineChartData = [];
      }
    },
    
    formatTimestamp(timestamp, granularity) {
      const date = new Date(timestamp * 1000);
      
      switch (granularity) {
        case 'minute':
          return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
        case 'hour':
          return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`;
        case 'day':
          return `${date.getMonth() + 1}/${date.getDate()}`;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          return `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
        case 'month':
          return `${date.getFullYear()}/${date.getMonth() + 1}`;
        default:
          return `${date.getMonth() + 1}/${date.getDate()}`;
      }
    },
    
    async changeTimeRange(timeRange) {
      if (this.currentTimeRange !== timeRange) {
        this.currentTimeRange = timeRange;
        await this.fetchLineChartData();
        this.updateLineChart();
      }
    },
    
    formatLogTime(timestamp) {
      if (!timestamp) return '未知时间';
      
      try {
        // 将后端时间戳转换为本地时间显示
        const date = new Date(timestamp * 1000);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      } catch (error) {
        console.error('时间格式化失败:', error);
        return '时间格式错误';
      }
    },
    
    formatUptime(seconds) {
      if (!seconds || isNaN(seconds) || seconds < 0) {
        return "未知";
      }
      
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      
      if (days > 0) {
        return `${days}天${hours}小时${minutes}分钟`;
      } else if (hours > 0) {
        return `${hours}小时${minutes}分钟`;
      } else {
        return `${minutes}分钟`;
      }
    },
    
    calculateOnlineTime(timestamp) {
      const now = Math.floor(Date.now() / 1000);
      const diff = now - timestamp;
      return Math.floor(diff / 60); // 返回分钟数
    },
    
    initCharts() {
      // 检查DOM元素是否存在
      if (!this.$refs.barChart || !this.$refs.lineChart) {
        console.error('图表DOM元素不存在，无法初始化');
        return;
      }
      
      // 处理在线时长数据，取前十名
      const onlineTimeData = this.onlineUsers
        .map(user => ({
          name: user.username,
          value: this.calculateOnlineTime(user.online_time_stamp)
        }))
        .sort((a, b) => b.value - a.value) // 从大到小排序
        .slice(0, 10) // 取前10名
        .reverse(); // 反转为从小到大，用于横向条形图显示
      
      const yData = onlineTimeData.map(item => item.name);
      const xData = onlineTimeData.map(item => item.value);
      
      // 初始化条形图
      const chart = echarts.init(this.$refs.barChart);
      chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function(params) {
            return `${params[0].name}: ${params[0].value}分钟`;
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          boundaryGap: [0, 0.01],
          name: '',               //条形图下标题，暂时预留为空位
          nameLocation: 'middle',
          nameGap: 25
        },
        yAxis: {
          type: 'category',
          data: yData,
          axisLabel: {
            fontSize: 12,
            interval: 0
          }
        },
        series: [
          {
            type: 'bar',
            data: xData,
            barCategoryGap: '20%',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#409eff' },
                { offset: 1, color: '#67c23a' }
              ])
            },
            barWidth: '60%'
          }
        ]
      });

      // 初始化折线图（无论是否有数据都要初始化）
      const timeRange = this.timeRangeOptions.find(option => option.key === this.currentTimeRange);
      const dates = this.lineChartData.map(item => this.formatTimestamp(item.timestamp, timeRange.granularity));
      const playerData = this.lineChartData.map(item => item.online_users);
      
      // 如果没有数据，显示空图表
      if (this.lineChartData.length === 0) {
        console.log('折线图数据为空，显示空图表');
      }
      
      const lineChart = echarts.init(this.$refs.lineChart);
      lineChart.setOption({
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            if (params && params.length > 0) {
              return `${params[0].name}<br/>在线玩家: ${params[0].value}人`;
            }
            return '';
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: dates,
          name: '',
          nameLocation: 'middle',
          nameGap: 25
        },
        yAxis: {
          type: 'value',
          name: '',
          nameLocation: 'middle',
          nameGap: 40
        },
        series: [
          {
            type: 'line',
            data: playerData,
            itemStyle: {
              color: '#67c23a'
            },
            lineStyle: {
              color: '#67c23a',
              width: 2
            },
            symbol: 'circle',
            symbolSize: 6,
            smooth: true
          }
        ]
      });
    },
    
    updateCharts() {
      // 更新条形图数据
      const onlineTimeData = this.onlineUsers
        .map(user => ({
          name: user.username,
          value: this.calculateOnlineTime(user.online_time_stamp)
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)
        .reverse();
      
      const yData = onlineTimeData.map(item => item.name);
      const xData = onlineTimeData.map(item => item.value);
      
      // 获取条形图实例并更新
      const chart = echarts.getInstanceByDom(this.$refs.barChart);
      if (chart) {
        chart.setOption({
          yAxis: {
            data: yData
          },
          series: [{
            data: xData
          }]
        });
      }
      
      // 更新折线图
      this.updateLineChart();
    },
    
    updateLineChart() {
      const timeRange = this.timeRangeOptions.find(option => option.key === this.currentTimeRange);
      const dates = this.lineChartData.map(item => this.formatTimestamp(item.timestamp, timeRange.granularity));
      const playerData = this.lineChartData.map(item => item.online_users);
      
      console.log('更新折线图，数据长度:', this.lineChartData.length, '日期:', dates, '数据:', playerData);
      
      const lineChart = echarts.getInstanceByDom(this.$refs.lineChart);
      if (lineChart) {
        lineChart.setOption({
          xAxis: {
            data: dates
          },
          series: [{
            data: playerData
          }]
        });
      } else {
        console.error('折线图实例不存在，重新初始化');
        // 如果图表实例不存在，重新初始化
        this.initLineChart();
      }
    },
    
    initLineChart() {
      // 检查DOM元素是否存在
      if (!this.$refs.lineChart) {
        console.error('折线图DOM元素不存在，无法初始化');
        return;
      }
      
      const timeRange = this.timeRangeOptions.find(option => option.key === this.currentTimeRange);
      const dates = this.lineChartData.map(item => this.formatTimestamp(item.timestamp, timeRange.granularity));
      const playerData = this.lineChartData.map(item => item.online_users);
      
      console.log('重新初始化折线图，数据长度:', this.lineChartData.length);
      
      const lineChart = echarts.init(this.$refs.lineChart);
      lineChart.setOption({
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            if (params && params.length > 0) {
              return `${params[0].name}<br/>在线玩家: ${params[0].value}人`;
            }
            return '';
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: dates,
          name: '',
          nameLocation: 'middle',
          nameGap: 25
        },
        yAxis: {
          type: 'value',
          name: '',
          nameLocation: 'middle',
          nameGap: 40
        },
        series: [
          {
            type: 'line',
            data: playerData,
            itemStyle: {
              color: '#67c23a'
            },
            lineStyle: {
              color: '#67c23a',
              width: 2
            },
            symbol: 'circle',
            symbolSize: 6,
            smooth: true
          }
        ]
      });
    },
    
    async refreshData() {
      await this.fetchOnlineUsers();
      await this.fetchSystemInfo();
      await this.fetchLogs();
      await this.fetchLineChartData();
      this.updateCharts();
    },
    
    // 打开日志弹窗
    openLogModal() {
      this.showLogModal = true;
      this.filteredLogs = [...this.logs];
      this.initializeDateFilters();
    },
    
    // 关闭日志弹窗
    closeLogModal() {
      this.showLogModal = false;
      this.logSearchKeyword = '';
      this.logStartDate = '';
      this.logEndDate = '';
      this.filteredLogs = [];
    },
    
    // 初始化日期筛选器
    initializeDateFilters() {
      if (this.logs.length > 0) {
        // 设置默认日期范围为所有日志的时间范围
        const timestamps = this.logs.map(log => log.timestamp);
        const minTimestamp = Math.min(...timestamps);
        const maxTimestamp = Math.max(...timestamps);
        
        this.logStartDate = this.formatDateForInput(minTimestamp);
        this.logEndDate = this.formatDateForInput(maxTimestamp);
        this.filterLogs();
      }
    },
    
    // 格式化日期用于input元素
    formatDateForInput(timestamp) {
      const date = new Date(timestamp * 1000);
      return date.toISOString().split('T')[0];
    },
    
    // 筛选日志
    filterLogs() {
      let result = [...this.logs];
      
      // 关键字筛选
      if (this.logSearchKeyword) {
        const keyword = this.logSearchKeyword.toLowerCase();
        result = result.filter(log => 
          log.message.toLowerCase().includes(keyword)
        );
      }
      
      // 日期筛选
      if (this.logStartDate || this.logEndDate) {
        const startDate = this.logStartDate ? new Date(this.logStartDate).getTime() / 1000 : 0;
        const endDate = this.logEndDate ? new Date(this.logEndDate).getTime() / 1000 + 86399 : Infinity; // 加86399秒表示当天结束
        
        result = result.filter(log => {
          return log.timestamp >= startDate && log.timestamp <= endDate;
        });
      }
      
      this.filteredLogs = result;
    },
    
    // 清空筛选条件
    clearFilters() {
      this.logSearchKeyword = '';
      this.logStartDate = '';
      this.logEndDate = '';
      this.filteredLogs = [...this.logs];
    }
  }
}
</script>

<style scoped>
.grid-demo {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 40px;
  width: 80vw;
  min-height: 80vh;
  margin: 40px auto;
}
.grid-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
}
.grid-item:nth-child(1) {
  width: 400px;
  height: 350px;
}
.grid-item:nth-child(2) {
  width: 850px;
  height: 350px;
}
.grid-item:nth-child(3) {
  width: 700px;
  height: 350px;
}
.grid-item:nth-child(4) {
  width: 550px;
  height: 350px;
  cursor: default;
}

p {
  font-family: '微软雅黑', Arial, sans-serif;
  font-size: 18px;
  color: #2c3e50;
  font-weight: bold;
  margin: 16px 0;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 状态卡片样式 */
.status-card {
  width: 100%;
  height: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.status-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(64, 158, 255, 0.2);
}

.status-icon {
  margin-right: 8px;
  color: #409eff;
  display: flex;
  align-items: center;
}

.status-icon svg {
  width: 24px;
  height: 24px;
}

.status-title {
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  letter-spacing: 0.5px;
}

.status-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}

.status-item {
  display: flex;
  flex-direction: column;
  padding: 12px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  border-left: 3px solid #409eff;
  transition: all 0.3s ease;
  min-height: 0;
  flex: 1;
}

.status-item:hover {
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.status-label {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 6px;
  font-weight: 500;
}

.status-label svg {
  margin-right: 6px;
  color: #409eff;
  width: 14px;
  height: 14px;
}

.status-value {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  word-break: break-all;
}

.proxy-server {
  color: #28a745;
  font-family: 'Courier New', monospace;
}

.player-count {
  color: #17a2b8;
}

/* 图表卡片样式 */
.chart-card {
  width: 100%;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(64, 158, 255, 0.2);
}

.chart-icon {
  margin-right: 12px;
  color: #409eff;
  display: flex;
  align-items: center;
}

.chart-title {
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  margin-right: 12px;
}

.chart-subtitle {
  font-size: 12px;
  color: #6c757d;
  background: #e9ecef;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

/* 日志卡片样式 */
.log-card {
  width: 100%;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.3s ease;
}

.log-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(64, 158, 255, 0.15);
}

.log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(64, 158, 255, 0.2);
  position: relative;
}

.log-header-left {
  display: flex;
  align-items: center;
}

.log-icon {
  margin-right: 12px;
  color: #409eff;
  display: flex;
  align-items: center;
}

.log-title {
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  margin-right: 8px;
}

.refresh-indicator {
  margin-right: 12px;
  color: #28a745;
  display: flex;
  align-items: center;
  cursor: default;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  position: relative;
}

.refresh-indicator:hover {
  opacity: 1;
}

.custom-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
  animation: tooltipFadeIn 0.15s ease-out;
}

.custom-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.8);
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.log-subtitle {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

.clickable-area {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 12px;
  transition: all 0.2s;
  background: #e9ecef;
  color: #6c757d;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  width: fit-content;
}

.clickable-area span {
  line-height: 1;
}

.clickable-area:hover {
  background: #409eff;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.clickable-area svg {
  vertical-align: middle;
  transition: transform 0.2s;
}

.clickable-area:hover svg {
  transform: translateX(2px);
}

.auto-refresh-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #28a745;
  background: rgba(40, 167, 69, 0.1);
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 500;
  border: 1px solid rgba(40, 167, 69, 0.2);
}

.no-data {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #999;
  font-size: 16px;
  gap: 12px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.no-data svg {
  opacity: 0.5;
}

.no-data span {
  font-weight: 500;
}

.refresh-info {
  text-align: center;
}

.log-container {
  flex: 1;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.log-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  max-height: 250px;
  scrollbar-width: none; /* Firefox */
}
.log-list::-webkit-scrollbar {
  display: none; /* Chrome/Safari/Edge */
}

.log-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
  padding: 6px 8px;
  background: #f9f9f9;
  border-radius: 4px;
  border-left: 3px solid #409eff;
}

.log-time {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
}

.log-message {
  font-size: 14px;
  color: #333;
  word-wrap: break-word;
}

.refresh-btn {
  padding: 8px 16px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;
  transition: background-color 0.3s;
}

.refresh-btn:hover {
  background-color: #66b1ff;
}

.chart-controls {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 10px;
  padding: 0 10px;
}

.time-btn {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  background: white;
  color: #606266;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.time-btn:hover {
  color: #409eff;
  border-color: #c6e2ff;
}

.time-btn.active {
  background-color: #409eff;
  color: white;
  border-color: #409eff;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 80%;
  max-width: 900px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #eee;
}

.modal-title-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-title-section h3 {
  margin: 0;
  color: #333;
}

.modal-refresh-indicator {
  color: #666;
  cursor: default;
  position: relative;
}

.modal-refresh-indicator svg {
  vertical-align: middle;
}

.modal-custom-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
  animation: tooltipFadeIn 0.15s ease-out;
}

.modal-custom-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.8);
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.log-controls {
  margin-bottom: 20px;
}

.search-box {
  margin-bottom: 15px;
}

.search-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.date-filter {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.date-filter label {
  font-size: 14px;
  color: #333;
}

.date-input {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.clear-btn {
  padding: 6px 12px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.clear-btn:hover {
  background-color: #e0e0e0;
}

.log-list-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.log-list-modal {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.log-list-modal .log-item {
  margin-bottom: 10px;
  padding: 8px 12px;
  background: #f9f9f9;
  border-radius: 4px;
  border-left: 3px solid #409eff;
}

.log-list-modal .log-time {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.log-list-modal .log-message {
  font-size: 14px;
  color: #333;
  word-wrap: break-word;
}

@media (max-width: 768px) {
  .date-filter {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .modal-content {
    width: 95%;
  }
}
</style>
