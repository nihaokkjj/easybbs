<script setup>
import { getCurrentInstance } from 'vue';

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

const emit = defineEmits(['update:modelValue'])
const selectorFile = async(file) => {
  file = file.file
  emit("update:modelValue", file)
}

const delFile = () => {
  emit("update:modelValue", null)
}
</script>

<template>
<div class="attachment-selector">
  <el-upload
   name="file"
   :show-file-list="false"
   accept=".zip, .rar"
   :multiple="false"
   :http-request="selectorFile"
  >
    <el-button
     type="primary"
     v-if="!modelValue">上传附件</el-button>
  </el-upload>
  <template
    v-if="modelValue">
    <div
    class="file-name"
    :title="modelValue.name">
    {{ modelValue.name }}
    </div>
    <div
    class="iconfont icon-del"
    @click="delFile"
    ></div>
  </template>
</div>
</template>

<style scoped>
.attachment-selector {
  width: 100%;
  display: flex;
  .iconfont {
    cursor: pointer;
    font-size: 19px;
    color: var(--link);
  }
  .file-name {
    white-space: nowrap;
    overflow: hidden;
    color: rgb(93, 116, 122);
    flex: 1;
  }
}
</style>