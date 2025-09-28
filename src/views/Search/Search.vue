<script setup>
import { getCurrentInstance, ref } from 'vue';
import { useRoute } from 'vue-router';

const {proxy} = getCurrentInstance()

const api = {

}

const formData = ref({})
const formDataRef = ref()

const rules = {
  keyword: [
    {required: true, message: '请输入关键字'}
  ]
}
const startSearch = ref(false)
const startSearchHandler = () => {
  startSearch.value = true
}

const search = () => {

}
</script>

<template>
  <div
  class="container-body search-body"
  :style="{width: proxy.globalInfo.bodyWidth + 'px'}"
  >
  <div class="search-panel"
  :style="{'padding-top': startSearch ? '10px' : '200px'}"
  >
    <el-form
      :model="formData"
      :rules="rules"
      ref="formDataRef"
      label-width="80px"
     >
      <!--input输入-->
      <el-form-item prop="">
        <el-input
          size="large"
          clearable
          placeholder="请输入你想要查找的关键词"
          v-model="formData.keyword"
          @keyup.enter="search"
          @focus="startSearchHandler"
         >
         <template #suffix>
          <span
           class="iconfont icon-search"
           @click="search"
           @blur="formData.keyword = $event.target.value.trim()"
           ></span>
         </template>
        </el-input>
      </el-form-item>
    </el-form>
    </div>
  </div>
</template>

<style scoped>
.search-body {
  margin-top: 60px;
  padding-top: 10px;
  .search-panel {
    min-height: calc(100vh - 165px);
    padding: 10px 0px;
    background-color: #fff;
    display: flex;
    justify-content: center;
    .el-input {
      width: 700px;
    }
  }
}
</style>