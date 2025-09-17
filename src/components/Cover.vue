<script setup>
import { getCurrentInstance } from 'vue';

const {proxy} = getCurrentInstance()

const props = defineProps({
    cover: {
        type: String,
    },
    width: {
        type: Number,
        default: 100,
    },
})
</script>

<template>
    <div class="cover" v-if="cover">
        <el-image
            :style="{width: width + 'px', height: width + 'px'}" 
            fit="scale-down"
            :src="proxy.globalInfo.imageUrl + cover"
        >
        </el-image>
    </div>
</template>

<style scoped>
.cover {
    background-color: #ddd;
    border-radius: 7px;
    overflow: hidden;
}
</style>