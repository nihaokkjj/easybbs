<script setup>
import { ref, getCurrentInstance, nextTick } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()
const {proxy} = getCurrentInstance()
const api = {
   loadUserIntegralRecord: "/ucenter/loadUserIntegralRecord"
}
const diaTop = window.innerHeight - 680 + 'px'

const dialogConfig = ref({
  show: false,
  title: '查看用户积分记录',
  buttons: [
    {
      type: 'primary',
      text: '确定',
      click: (e) => {
        dialogConfig.value.show = false
      }
    }
  ]
})

const dialogClose = () => {
  dialogConfig.value.show = false
}

const formData = ref({})
const formDataRef = ref()


const showRecord = () => {
  dialogConfig.value.show = true
  nextTick(() => {
    formData.value.createTimeRange = null
    loadRecord()
  })
}
defineExpose({showRecord})

const recordInfo = ref({})
//更新渲染列表
const loadRecord= async () => {
    loading.value = true//正在加载
    if (!recordInfo.value) {
      recordInfo.value.pageNo = 1
    }
    let params = {
        pageNo: recordInfo.value.pageNo,
    }
    if(formData.value.createTimeRange) {
      // console.log('true', formData.value.createTimeRange)
      params.createTimeStart = formData.value.createTimeRange[0]
      params.createTimeEnd = formData.value.createTimeRange[1]
    }
   let result = await proxy.Request({
       url: api.loadUserIntegralRecord,
       params: params,
       showLoading: false
    })
    // console.log(result)
    if(!result){
      return;
    }
    recordInfo.value = result.data
    loading.value = false //加载完成
}
//数据是否正在加载
const loading = ref(false)

</script>

<template>
    <Dialog
    :show="dialogConfig.show"
    :title="dialogConfig.title"
    :buttons="dialogConfig.buttons"
     width="500px"
     :top="diaTop"
    :showCancel="false"
    @close="dialogClose"
  >
    <el-form
    :model="formData"
    ref="formDataRef"
    >
    <el-form-item label="日期" props="createTimeRange">
      <el-date-picker
       v-model="formData.createTimeRange"
       type="daterange"
       range-separator="~"
       start-placeholder="开始日期"
       end-placeholder="结束日期"
       value-format="YYYY-MM-DD"
       @change="loadRecord"
       ></el-date-picker>
    </el-form-item>
  </el-form>
  <div class="data-item">
    <div class="record-type">类型</div>
    <div class="integral">积分</div>
    <div class="create-time">时间</div>
  </div>
  <DataList
    :dataSource="recordInfo"
    :loading="loading"
    @loadData="loadRecord"
    noDataMsg="暂无相关记录"
    >
    <template #default="{data}">
      <div class="data-item">
        <div class="record-type">{{ data.operTypeName }}</div>
        <div :class="['integral', data.integral > 0 ? 'add' : 'reduce']"
          >{{ data.integral }}</div>
        <div class="create-time">{{ data.createTime }}</div>
      </div>
    </template>
  </DataList>
  </Dialog>
</template>

<style scoped>
.data-item {
  display: flex;
  border-bottom: 1px solid #ddd;
  padding: 8px 0px;
  .add {
    color: red;
  }
  .reduce {
    color: green;
  }
  .record-type {
    width: 120px;
  }
  .integral {
    width: 120px;
  }
  .create-time {
    text-align: center;
    flex: 1;
  }
}
</style>