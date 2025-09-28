<script setup>
import { addSyntheticLeadingComment, getDecorators } from 'typescript';
import {
  onMounted,
  nextTick,
  ref,
  getCurrentInstance,
  onUnmounted,
  watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/store/index';
import hljs from "highlight.js"
import "highlight.js/styles/atom-one-light.css"//样式
import CommentList from './CommentList.vue';
import { sysStore } from '@/store/SysSetting';

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()
const store = sysStore()

const api = {
  getArticleDetail: '/forum/getArticleDetail',
  doLike: "/forum/doLike",
  getUserDownloadInfo: "/forum/getUserDownloadInfo",
  attachmentDownload: "/api/forum/attachmentDownload",
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

  userStore.activeBoardId = result.data.forumArticle.boardId
  userStore.activePboardId = result.data.forumArticle.pBoardId
  // 图片预览
  imagePreview()
  //代码高亮
  highlightCode()
  //生成目录
  makeToc()
}

onMounted(() => {
  getArticleDetail(route.params.articleId)
})

//快捷操作
const quickPanelLeft = (window.innerWidth - proxy.globalInfo.bodyWidth) / 2 - 80

//是否点赞
const haveLike = ref(false)
const doLikeHandle = async () => {

  if (!userStore.loginUserInfo) {
    console.log('true11')
    userStore.changeLoginState(true)
    return
  }

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
  document.querySelector("#" + domId)?.scrollIntoView()
}

//下载附件

const downloadDo = (fileId) => {
    document.location.href = api.attachmentDownload + "?fileId=" + fileId
    attachment.value.documentCount += 1
}

const currentUserInfo = ref(null)
const downloadAttachment = async (fileId) => {
  //当前用户信息
  if (!currentUserInfo.value) {//是否登录
    userStore.changeLoginState(true)
    return
  }

  let result = await proxy.Request({
    url: api.getUserDownloadInfo,
    params: {
      fileId: fileId,
    }
  })

  if(!result) {
    return
  }
  // 之前下载过的可以不经过验证
  if (result.data.haveDownload) {
    downloadDo(fileId)
    return
  }
  // if (currentUserInfo.userId != articleInfo.value.userId) {
  //   proxy.Message.warning("您不能下载此文章的附件")
  //   return
  // }
  if (result.data.userIntegral < attachment.value.integral) {
    proxy.Message.warning("您的积分不够, 不够下载")
    return
  }
  //0积分情况
  if (attachment.value.integral === 0) {
      document.location.href = api.attachmentDownload + "?fileId=" + fileId
      attachment.value.documentCount += 1
      return
  }
  proxy.Confirm(
    `你还有${result.data.userIntegral}积分, 当前下载会扣除${attachment.value.integral}积分, 确定要下载吗?`,
    () => {
      downloadDo(fileId)
    }
)

} 

//图片预览
const imageViewerRef = ref(null)
const previewImageList = ref([])
const imagePreview = () => {
  nextTick(() => { 
//等待下一次 DOM 更新循环结束后执行回调函数中的代码
    const imageNodeList = document
    .querySelector('#detail')
    .querySelectorAll("img")

    const imageList = []
    imageNodeList.forEach((item, index) => {
      const src = item.getAttribute("src")
      imageList.push(src)
      item.addEventListener("click", () => {
        imageViewerRef.value.show(index)
      })
    })
    previewImageList.value = imageList
  })
}

//代码高亮
const highlightCode = () => {
  nextTick(() => {
    let blocks = document.querySelectorAll("pre code")
    blocks.forEach((item) => {
      hljs.highlightElement(item)
    })
  })
}


//更新评论数量(不统计二级评论)
const updateCommentCount = (totalCount) => {
  articleInfo.value.commentCount = totalCount
}

//更新目录列表 

const tocArray = ref([])
const makeToc = () => {
  nextTick(() => {
    const tocTags = ["H1", "H2", "H3", "H4", "H5", "H6"]

    //获取所有标签
    const contentDom = document.querySelector('#detail')
    const childNodes = contentDom.childNodes
    let index = 0
    childNodes.forEach((item) => {
      let tagName = item.tagName
      // console.log(tagName)
      if (tagName === undefined || !tocTags.includes(tagName.toUpperCase())) {
        return true
      } 
      index++
      let id = "toc" + index
      item.setAttribute("id", id)
      tocArray.value.push({
        id: id,
        title: item.innerText,
        level: Number.parseInt(tagName.substring(1)),
        offsetTop: item.offsetTop,
      })
    })
  })
}

//跳转到相应的锚点
const activeChorId = ref(null)
const gotoAnchor = (domId) => {
  activeChorId.value = domId
  const dom = document.querySelector('#'+domId)
  dom.scrollIntoView({
    behavior: "smooth",
    block: "start",
  })
}

//把目录的活跃样式与当前滚动条的位置同步
const listenerScroll = () => {
  let currentScrollTop = getScrollTop()
  //.some() 方法会遍历数组中的每一个元素，并对每个元素执行传入的回调函数
  //不会修改原数组
  tocArray.value.some((item, index) => {
    if (index < tocArray.value.length - 1 &&
      currentScrollTop >= tocArray.value[index].offsetTop &&
      currentScrollTop < tocArray.value[index + 1].offsetTop ||
      index == tocArray.value.length - 1 && 
      currentScrollTop < tocArray.value[index].offsetTop
    ) {
      activeChorId.value = item.id
      return true
    }
  })
}

//获取滚动条的位置
const getScrollTop = () => {
  let scrollTop =
    document.documentElement.scrollTop ||
    window.pageYOffset ||
    document.body.scrollTop
  return scrollTop
}

watch(
  () => userStore.loginUserInfo,
  (newV, oldV) => {
    currentUserInfo.value = newV || ''
  },
  {immediate: true, deep: true}
)

onMounted(() => {
  window.addEventListener("scroll", listenerScroll, false)
})

onUnmounted(() => {
  window.removeEventListener("scroll", listenerScroll, false)
})

//监听后台数据, 是否展示评论
// const showComment = ref(true)
// watch(
//   ()=> store.SysSetting,
//   (newValue, oldValue) => {
//     if (newValue) {
//       showComment.value = newValue.commentOpen
//     }
//   }
// )
</script>

<template>
  <div
  class="container-body article-detail-body"
  v-if="Object.keys(articleInfo).length > 0"
  :style="{width: proxy.globalInfo.bodyWidth + 'px'}">
  <!-- 板块导航 -->
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
    <!-- 详情 -->
    <div class="detail-container"
    :style="{width: proxy.globalInfo.bodyWidth - 300 + 'px'}">
      <div class="article-detail">
        <!-- 标题 -->
        <div class="title"
        >{{ articleInfo.title }}
        <el-tag v-if="articleInfo.status === 0">待审核</el-tag>
      </div>
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
              <router-link
              v-if="articleInfo.userId === currentUserInfo?.userId"
               :to="`/editPost/${articleInfo.articleId}`">
                <span class="iconfont icon-edit a-link">编辑</span>
              </router-link>
            </div>
          </div>
        </div>
        <!-- 文章详情 -->
        <div class="detail" id="detail" 
        v-html="articleInfo.content"></div>
        </div>
        <!-- 附件 -->
         <div class="attachment-panel" 
          v-if="articleInfo.attachment"
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
            <el-button type="primary" @click="downloadAttachment(attachment.fileId)">下载</el-button>
            </div>
          </div>
          </div>
          <!-- 评论 -->
           <div
            class="comment-panel"
            id="view-comment"
            >
            <CommentList 
            v-if="articleInfo.articleId"
            :articleId="articleInfo.articleId"
            :articleUserId="articleInfo.userId"
            @updateCommentCount="updateCommentCount"
            ></CommentList>
           </div>
      </div>
        <!-- 目录 -->
      <div class="toc-panel">
        <div class="toc-container">
          <div class="toc-title">目录</div>
          <div class="hiddenMouse">
            <div class="toc-list">
              <template v-if="tocArray.length === 0">
                <div class="no-toc">未解析到目录</div>
              </template>
              <template v-else>
                  <div v-for="toc in tocArray">
                  <span
                   class="toc-item"
                   :class="{'active': toc.id === activeChorId}"
                   :style="{'padding-left': toc.level * 10 + 'px'}"
                   @click="gotoAnchor(toc.id)"
                   >{{ toc.title }}</span>
                </div>
              </template>
            </div>
          </div>
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
          :class="{have_like: haveLike} "
          ></span>
        </div>
      </el-badge>
      <!-- 评论 -->
      <el-badge
      :value="articleInfo.commentCount"
      type="info"
      :offset="[-12,22]"
      :hidden="articleInfo.commentCount <= 0"
      >
        <div class="quick-item" @click="goToPosition('view-comment')">
          <span class="iconfont icon-comment"></span>
        </div>
      </el-badge>
      <!-- 附件 -->
      <div class="quick-item" @click="goToPosition('view-attachment')">
        <span class="iconfont icon-attachment"></span>
      </div>
      <!-- 图片预览 -->
       <ImageViewer 
       ref="imageViewerRef"
       :imageList="previewImageList"
       ></ImageViewer>
</div>
</template>

<style scoped>
.article-detail-body {
  position: relative;
  margin-top: 40px;
  padding-top: 23px;
  padding-bottom: 25px;
  .board-info {
    padding: 2px 6px;
    line-height: 30px;
    .iconfont {
      font-weight: bolder;
      margin: 0px 5px;
    }
  }
  .detail-container {
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
              font-size: 12px;
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
      padding: 20px;
    }
}
.quick-panel {
      position: fixed;
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
      .have_like {
        color: red;
      }
  }

  .toc-panel {
    position: absolute;
    top: 60px;
    right: 0px;
    width: 285px;
    .toc-container {
      position: fixed;
      margin: 5px 5px;
      width: 285px;
      background-color: #fff;
      .toc-title {
        border-bottom: 1px solid #ddd;
        padding: 10px;
      }
      .hiddenMouse {
          max-height: calc(100% - 30px);
          overflow: hidden;
          width: 285px;
          .toc-list {
            width: 303px;
            padding: 8px 0px 5px 10px;
            max-height: 500px;
            overflow: auto;
            .no-toc {
              text-align: center;
              color: #757474;
              line-height: 13px;
              font-size: 13px;
            }
            .toc-item {
              margin: 3px 0;
              cursor: pointer;
              display: block;
              line-height: 35px;
              overflow: hidden;
              text-overflow: ellipsis;
              color: #8d8c8c;
              font-size: 14px;
              border-radius: 3px;
              border-left: 2px solid #fff;
            }
            .toc-item:hover {
              color: #3f3f3f;
              border-radius: 0px;
              font-size: 15px;
              background-color: #f0eeee;
              border-left: 2px solid #8fc7d3;
            }
            .active {
              color: #3f3f3f;
              border-radius: 0px;
              font-size: 15px;
              background-color: #f0eeee;
              border-left: 2px solid #8fc7d3;
            }
         }
      }
    }
  }
</style>