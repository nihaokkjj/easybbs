<script setup>
import { ref, getCurrentInstance } from 'vue';

const {proxy} = getCurrentInstance()

const props = defineProps({
  modelValue: {
    type: Object,
    default: null
  },
  imageUrlPrefix: {
    type: String,
  }
})

const localPreview = ref(false)
const localFile = ref(null)

const emit = defineEmits(['update:modelValue'])
const uploadImage = async(file) => {
  file = file.file
  let img = new FileReader()
  img.readAsDataURL(file)
  img.onload = ({target}) => {
    localFile.value = target.result
  }
  localPreview.value = true
  emit("update:modelValue", file)
}
</script>

<template>
<div class="cover-upload">
  <el-upload
   name="file"
   :show-file-list="false"
   accept=".png,.PNG,.jpg,.JPG,.jpeg,.JPEG,.gif,.GIF,.bmp,.BMP"
   :multiple="false"
   :http-request="uploadImage"
  >
    <div class="cover-upload-btn">
      <template v-if="localFile">
        <img :src="localFile">
      </template>
      <template v-else>
        <img
         :src="(imageUrlPrefix ? imageUrlPrefix : proxy.globalInfo.imageUrl)
          + modelValue.imageUrl"
         v-if="modelValue && modelValue.imageUrl"
          >
        <span v-else class="iconfont icon-add"></span>
      </template>
    </div>
  </el-upload>
</div>
</template>

<style scoped>
.cover-upload {
  .cover-upload-btn {
    background: #dddddd3d;
    width: 150px;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    img {
      max-width: 100%;
      height: auto;
    }
    .iconfont {
      font-size: 50px;
      color: #ddd;
    }
  }
}
</style>