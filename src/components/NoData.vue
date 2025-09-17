<script setup>

const props = defineProps({
  msg: {
    type: String,
  }
})
</script>

<template>
  <div class="no-data">
    <div class="iconfont icon-empty"></div>
    <div class="msg">{{ msg }}</div>
  </div>
</template>

<style scoped>
.no-data {
  text-align: center;
  padding: 20px;
  .icon-empty {
    font-size: 50px;
    color: #bbb;
  }
  .msg {
    margin-top: 10px;
    color: #909399;
    font-size: 15px;
  }
}
</style>