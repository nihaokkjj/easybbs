<template>
  <div class="header" v-show="showHeader === true">
    <div class="header-content" >
    <!-- logo -->
    <div class="logo">
      <span v-for="item in logoInfo" :style="{color: item.color}">{{ item.letter }}</span>
    </div>
    <!-- 板块信息 -->
    <div class="menu-pannel"></div>
    <!-- 登录注册用户信息 -->
    <div class="user-info-pannel">
      <el-button type="primary" class="op-btn">
        发帖 <span class="iconfont icon-add"></span>
      </el-button>
      <el-button type="primary" class="op-btn" @click="goSearch">
        搜索<span class="iconfont icon-search"></span>
      </el-button>
      <el-button-group class="login">
        <el-button class="register" type="primary" plain @click="loginAndRegister(1)">登录</el-button>
        <el-button class="register" type="primary" plain @click="loginAndRegister(0)" :style="{'margin-left' : '5px'}">注册</el-button>
      </el-button-group>
    </div>
    </div>
  </div>
    <div>
    <!-- <Dialog :show="showDialog" :buttons="buttons" @click="showDialog = false">
      <div :style="{'height': '700px'}"></div>
    </Dialog> -->
    <LoginAndRegister ref="loginRegisterRef"></LoginAndRegister>
  </div>
  <div class="main-content"> 
    <router-view></router-view>
  </div>
</template>

<script setup>
import LoginAndRegister from './components/LoginAndRegister.vue'
import {ref, getCurrentInstance, onMounted} from 'vue'
import {useRouter, useRoute} from 'vue-router'

const {proxy} = getCurrentInstance()

const router = useRouter()
const route = useRoute()

const logoInfo = ref([
  {
    letter: 'E',
    color: 'red',
  },  {
    letter: 'a',
    color: 'green',
  },  {
    letter: 's',
    color: 'skyblue',
  },  {
    letter: 'y',
    color: 'yellow',
  },
])

//导航栏的显示效果
const showHeader = ref(true)
//获取滚动条的高度
const getScrollTop = () => {
  let scrollTop = 
  document.documentElement.scrollTop 
  || window.pageYOffset 
  || document.body.scrollTop

  return scrollTop
}

const initScroll =() => {

  let initScrollTop = getScrollTop()
  let scrollType = 0

  window.addEventListener('scroll', () => {
    let currentScrollTop = getScrollTop()
    if (currentScrollTop > initScrollTop) {
      scrollType = 1
    } else {
      scrollType = 0
    }
    initScrollTop = currentScrollTop
    // console.log(scrollType === 1 ? 'shang' : 'xia')
    if (scrollType === 1 && currentScrollTop > 150) {
      showHeader.value = false
    } else showHeader.value = true
    })
   }

  //  //弹窗
  //  const showDialog = ref(true)
  //  const buttons = [{
  //   text: '确定',
  //   type: 'primary',
  //  },
  // ]

  //登录
  const loginRegisterRef = ref()
  const loginAndRegister = (type)=> {
    loginRegisterRef.value.showPanel(type)
    console.log(type)
  }

  //搜索
  const goSearch = ()=>{
    router.push('search')
  }

  onMounted(() => {
    initScroll()
  })
</script>

<style scoped lang="scss">

.header {
  top: 0px;
  left: 0px;
  position: fixed;
  height: 60px;
  width: 100%;
  z-index: 1000;
  box-shadow: 0 2px 6px 0 #ddd;
  padding: 0 30px;

  .header-content {
    align-items: center;
    margin: 0 auto;
    background-color: #fff;
    height: 60px;
    display: flex;
  
    .logo {
      display: block;
      text-decoration: none;
      margin-right: 5px;
      span {
        font-size: 30px;
        font-weight: 600;
      }
    }
    
    .menu-pannel {
      flex: 1;
    }
    .user-info-pannel {
      width: 400px;
      display: flex;
      .op-btn {
        .iconfont {
          margin-left: 10px;
        }
      }
      .login {
        margin-left: 10px;

        .register,
        .register:active,
        .register:focus {
          border: 0.5px solid skyblue;
          border-radius: 9900px;
        }
        .register:hover {
          background-color: #409EFF;
        }
      }
    }
  }
}

.main-content {
  width: 10000px;
  display: block;
}
</style>
