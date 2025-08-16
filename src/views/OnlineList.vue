<template>
  <div class="grid-demo">
    <div class="grid-item">
        <p>系统启动时长: {{ systemStartTime }}</p>
        <p>在线玩家数: {{ onlineUsers.length }}</p>
    </div>
    <div class="grid-item">
      <h3 style="text-align:center;">累计在线时长前十/分钟</h3>
      <div v-if="onlineUsers.length === 0" class="no-data">
        暂无在线玩家数据
      </div>
      <div v-else ref="barChart" style="width: 100%; height: 100%;"></div>
    </div>
    <div class="grid-item">
      <h3 style="text-align:center;">历史玩家数量</h3>
      <div ref="lineChart" style="width: 100%; height: 100%;"></div>
    </div>
    <div class="grid-item">
      <div class="refresh-info">
        <p style="font-size: 14px; color: #666;">数据每30秒自动刷新</p>
        <button @click="refreshData" class="refresh-btn">立即刷新</button>
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
      refreshTimer: null
    }
  },
  async mounted() {
    // 获取在线用户数据
    await this.fetchOnlineUsers();
    
    // 获取系统启动时长
    await this.fetchSystemInfo();
    
    // 初始化图表
    this.initCharts();
    
    // 设置定时刷新（每30秒刷新一次）
    this.refreshTimer = setInterval(async () => {
      await this.fetchOnlineUsers();
      await this.fetchSystemInfo();
      this.updateCharts();
    }, 30000);
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
        const response = await axios.get('/api/get_system_info');
        if (response.data.status === 200) {
          this.systemStartTime = this.formatUptime(response.data.uptime);
        } else {
          this.systemStartTime = "未知";
        }
      } catch (error) {
        console.error('获取系统信息失败:', error);
        this.systemStartTime = "获取失败";
      }
    },
    
    formatUptime(seconds) {
      if (!seconds || isNaN(seconds)) {
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

      // 初始化折线图（保持原有的测试数据）
      const allDates = ['1月1日', '1月2日', '1月3日', '1月4日', '1月5日', '1月6日', '1月7日'];
      const allPlayerData = [20, 32, 50, 34, 60, 30, 20];
      
      const dates = allDates.slice(0, 7);
      const playerData = allPlayerData.slice(0, 7);
      
      const lineChart = echarts.init(this.$refs.lineChart);
      lineChart.setOption({
        tooltip: {
          trigger: 'axis'
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
          name: '日期',
          nameLocation: 'middle',
          nameGap: 25
        },
        yAxis: {
          type: 'value',
          name: '玩家数量',
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
    },
    
    async refreshData() {
      await this.fetchOnlineUsers();
      await this.fetchSystemInfo();
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
  background: rgb(248, 248, 248);
  box-shadow: 0px 0px 10px 2px rgba(49, 49, 49, 0.1);
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
  color: #333;
  font-weight: bold;
  margin: 16px 0;
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
</style>
