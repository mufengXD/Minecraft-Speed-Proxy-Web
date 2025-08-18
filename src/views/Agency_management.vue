<template>
  <div>
    <h2>代理管理</h2>
  </div>
</template>

<script>
import MultiSelect from '../components/MultiSelect.vue'
import axios from '../utils/axios.js'

export default {
  name: 'ProxyManage',
  components: { MultiSelect },
  data() {
    return {
      proxyOptions: [
        { label: '代理A', value: 'P1' },
        { label: '代理B', value: 'P2' },
        { label: '代理C', value: 'P3' }
      ],
      selected: []
    }
  },
  async mounted() {
    // 获取代理管理数据（示例请求，确保 401 响应会被拦截）
    try {
      const response = await axios.get('/api/blacklist');
      console.log('获取代理管理数据成功:', response.data);
    } catch (error) {
      console.error('获取代理管理数据失败:', error);
    }
  }
}
</script>
