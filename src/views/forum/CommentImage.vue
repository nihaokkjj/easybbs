<script setup>
import { defineProps, ref } from 'vue';

const props = defineProps({
  src: {
    type: String,
  },
  imageList: {
    type: Array,
  },
})

</script>

<template>
  <el-image
  class="comment-img"
  :src="src"
  :zoom-rate="1.2"
  :preview-src-list="imglist ? imglist : [src]"
  :initial-index="0"
  loading="lazy"
  hide-on-click-modal
  >

  </el-image>
</template>

<style scoped>
.comment-img {
  width: 80px;
  height: 80px;
  background: #eee;
}
</style>