import { defineStore } from "pinia";
import {ref, computed} from 'vue'

export const sysStore = defineStore('sys', () => {

  const SysSetting = ref([])

  const saveSysSetting = (value) => {
    SysSetting.value = value
  }
  return {
    SysSetting,
    saveSysSetting,
  }
})
