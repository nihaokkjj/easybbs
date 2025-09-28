<script setup>
import {
		ref,
		getCurrentInstance,
		onMounted,
		watch,
		watchEffect,
	} from 'vue'

const { proxy } = getCurrentInstance()

const logoInfo = ref([
		{
			letter: 'E',
			color: 'red',
		},
		{
			letter: 'a',
			color: 'green',
		},
		{
			letter: 's',
			color: 'skyblue',
		},
		{
			letter: 'y',
			color: 'orange',
		},
		{
			letter: 'b',
			color: 'skyblue',
		},
		{
			letter: 'b',
			color: 'green',
		},
		{
			letter: 's',
			color: 'orange',
		},
	])

  const localImage = new URL('@/assets/img/lec.png', import.meta.url).href
</script>

<template>
  <div
    class="container-body footer-content"
    >
    <el-row>
      <el-col :span="5" class="item">
        <div class="logo">
          <div class="logo-letter">
            <span
             v-for="item in logoInfo"
              :style="{ color: item.color }"
              >{{ item.letter }}
            </span>
          </div>
          <div class="info">一个干活满满的编程社区</div>
        </div>
      </el-col>
      <el-col :span="5" class="item">
        <div class="title">加入我们</div>
        <img :src="localImage" alt="">
      </el-col>
      <el-col :span="5" class="item">
        <div class="title">友情链接</div>
        <a href="https://juejin.cn/" class="link">掘金</a>
        <a href="https://www.bilibili.com/" class="link">b站</a>
      </el-col>
      <el-col :span="5" class="item">
        <div class="title">网站相关</div>
      </el-col>
      <el-col :span="3" class="item">
        <div class="title">规章制度</div>
      </el-col>
    </el-row>
  </div>

</template>

<style scoped>
.footer-content {
  background-color: #f3f1f1de;
  padding: 20px 100px;
  .item {
    position: relative;
    .logo {
      margin: 10px 0px;
      .logo-letter {
        font-size: 28px;
      }
      .info {
        color: #818181de;
        font-size: 14px;
      }
    }
    .title {
      font-weight: 550;
    }
    .link {
      font-size: 14px;
      color: #818181de;
      display: block;
    }
    img {
      position: absolute;
      left: -10px;
      width: 100px;
      height: 100px;
    }
  }
}
</style>