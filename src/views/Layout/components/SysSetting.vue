<script setup>

import { getCurrentInstance , onMounted} from 'vue';
import { sysStore } from '@/store/SysSetting';

const {proxy} = getCurrentInstance()
const store = sysStore()

const api = {
  getSysSetting: "/getSysSetting"
}
	//获取系统配置
	const loadSysSetting = async ()=>{
		let result = await proxy.Request({
      url: api.getSysSetting,
    })
    if (!result) {
      return
    }
    store.saveSysSetting(result.data)
	}

  onMounted(() => {
    loadSysSetting()
  })
</script>

<template>

</template>

<style scoped>

</style>