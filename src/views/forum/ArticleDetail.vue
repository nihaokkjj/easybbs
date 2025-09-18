<script setup>
import { getDecorators } from 'typescript';
import { onMounted, ref, getCurrentInstance } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()

const api = {
  getArticleDetail: '/forum/getArticleDetail',
  doLike: "/forum/doLike",
}
// 文章详情
const articleInfo = ref({})
//附件
const attachment = ref({})

const getArticleDetail = async (articleId) => {
  let result = await proxy.Request({
    url: api.getArticleDetail,
    params: {
      articleId: articleId,
    }
  })
  if (!result) {
    return
  }
  articleInfo.value = result.data.forumArticle
  attachment.value = result.data.attachment || {}
  haveLike.value = result.haveLike
}

onMounted(() => {
  getArticleDetail(route.params.articleId)
})

//快捷操作
const quickPanelLeft = (window.innerWidth - proxy.globalInfo.bodyWidth) / 2 - 25

//是否点赞
const haveLike = ref(false)
const doLikeHandle = async () => {
  let result = await proxy.Request({
    url: api.doLike,
    params: {
      articleId: articleInfo.value.articleId,

    }
  })
  if (!result) {
    return;
  }
  haveLike.value = !haveLike.value
  let goodCount = 1
  if (!haveLike.value) {
    goodCount = -1
  }

  articleInfo.value.goodCount += goodCount
}

//左侧图标跳转
const goToPosition = (domId) => {
  document.querySelector("#" + domId).scrollIntoView()
}


</script>

<template>
  <div
  class="container-body article-detail-body"
  v-if="Object.keys(articleInfo).length > 0"
  :style="{width: proxy.globalInfo.bodyWidth + 'px'}">
    <div class="board-info">
      <router-link 
      :to="`/forum/${articleInfo.pBoardId}`"
      class="a-link"
      >{{ articleInfo.pBoardName }}</router-link>
      <span class="iconfont icon-right" v-if="articleInfo.boardId"></span>
      <router-link v-if="articleInfo.boardId"
      :to="`/forum/${articleInfo.pBoardId}/${articleInfo.boardId}`"
      class="a-link">
      {{articleInfo.boardName}}</router-link>
      <span class="iconfont icon-right"></span>
      <span>{{ articleInfo.title }}</span>
    </div>
    <div class="detail-container"
    :style="{width: proxy.globalInfo.bodyWidth - 300 + 'px'}">
      <div class="article-detail">
        <!-- 标题 -->
        <div class="title">{{ articleInfo.title }}</div>
        <!-- 用户信息 -->
        <div class="user-info">
          <Avatar :userId = "articleInfo.userId":width="50">
          </Avatar>
          <div class="user-info-detail">
            <router-link 
            class="nick-name"
            :to="`/user/${articleInfo.userId}`"
            >{{ articleInfo.nickName }}</router-link>
            <div class="time-info">
              <span>{{ articleInfo.postTime }}</span>
              <span>&nbsp;.&nbsp;{{ articleInfo.userIpAddress }}</span>
              <span class="iconfont icon-eye-solid">
                {{ articleInfo.readCount === 0 ? '阅读' : articleInfo.readCount }}
              </span>
            </div>
          </div>
        </div>
        <!-- 文章详情 -->
        <div class="detail" id="detail" 
        v-html="articleInfo.content"></div>
        </div>
        <!-- 附件 -->
         <div class="attachment-panel" 
          v-if="attachment"
         id="view-attachment">
        <div class="title item">附件</div>
         <div class="attachment-info item">
          <div class="iconfont icon-zip"></div>
          <div class="file-name item">{{ attachment.fileName }}</div>
          <div class="size item">
            {{
               proxy.Utils.sizeToStr(attachment.fileSize) 
           }}</div>
          <div>需要
            <span class="integral item">{{ attachment.integral }}</span>
            积分
          </div>
          <div class="download-count item">
            已下载{{ attachment.downloadCount }}次
          </div>
          <div class="download-btn item">
            <el-button type="primary">下载</el-button>
            </div>
          </div>
          </div>
          <!-- 评论 -->
           <div class="comment-panel" id="view-comment">
            pinglun
           </div>
      </div>
  </div>
<!-- 左侧快捷操作 -->
  <div class="quick-panel"
     :style="{left: quickPanelLeft + 'px'}">
      <!-- 点赞 -->
      <el-badge
      :value="articleInfo.goodCount"
      :offset="[-12,22]"
      type="info"
      :hidden="articleInfo.goodCount <= 0">
        <div class="quick-item" @click="doLikeHandle">
          <span 
          class="iconfont icon-good"
          :class="{haveLike: haveLike} "
          ></span>
        </div>
      </el-badge>
      <!-- 评论 -->
      <el-badge
      :value="articleInfo.commentCount"
      type="info"
      :offset="[-12,22]"
      :hidden="articleInfo.commentCount <= 0">
        <div class="quick-item" @click="goToPosition('view-comment')">
          <span class="iconfont icon-comment"></span>
        </div>
      </el-badge>
      <!-- 附件 -->
      <div class="quick-item" @click="goToPosition('view-attachment')">
        <span class="iconfont icon-attachment"></span>
      </div>
</div>
</template>

<style scoped>
.article-detail-body {
  padding-top: 23px;
  padding-bottom: 25px;
  .board-info {
    padding: 2px 150px;
    line-height: 30px;
    .iconfont {
      font-weight: bolder;
      margin: 0px 5px;
    }
  }
  .detail-container {
    margin: 0 auto;
    .article-detail {
      padding: 5px 1px 5px 15px;
      background: #fff;
      padding-bottom: 15px;
      .title{
        font-weight: bolder;
      }
      .user-info {
        display: flex;
        margin-top: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid #ddd;
        .user-info-detail {
          margin-left: 10px;
          .nick-name {
            text-decoration: none;
            color: #4e5969;
            font-size: 15px;
          }
          .nick-name:hover {
            color: var(--link);
          }
          .time-info {
            margin-top: 5px;
            font-size: 13px;
            color: var(--text2);
            .iconfont {
              margin-left: 10px;
            }
            .iconfont::before{
              padding-right: 5px;
            }
          }
        }
      }
      .detail {
        letter-spacing: 1.5px;
        line-height: 22px;
      }
      .detail :deep(img) {
          max-width: 90%;
          margin: 0 auto;
          height: auto;
          cursor: pointer;
        }
    }
  }
  .attachment-panel {
      padding: 20px;
      margin-top: 20px;
      background: #fff;
      .title {
        font-size: 18px;
      }
      .attachment-info {
        display: flex;
        color: #9f9f9f;
        align-items: center;
        .item {
          margin-right: 6px;
        }
        .icon-zip {
          font-size: 22px;
          color: #6ca1f7;
        }
        .file-name {
          color: #549fc2;
        }
        .integral {
          color: rgb(88, 68, 68);
          padding: 0px 2px ;
        }
      }
    }
    .comment-panel {
      margin-top: 20px;
      background: #fff;
    }
}
.quick-panel {
      position: absolute;
      width: 60px;
      top: 200px;
      .quick-item {
        display: flex;
        width: 60px;
        height: 60px;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
        background: #fff;
        margin: 12px 0px;
        cursor: pointer;
      }
      .iconfont {
        font-size: 24px;
        color: var(--text2);
      }
      .have-like {
        color: red;
      }
  }
</style>