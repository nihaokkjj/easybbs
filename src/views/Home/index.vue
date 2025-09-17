<template>
  <div
    class="container-body"
    :style="{ width: proxy.globalInfo.bodyWidth + 'px' }"
  >
    文章列表
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance } from "vue";
import { useRouter, useRoute } from "vue-router";
const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();
</script>

<style lang="scss">
</style>