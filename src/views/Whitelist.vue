<template>
  <div>
    <h2>白名单</h2>
    <!-- <MultiSelect v-model="selected" :options="whitelistOptions" />
    <p>已选：{{ selected }}</p> -->
  </div>
</template>

<script>
import MultiSelect from '../components/MultiSelect.vue'
import axios from '../utils/axios.js'

export default {
  name: 'Whitelist',
  components: { MultiSelect },
  data() {
    return {
      whitelistOptions: [
        { label: '白名单1', value: 'W1' },
        { label: '白名单2', value: 'W2' },
        { label: '白名单3', value: 'W3' }
      ],
      selected: []
    }
  },
  async mounted() {
    // 获取白名单数据（示例请求，确保 401 响应会被拦截）
    try {
      const response = await axios.get('/api/whitelist');
      console.log('获取白名单数据成功:', response.data);
    } catch (error) {
      console.error('获取白名单数据失败:', error);
    }
  }
}
</script>
