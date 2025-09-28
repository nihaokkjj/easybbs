<script setup>
import { getCurrentInstance,
        nextTick,
        onMounted,
        ref ,
        watch,
      } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/store';
import ArticleItem from '../forum/ArticleItem.vue';
import UcenterEditUserinfo from './UcenterEditUserinfo.vue';
import UserIntegralRecord from './UserIntegralRecord.vue';

const {proxy} = getCurrentInstance()
const userStore = useUserStore()

const router = useRouter()
const route = useRoute()
const api = {
  getUserInfo: '/ucenter/getUserInfo',
  loadUserArticle: "/ucenter/loadUserArticle",
}


const userId = ref(null)
const userInfo =ref({})
const currentId = ref(userStore.loginUserInfo?.userId || '')

const loadUserInfo = async() => {
  let result = await proxy.Request({
    url: api.getUserInfo,
    params: {
      userId: userId.value
    },
    errorCallback: () => {
      setTimeout(() => {
        router.push("/")
      }, 1000)
    }
  })

  if (!result) {
    return
  }
  userInfo.value = result.data

  resetCurrentUser()
  loadArticle()
}

const resetCurrentUser = () => {
  if (currentId.value !== undefined && currentId.value === userId.value) {
        isCurrentUser.value = true
    } else isCurrentUser.value = false
  }

//是否为作者查看
const isCurrentUser =ref(false)
watch(() => userStore.loginUserInfo,
    (newValue, oldValue) => {
      if (newValue) currentId.value = newValue.userId
      resetCurrentUser()
    },
    {immediate: true, deep:true}
  )

watch(
  () => route.params?.userId,
  (newValue, oldValue) => {
    if (newValue) {
      userId.value = newValue || ''
      loadUserInfo()
    } 
  },{
    immediate:true, deep: true
  })

onMounted(() => {
  userId.value = route.params?.userId
})

//右侧文章

const activeTagName = ref(0)
const changeTab = (type) => {
  activeTagName.value = type
  loadArticle()
}
const articleListInfo = ref({})
//更新渲染列表
const loadArticle = async () => {
    loading.value = true//正在加载
    let params = {
        pageNo: articleListInfo.value.pageNo,
        type: activeTagName.value,
        userId: userId.value,
    }
   let result = await proxy.Request({
       url: api.loadUserArticle,
       params: params,
       showLoading: false
    })

    if(!result){
      return;
    }
    articleListInfo.value = result.data
    loading.value = false //加载完成
}
//数据是否正在加载
const loading = ref(false)

//修改资料
const userInfoRef = ref(null)
const updateUserInfo = () => {
  userInfoRef.value.showEditUserInfoDialog(userInfo.value)
}
//获取用户积分记录
const userIntegralRecordRef = ref(null)
const showIntegralRecord = () => {
  userIntegralRecordRef.value.showRecord()
}

const resetUserInfoHandler = (data) => {
  userInfo.value = data
}
</script>

<template>
  <div class="user-container">
    <div
    class="container-body ucenter-body"
    :style="{width: proxy.globalInfo.bodyWidth + 'px'}"
    >
    <div class="user-banner">
      <router-link to="/" class="a-link">首页</router-link>
      <span class="iconfont icon-right">个人中心</span>
    </div>
    <div class="ucenter-panel">
      <div class="user-side">
        <!-- 头像 -->
        <div class="avatar-panel">
          <div
           class="edit-btn a-link"
            v-if="isCurrentUser"
            @click="updateUserInfo">
            修改资料
          </div>
          <UcenterEditUserinfo
           ref="userInfoRef"
           @resetUserInfo="resetUserInfoHandler"
           ></UcenterEditUserinfo>
          <div class="avatar-inner">
            <Avatar
             :userId="userId"
             :width="120"
             ></Avatar>
          </div>
          <div class="nick-name">
              <span>{{ userInfo.nickName }}</span>
              <span
              v-if="userInfo.sex === 0"
              class="iconfont icon-woman"></span>
              <span
              v-if="userInfo.sex === 1"
              class="iconfont icon-man"></span>
             </div>
             <div class="desc">
              {{ userInfo.personDescription }}
             </div>
        </div>
        <!-- 其他 -->
        <div class="user-extend-panel">
          <!-- 用户积分记录 -->
          <UserIntegralRecord ref="userIntegralRecordRef"></UserIntegralRecord>
          <div class="info-item" v-if="isCurrentUser">
            <div class="label iconfont icon-integral">积分</div>
            <div
             class="value a-link"
             @click="showIntegralRecord"
             >{{ userInfo.currentIntegral }}</div>
          </div>
          <div class="info-item" v-else>
            <div class="label iconfont icon-integral">积分</div>
            <div class="value">{{ userInfo.currentIntegral }}</div>
          </div>
          <div class="info-item">
            <div class="label iconfont inco-like">获赞</div>
            <div class="value">{{ userInfo.postCount }}</div>
          </div>
          <div class="info-item">
            <div class="label iconfont icon-post">发帖</div>
            <div class="value">{{ userInfo.postCount }}</div>
          </div>
          <div class="info-item">
            <div class="label iconfont icon-register">加入</div>
            <div class="value">{{ userInfo.joinTime }}</div>
          </div>
          <div class="info-item">
            <div class="label iconfont icon-login">登录</div>
            <div class="value">{{ userInfo.lastLoginTime }}</div>
          </div>
        </div>
      </div>
      <div class="article-panel">
        <el-tabs
         :model-value="activeTagName"
         @tab-change="changeTab"
         >
         <el-tab-pane label="发帖" :name="0"></el-tab-pane>
         <el-tab-pane label="评论" :name="1"></el-tab-pane>
         <el-tab-pane label="点赞" :name="2"></el-tab-pane>
        </el-tabs>
        <div class="article-list">
          <DataList
           :dataSource="articleListInfo"
           :loading="loading"
           @loadData="loadArticle"
           noDataMsg="暂无相关内容"
           >
           <template #default="{data}">
              <ArticleItem
               :data="data"
                @loadData="loadArticle"
                :showEdit="activeTagName === 0 && isCurrentUser"
                ></ArticleItem>
          </template>
          </DataList>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<style scoped>
.user-container {
  margin-top: 60px;
  .ucenter-body {
    .user-banner {
      padding: 10px;
      .icon-right {
        color: rgb(136, 136, 136);
      }
      .iconfont::before {
        margin: 0px 10px;
      }
    }
    .ucenter-panel {
      display: flex;
      .user-side {
        width: 300px;
        margin-right: 10px;
        .avatar-panel {
          border-radius: 5px;
          background: #fff;
          text-align: center;
          padding: 10px 9px;
          .edit-btn {
            text-align: right;
            font-size: 12px;
          }
          .avatar-inner {
            display: flex;
            justify-content: center;
          }
          .nick-name {
              .iconfont{
                color: var(--link);
                margin-left: 5px;
              }
          }
          .desc {
            color: #979797;
            margin: 5px 0px;
                font-size: 13px;
          }
        }
        .user-extend-panel {
          border-radius: 5px;
          margin-top: 15px;
          background: #fff;
          .info-item {
            padding: 2px 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            .label {
              color: #575757;
              font-size: 15px;
            }
            .iconfont::before {
              font-size: 19px;
              margin-right: 5px;
            }
            .value {
              font-size: 14px;
            }
          }
        }
      }
      .article-panel {
        flex: 1;
        background: #fff;
        padding: 1px 10px;
      }
    }
  }
}
</style>