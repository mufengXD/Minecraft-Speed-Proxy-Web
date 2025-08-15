<template>
  <div>
    <h2>黑名单</h2>
    <!-- <MultiSelect v-model="selected" :options="blacklistOptions" />
    <p>已选：{{ selected }}</p> -->
  </div>
</template>

<script>
import MultiSelect from '../components/MultiSelect.vue'
import axios from '../utils/axios.js'

export default {
  name: 'Blacklist',
  components: { MultiSelect },
  data() {
    return {
      blacklistOptions: [
        { label: '黑名单A', value: 'B1' },
        { label: '黑名单B', value: 'B2' },
        { label: '黑名单C', value: 'B3' }
      ],
      selected: []
    }
  },
  async mounted() {
    // 获取黑名单数据（示例请求，确保 401 响应会被拦截）
    try {
      const response = await axios.get('/api/blacklist');
      console.log('获取黑名单数据成功:', response.data);
    } catch (error) {
      console.error('获取黑名单数据失败:', error);
    }
  }
}
</script>
