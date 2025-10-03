<script setup>
import { getCurrentInstance, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import ArticleItem from '../forum/ArticleItem.vue';

const {proxy} = getCurrentInstance()

const api = {
  search: '/forum/search'
}

const searchPanelHeight = (window.innerHeight - 400) / 2

const formData = ref({})
const formDataRef = ref()

const rules = {
  keyword: [
    {required: true, message: '请输入关键字'},
    {min: 3, mesage: '关键字太少, 最少三个字'}
  ]
}
const startSearch = ref(false)
const startSearchHandler = () => {
  startSearch.value = true
}

const endSearchHandler = () => {
  startSearch.value = false
}
watch(
  ()=>startSearch.value,
  (newv) => {
    console.log(newv)
  }
)

const loading = ref(false)
const articleInfo = ref({})
const articleListInfo = ref({})

const search = async () => {

    loading.value = true//正在加载
    let params = {
        pageNo: articleListInfo.value.pageNo,
        keyword: formData.value.keyword
    }
   let result = await proxy.Request({
       url: api.search,
       params: params,
       showLoading: false
    })

    if(!result){
      return;
    }

    let list = result.data.list
    list.forEach((element) => {
      element.title = element.title.replace(
        params.keyword,
        "<span style='color:red'>" + params.keyword + "</sapn>"
      )
    })
    result.data.list = list
    articleListInfo.value = result.data
    loading.value = false //加载完成
    startSearchHandler()
}

</script>

<template>
  <div
  class="container-body search-body"
  :style="{width: proxy.globalInfo.bodyWidth + 'px'}"
  >
  <div class="search-panel"
  :style="{'padding-top': startSearch ? '10px' : searchPanelHeight + 'px'}"
  >
    <el-form
      :model="formData"
      :rules="rules"
      ref="formDataRef"
      label-width="80px"
      @submit.prevent
      @keyup.enter="search"
     >
      <!--input输入-->
      <el-form-item prop="keyword">
        <el-input
          size="large"
          clearable
          placeholder="请输入你想要查找的关键词"
          v-model="formData.keyword"
          @blur="endSearchHandler"
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
    <div class="article-list">
        <DataList 
        :dataSource="articleListInfo"
        :loading="loading"
        @loadData="search"
        noDataMsg="没有发现帖子, 赶紧来发布一个吧"
        >
          <template #default="{data}">
            <ArticleItem
              :data="data"
              :showHtml="true"
              ></ArticleItem>
          </template>
        </DataList>
    </div>
  </div>
</template>

<style scoped>
.search-body {
  margin-top: 60px;
  padding-top: 10px;
  background-color: #fff;
  min-height: calc(100vh - 180px);
  .search-panel {
    padding: 10px 0px;
    display: flex;
    justify-content: center;
    .el-input {
      width: 700px;
    }
  }
}
</style>