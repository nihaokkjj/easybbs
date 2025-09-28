import { defineStore } from "pinia";
import {ref, computed} from 'vue'

export const messageStore = defineStore('message', () => {

  const messageCountInfo = ref({})

  const updateMessageCountInfo = (value) => {
    messageCountInfo.value = value
  }

  const readMessage = (value) => {
    // console.log('tatal', messageCountInfo.value[value])
    messageCountInfo.value.total -= messageCountInfo.value[value]
    messageCountInfo.value[value] = 0
  }

  return {
    messageCountInfo,
    updateMessageCountInfo,
    readMessage,
  }
})

