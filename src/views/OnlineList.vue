<template>
  <div class="grid-demo">
    <div class="grid-item">
        <p>系统启动时长:{{ "25时30分16秒" }}</p>
        <p>在线玩家数:{{ "9999" }}</p>
    </div>
    <div class="grid-item">
      <h3 style="text-align:center;">累计在线时长前十/分钟</h3>
      <div ref="barChart" style="width: 100%; height: 100%;"></div>
    </div>
    <div class="grid-item">
      <h3 style="text-align:center;">历史玩家数量</h3>
      <div ref="lineChart" style="width: 100%; height: 100%;"></div>
    </div>
    <div class="grid-item"></div>
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
      chartHeight: 220
    }
  },
  async mounted() {
    // 获取在线用户数据（示例请求，确保 401 响应会被拦截）
    try {
      const response = await axios.get('/api/online-stats');
      console.log('获取在线统计数据成功:', response.data);
    } catch (error) {
      console.error('获取在线统计数据失败:', error);
    }

    // 原始数据（可能有很多组）
    const allYData = ['玩家A', '玩家B', '玩家C', 'MuFengXD', 'AllesUgo', '玩家D', '玩家E', '玩家F', '玩家G', '玩家H', '玩家K', '玩家L'];
    const allXData = [100, 200, 300, 999, 888, 400, 250, 350, 180, 500, 600, 700];
    
    // 限制条形图数据不超过10组
    const yData = allYData.slice(0, 10);
    const xData = allXData.slice(0, 10);
    
    // 排序（从小到大）
    const sorted = xData
      .map((value, idx) => ({ value, name: yData[idx] }))
      .sort((a, b) => a.value - b.value);
    const sortedY = sorted.map(item => item.name);
    const sortedX = sorted.map(item => item.value);
    // 初始化图表
    const chart = echarts.init(this.$refs.barChart);
    chart.setOption({
      xAxis: {
        type: 'value',
        boundaryGap: [0, 0.01]
      },
      yAxis: {
        type: 'category',
        data: sortedY,
        axisLabel: {
          fontSize: 12,
          interval: 0
        }
      },
      series: [
        {
          type: 'bar',
          data: sortedX,
          barCategoryGap: '20%', // 减少条形间距
          itemStyle: {
            color: '#409eff'
          }
        }
      ]
    });

    // 初始化折线图
    // 原始日期和数据（可能有很多天）
    const allDates = ['1月1日', '1月2日', '1月3日', '1月4日', '1月5日', '1月6日', '1月7日'];
    const allPlayerData = [20, 32, 50, 34, 60, 30, 20];
    
    // 限制折线图数据不超过7天
    const dates = allDates.slice(0, 7);
    const playerData = allPlayerData.slice(0, 7);
    
    const lineChart = echarts.init(this.$refs.lineChart);
    lineChart.setOption({
      xAxis: {
        type: 'category',
        data: dates
      },
      yAxis: {
        type: 'value',
        name: '数量'
      },
      series: [
        {
          type: 'line',
          data: playerData,
          itemStyle: {
            color: '#67c23a'
          },
          lineStyle: {
            color: '#67c23a'
          }
        }
      ]
    });
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
</style>
