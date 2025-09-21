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
  changeTopType: "/comment/changeTopType",
}

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
const postCommentFinish = (resultData) => {
  commentListInfo.value.list.unshift(resultData)
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
        <span class="count">0{{  }}</span>
      </div>
      <div class="tab">
        <span>热榜</span>
        <el-divider direction="vertical"></el-divider>
        <span>最新</span>
      </div>
    </div>
    <!-- 发送评论 -->
    <div class="comment-form-pannel">
      <CommentPost 
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
      >
        <template #default="{data}">
          <CommentListItem 
          :articleId="articleId"
          :commentData="data"
          :articleUserId="articleUserId"
          :currentUserId="currentUserInfo.userId"
          @hiddenAllReply="hiddenAllReplyHandler"
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