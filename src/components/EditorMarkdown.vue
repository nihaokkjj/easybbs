<script setup>
import {  ref, getCurrentInstance, onMounted } from 'vue';
import VMdEditor from '@kangc/v-md-editor';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';

// highlightjs
import hljs from 'highlight.js';

const {proxy} = getCurrentInstance()
const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  height: {
    type: Number,
    default: 500,
  },
})

VMdEditor.use(githubTheme, {
  Hljs: hljs,
});

const emit = defineEmits(["update:modelValue", "htmlContent"])
const change = (markdownContent, htmlContent) => {
  emit("update:modelValue", markdownContent)
  emit("htmlContent", htmlContent)
}

const uploadImageHandler = async (event, insertImage, files) => {
  let result = await proxy.Request({
    url: "file/uploadImage",
    params: {
      file: files[0],
    }
  })
  if (!result) {
    return
  }
  const url = proxy.globalInfo.imageUrl + result.data.fileName

  insertImage({
    url: url,
    desc: "图片",
  })
}


</script>

<template>
  <v-md-editor
   :model-value="modelValue"
   :height="height + 'px'"
   :include-level="[1, 2, 3, 4, 5, 6]"
   @upload-image="uploadImageHandler"
   @change="change"
   :disabled-menus="[]"
   ></v-md-editor>
</template>

<style scoped>

</style>