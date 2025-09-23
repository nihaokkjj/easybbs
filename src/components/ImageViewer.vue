<script setup>
import { ref } from 'vue'

const props = defineProps({
  imageList: {
    type: Array,
  },
})

const previewImageIndex = ref(null)

//关闭图片预览
const closeImgViewer = () => {
  startScroll()
  previewImageIndex.value = null
}

const show = (index) => {
  stopScroll()
  previewImageIndex.value = index
}

//禁止滚动
const stopScroll = () => {
  document.body.style.overflow = "hidden"
}
//开始滚动
const startScroll = () => {
  document.body.style.overflow = "auto"
}

defineExpose({show})
</script>

<template>
  <div class="image-view">
    <el-image-viewer
     :initial-index="previewImageIndex"
     hide-on-click-modal
     :url-list="imageList"
     @close="closeImgViewer"
     v-if="previewImageIndex != null"
     >
    
    </el-image-viewer>
  </div>
</template>

<style scoped>

.image-view {
  el-image-viewer__mask {
    opacity: 0.9;
  }
}
</style>