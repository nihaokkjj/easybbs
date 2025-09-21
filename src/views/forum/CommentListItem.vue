<script setup>
import { defineProps, ref } from 'vue';
import CommentPost from './CommentPost.vue';
import Avatar from '@/components/Avatar.vue';
import { useRouter } from 'vue-router';
import { getCurrentInstance } from 'vue';

const {proxy} = getCurrentInstance()
const router = useRouter()

const props = defineProps({
  articleId: {
    type: String,
  },
  commentData: {
    type: Object,
  },
  articleUserId: {
    type: String,
  },
  currentUserId: {
    type: String,
  }
})

const api = {
  doLike: "/comment/doLike",
}
const placeholderInfo = ref('')
const emit = defineEmits(["hiddenAllReplay"])
//发布评论
const showReplayPanel = (curData, type) => {
  emit("hiddenAllReplay")
  if (type === 0) {
    if(curData.showReplay === true && pCommentId.value === curData.commentId) 
        curData.showReplay = false
    else curData.showReplay = true
  } else {
    if (props.commentData.showReplay !== true)
      props.commentData.showReplay = true
    else if (pCommentId.value === curData.commentId) {
      props.commentData.showReplay = false
    }
  }

  replyUserId.value = curData.userId
  placeholderInfo.value = "回复 @" + curData.nickName
  pCommentId.value = curData.commentId
}
//回复的评论的id
const pCommentId = ref(0)
const replyUserId = ref(null)


const postCommentFinish = (resultData) => {
  props.commentData.children.push(resultData[resultData.length - 1])
  props.commentData.showReplay = false
}

const gotoUcenter = (userId) => {
  router.push(`/user/${userId}`)
}

//点赞
const doLike = async (data) => {
  let result = await proxy.Request({
    url: api.doLike,
    showloading: false,
    params: {
      commentId: data.commentId,
    }
  })
  if (!result) {
      return 
    }
    data.goodCount = result.data.goodCount
    data.likeType = result.data.likeType
}
</script>

<template>
<div class="comment-item">
  <Avatar
  :userId="commentData.userId"
  :width="50"
  ></Avatar>
  <div class="comment-info">
    <div class="nick-name"
    @click="gotoUcenter(commentData.userId)"
    >
      <span class="name">{{ commentData.nickName }}</span>
      <span 
      class="tag-author"
      v-if="commentData.userId === articleUserId"
      >作者</span>
    </div>
    <div class="comment-content">
      <span v-html="commentData.content"></span>
      {{ commentData.imageUrl }}
      <commentImage
        v-if="commentData.imgPath"
        :src="proxy.globalInfo.imageUrl + commentData.imgPath.replace(".","_.")"
        ></commentImage>
    </div>
    <div class="op-panel">
      <div class="time">
        <span>{{ commentData.postTime }}</span>
        <span class="address">
          &nbsp;.&nbsp;{{ commentData.userIpAddress }}
        </span>
    </div>
    <div
    :class="{active: commentData.likeType === 1}"
     class="iconfont icon-good"
     @click="doLike(commentData)"
     >
      {{ commentData.goodCount>0 ? commentData.goodCount : '点赞' }}
    </div>
    <div
     class="iconfont icon-comment"
     @click="showReplayPanel(commentData, 0)"
     >
      回复
    </div>
    <el-dropdown 
    v-if="articleUserId === currentUserId"
    >
    <div class="iconfont icon-more"></div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item>
          {{ 
            commentData.topType === 0 ? '设为置顶' : '取消置顶'
          }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
    </div>
    <div class="comment-sub-list"
      v-if="commentData.children"  
    >
      <div class="comment-sub-item"
      v-for="sub in commentData.children"
      >
        <Avatar
          :userId="sub.userId"
          :width="35"
        ></Avatar>
        <div class="comment-sub-info">
          <div class="nick-name"
          >
            <span 
              class="name" 
              @click="gotoUcenter(sub.userId)"
              >{{sub.nickName}}</span>
            <span 
              class="tag-author"
              v-if="sub.userId === articleUserId"
             >作者</span>
             <span class="reply-name">回复</span>
             <span
              @click="gotoUcenter(sub.replyUserId)"
              class="a-link"
              >@{{ sub.replyNickName }}</span>
             <span> : </span>
             <span class="sub-content" v-html="sub.content"></span>
          </div>
          <div class="op-panel">
          <div class="time">
            <span>{{ sub.postTime }}</span>
            <span class="address">
              &nbsp;.&nbsp;{{ sub.userIpAddress }}
            </span>
        </div>
        <div
        :class="{active: sub.likeType === 1}"
         class="iconfont icon-good"
         @click="doLike(sub)"
         >
          {{ sub.goodCount>0 ? sub.goodCount : '点赞' }}
        </div>
        <div
        class="iconfont icon-comment"
        @click="showReplayPanel(sub, 1)"
        >
          回复
        </div>
          </div>
        </div>
      </div>
    </div>
    <div
     class="replay-info"
     v-if="commentData.showReplay">
      <CommentPost
        :articleId="articleId"
        :avatarWidth="35"
        :placeholderInfo="placeholderInfo"
        :replyUserId="replyUserId"
        :userId="currentUserId"
        :showInsertImg="false"
        :pCommentId="pCommentId"
        @postCommentFinish="postCommentFinish"
      ></CommentPost>
    </div>
  </div>
</div>
</template>

<style scoped>
.comment-item {
  display: flex;
  padding-top: 6px;
  .comment-info {
    flex: 1;
    margin-left: 10px;
    border-bottom: 1px solid #ddd;
    padding-bottom: 8px;
    .nick-name {
      .name {
        margin-right: 10px;
        font-size: 14px;
        color: var(--text2);
      }
      .tag-author {
        padding: 1px;
        background: var(--pink);
        color: #fff;
        font-size: 12px;
        border-radius: 2px;
      }
    }
    .comment-content {
      margin-top: 5px;
      font-size: 15px;
      line-height: 22px;
    }
    .op-panel {
      align-items: center;
      display: flex;
      margin-top: 5px;
      font-size: 13px;
      color: var(--text2);
      .address {
        margin: 0px 15px
      }
      .iconfont {
        cursor: pointer;
        color: var(--icon);
        margin-right: 12px;
      }
      .active {
        color: var(--link);
      }
      .iconfont::before {
        margin-right: 5px;
      }
      .icon-more {
        outline: none;
      }
    }
    .comment-sub-list {
        margin-top: 10px;
        .comment-sub-item {
          display: flex;
          margin: 10px 0px;
          .comment-sub-info {
            .nick-name {
              .reply-name{
                margin: 0 5px;
              }
              .tag-author {
                padding: 1.5px;
                background: var(--pink);
                color: #fff;
                font-size: 12px;
                border-radius: 2px;
              }
              .reply-name {
                margin: 0px 5px;
                font-size: 14px;
              }
            }
            .op-panel {
              margin-top: 5px;
              .active {
                color: var(--link);
              }
            }
          }
        }
      }
    .replay-info {
      margin-top: 15px;
    }
  }
}
</style>