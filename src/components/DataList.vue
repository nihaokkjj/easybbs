<script setup>
import { ref } from 'vue'

const props = defineProps({
  dataSource: {
    type: Object,
  },
  loading: {
    type: Boolean,
  },
  noDataMsg: {
    type: String,
    default: "空空如也"
  }
})

const emits = defineEmits(["loadData"])
//处理翻页的函数
const handlePageNoChange = (pageNo) => {
  props.dataSource.pageNo = pageNo
  emits("loadData")
}

</script>

<template>
  <div 
  v-if="!loading && dataSource && dataSource.list && dataSource.list.length == 0">
    <NoData :msg="noDataMsg"></NoData>
  </div>
  <!-- 加载动画 -->
  <div class="skeleton" v-if="loading">
    <el-skeleton :row="2" animated></el-skeleton>
  </div>
  <div v-for="item in dataSource.list " v-else>
    <slot :data="item"></slot>
  </div>
  <div class="pagination">
    <el-pagination
      v-if="dataSource.pageTotal > 1"
      background
      :total="dataSource.totalCount"
      :current-page.sync="dataSource.pageNo"
      layout="prev, pager, next"
      @current-change="handlePageNoChange"
      style="text-align: right"
      >
    </el-pagination>
  </div>
</template>

<style scoped>
.pagination {
  padding: 5px 0px 5px 10px;
}
.skeleton {
  padding: 10px;
}
</style>