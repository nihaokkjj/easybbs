<script setup>
import CommentImage from './CommentImage.vue';
import { ref, computed } from 'vue';
import CommentPost from './CommentPost.vue';
import Avatar from '@/components/Avatar.vue';
import { useRouter } from 'vue-router';
import { getCurrentInstance } from 'vue';
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue';

const { proxy } = getCurrentInstance()
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
  changeTopType: "/comment/changeTopType",
}
//提示信息
const placeholderInfo = ref('')

//是否展示二级评论
const showMore = ref(false)
const changeShowState = () => {
  showMore.value = !showMore.value
}
//发布评论
const showReplayPanel = (curData, type) => {
  
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



const postCommentFinish = (resultData) => {
  //当发布第一个二级评论时, 需要将children初始化
  if (!props.commentData.children) {
        props.commentData.children = [];
    }
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

//展示图片 
const commentImgUrl = computed(() => {
    if (props.commentData.imgPath) {
      return proxy.globalInfo.imageUrl + props.commentData.imgPath.replace('.','_.')
    }
    return ''
  })

  //置顶
  const emit = defineEmits(["reloadData"])
  const onTop = async(data) => {
    let result = await proxy.Request({
      url: api.changeTopType,
      params: {
        commentId: data.commentId,
        topType: data.topType === 1 ? 0 : 1
      }
    })
    if (!result) {
      return
    }
    emit('reloadData')
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
      <div>
        <span
         class="tag tag-toping"
         v-if="commentData.topType === 1"
         >置顶</span>
         <span
          class="tag no-audit"
          v-if="commentData.status === 0"
          >待审核</span>
        <span v-html="commentData.content"></span>
      </div>
      {{ commentData.imageUrl }}
      <CommentImage
      :style="{'margin-top':'10px'}"
        v-if="commentData.imgPath"
        :src="commentImgUrl"
        :imgList="[proxy.globalInfo.imageUrl + commentData.imgPath]"
        ></CommentImage>
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
        <el-dropdown-item
         @click="onTop(commentData)"
        >
          {{ 
            commentData.topType === 0 ? '设为置顶' : '取消置顶'
          }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
  <div v-if="commentData.children">
    <div v-if="showMore">
      <el-icon @click="changeShowState"><ArrowUp /></el-icon>
    </div>
    <div v-else>
      <el-icon @click="changeShowState"><ArrowDown /></el-icon>
    </div>
  </div>
    </div>
    <div class="comment-sub-list"
      v-if="commentData.children && showMore"  
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
      align-items: center;
      .name {
        margin-right: 10px;
        font-size: 14px;
        color: var(--text2);
      }
      .tag-author {
        padding: 2px 3px;
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
      .tag {
        margin-right: 5px;
        font-size: 13px;
        border-radius: 3px;
        padding: 1px 4px;
      }
      .tag-toping {
        color: var(--pink);
        border: 1px solid var(--pink);
      }
      .no-audit {
        color: var(--text2);
        border: 1px solid var(--text2);
      }
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