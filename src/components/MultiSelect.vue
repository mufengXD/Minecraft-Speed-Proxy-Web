<template>
  <div class="multi-select">
    <label v-for="item in options" :key="item.value" class="multi-select-item">
      <input type="checkbox" :value="item.value" v-model="localValue" />
      <span>{{ item.label }}</span>
    </label>
  </div>
</template>

<script>
export default {
  name: 'MultiSelect',
  props: {
    options: {
      type: Array,
      required: true
    },
    modelValue: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    localValue: {
      get() {
        return this.modelValue
      },
      set(val) {
        this.$emit('update:modelValue', val)
      }
    }
  }
}
</script>

<style scoped>
.multi-select {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: #f8f8f8;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.multi-select-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  font-size: 16px;
  color: #333;
  transition: background 0.2s;
}
.multi-select-item:hover {
  background: #e6f7ff;
}
.multi-select-item input[type="checkbox"] {
  margin-right: 8px;
  accent-color: #409eff;
}
</style>
