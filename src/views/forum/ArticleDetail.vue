<script setup>
import { getDecorators } from 'typescript';
import { onMounted, ref, getCurrentInstance } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()

const api = {
  getArticleDetail: '/forum/getArticleDetail'
}
// 文章详情
const articleInfo = ref({})
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
}

onMounted(() => {
  getArticleDetail(route.params.articleId)
})
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
        <div class="title">{{ articleInfo.title }}</div>
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
        <div class="detail" id="detail" v-html="articleInfo.content"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.article-detail-body {
  padding-top: 26px;
  padding-bottom: 15px;
  .board-info {
    line-height: 30px;
    .iconfont {
      font-weight: bolder;
      margin: 0px 5px;
    }
  }
  .detail-container {
    .article-detail {
      background: #fff;
      padding: 10px;
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
    }
  }
}
</style>