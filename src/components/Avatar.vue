<script setup>
import { getCurrentInstance} from 'vue'
import {useRouter} from 'vue-router'

const {proxy} = getCurrentInstance()
const router = useRouter()

const props = defineProps({
    userId: {
        type: String
    },
    width: {
        type: Number,
        default: 60,
    },
    addLink: {
        type: Boolean,
        default: true,
    },
})

const goToUcenter = () => {
    if (props.addLink) {
        router.push("/user" + proxy.userId)
    }
}


</script>

<template>
<div
    class="avator" 
    :style="{
        width: width + 'px',
        height: width + 'px',
        'border-radius': width / 2 + 'px' 
        }">
    <el-image
        v-if="userId"
        :style="{
            width: width + 'px',
            height: width + 'px',
            'border-radius': width / 2 + 'px'
        }" 
        :src="proxy.globalInfo.avatarUrl + userId"
        :zoom-rate = "1.2"
        fit="scale-down"
        loading="lazy"
        @click="goToUcenter"
        >

    </el-image>
</div>
</template>

<style scoped>
    .avatar{
        outline: none;
        cursor: pointer;
    }
</style>