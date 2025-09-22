<script setup>
import CommentListItem from './CommentListItem.vue';
import { useUserStore } from '@/store/index.js';
import {ref, watch} from 'vue'
import { getCurrentInstance } from 'vue';
import CommentPost from './CommentPost.vue';
import { handleCurrentChange } from 'element-plus/es/components/tree/src/model/util.mjs';


const userStore = useUserStore()
const {proxy} = getCurrentInstance()

const props = defineProps({
  articleId: {
    type: String,
  },
  articleUserId: {
    type: String,
  }
})
const api = {
  loadComment: "/comment/loadComment",
  postComment: "/comment/postComment",
  doLike: "/comment/doLike",
}

// console.log('articleUserId', articleUserId)
//当前用户信息
const currentUserInfo = ref({})
currentUserInfo.value = userStore.loginUserInfo || {}

watch(
  () => userStore.loginUserInfo,
  (newValue, oldValue) => {
    currentUserInfo.value = newValue || ''
  }, 
  {
    immediate: true, deep: true
  }
  )

  //form信息
  const formData = ref({})
  const formDataRef = ref({})
  const rules = {
    title: [
      {required: true, message: "请输入评论内容"},
    ]
  }
  // 选择图片
  const selectImg = () => {

  }

//排序
const orderType = ref(0)
const orderChange = (type) => {
  orderType.value = type
  loadComment()
}
//评论列表
const loading = ref(null)
const commentListInfo = ref({})

const loadComment = async() => {
  let params = {
    pageNo: commentListInfo.value.pageNo,
    articleId: props.articleId,
    orderType: orderType.value,
  }
  loading.value = true
  let result = await proxy.Request({
    url: api.loadComment,
    params,
  })
  
  loading.value = false
  if (!result) {
    return
  }
  commentListInfo.value = result.data
}

loadComment()

//评论发布完成
const emit = defineEmits(['updateCommentCount'])
const postCommentFinish = (resultData) => {
  commentListInfo.value.list.unshift(resultData)
  const totalCount = commentListInfo.value.totalCount + 1
  commentListInfo.value.totalCount = totalCount
  emit('updateCommentCount', totalCount)
}

//隐藏所有回复框
const hiddenAllReplyHandler = () => {
  commentListInfo.value.list.forEach( element => {
    element.showReplay = false
  })
}


</script>

<template>
  <div class="comment-body">
    <div class="comment-title">
      <div class="title">
        评论
        <span class="count">{{ commentListInfo.totalCount }}</span>
      </div>
      <div class="tab">
        <span
         @click="orderChange(0)"
         :class="{'a-link':orderType === 0}"
         >热榜</span>
        <el-divider direction="vertical"></el-divider>
        <span
         @click="orderChange(1)"
         :class="{'a-link':orderType === 1}"
         >最新</span>
      </div>
    </div>
    <!-- 发送评论 -->
    <div class="comment-form-pannel">
      <CommentPost 
        :articlrUserId="articleUserId"
        :articleId="articleId"
        :avatarWidth="50"
        :userId="currentUserInfo.userId"
        :showInsertImg="currentUserInfo.userId !== null"
        :pCommentId="0"
        @postCommentFinish="postCommentFinish"
        ></CommentPost>
    </div>
    <div class="comment-list">
      <DataList 
      :dataSource="commentListInfo"
      :loading="loading"
      @loadData="loadComment"
      noDataMsg="暂无评论, 赶紧占沙发吧!"
      >
        <template #default="{data}">
          <CommentListItem 
          :articleId="articleId"
          :commentData="data"
          :articleUserId="articleUserId"
          :currentUserId="currentUserInfo.userId"
          @hiddenAllReply="hiddenAllReplyHandler"
          @reloadData="loadComment"
          >
        </CommentListItem>
        </template>
      </DataList>
    </div>
  </div>
</template>

<style scoped>
.comment-body {
  .comment-title {
    align-items: center;
    display: flex;
    .title {
      font-size: 22px;
      .count {
        font-size: 19px;
        padding: 0px 10px;
      }
    }
  }

}
</style>