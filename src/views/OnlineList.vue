<template>
  <div class="grid-demo">
    <div class="grid-item">
        <p>系统启动时长: {{ systemStartTime }}</p>
        <p>默认代理IP:{{ "hypixel.net" }}</p>
        <p>在线玩家数: {{ onlineUsers.length }}</p>
    </div>
    <div class="grid-item">
      <h3 style="text-align:center;">累计在线时长前十/分钟</h3>
      <div ref="barChart" style="width: 100%; height: 100%; position: relative;">
        <div v-if="onlineUsers.length === 0" class="no-data" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10;">
          暂无在线玩家数据
        </div>
      </div>
    </div>
    <div class="grid-item">
      <h3 style="text-align:center;">历史玩家数量</h3>
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
      <div ref="lineChart" style="width: 100%; height: calc(100% - 60px);"></div>
    </div>
    <div class="grid-item">
      <h3 style="text-align:center;">后端日志</h3>
      <div class="log-container">
        <div v-if="logs.length === 0" class="no-data">
          暂无日志数据
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
      <div class="refresh-info">
        <p style="font-size: 14px; color: #666;">数据每15秒自动刷新</p>
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
      lineChartData: [] // 折线图数据
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
}

p {
  font-family: '微软雅黑', Arial, sans-serif;
  font-size: 18px;
  color: #2c3e50;
  font-weight: bold;
  margin: 16px 0;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #999;
  font-size: 16px;
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
</style>
