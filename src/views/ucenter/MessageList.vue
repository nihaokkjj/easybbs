<script setup>
import { getCurrentInstance,
        nextTick,
        onMounted,
        ref ,
        watch,
      } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/store';
import { messageStore } from '@/store/message';

const {proxy} = getCurrentInstance()
const userStore = useUserStore()
const msgStore = messageStore()

const router = useRouter()
const route = useRoute()

const userId = ref(userStore.loginUserInfo?.userId || '')
console.log(userId.value, 'userId', typeof userId.value)
const api = {
  loadMessageList: "/ucenter/loadMessageList",
}

const activeTagName = ref('reply')
const changeTab = (tab) => {
  activeTagName.value = tab
  router.push(`/user/message/${tab}`)
  loadMessage()
}

const messageCountInfo = ref({})

//消息列表
const messageListInfo = ref([])
const loading = ref(false)
const loadMessage = async () => {
  loading.value = true

  let params = {
    pageNo: messageListInfo.value.pageNo,
    code: activeTagName.value
  }
  let result = await proxy.Request({
    url: api.loadMessageList,
    params: params
  })
  loading.value = false
  if (!result) {
    return
  }
  messageListInfo.value = result.data
  msgStore.readMessage(activeTagName.value)
}

//监听消息数量
	watch(
		() => msgStore.messageCountInfo,
		(newValue, oldValue) => {
			messageCountInfo.value = newValue || {}
		},
		{
			immediate: true, deep: true,
		}
	)

  onMounted(() => {
    loadMessage()
  })

</script>

<template>
  <div class="message">
    <div
      class="container-body message-body"
      :style="{width: proxy.globalInfo.bodyWidth + 'px'}"
      >
      <div class="msg-banner">
        <router-link to="/" class="a-link">首页</router-link>
        <span class="iconfont icon-right">消息中心</span>
      </div>
      <div class="message-panel">
        <div class="message-tab">
          <el-tabs
          :model-value="activeTagName"
          @tab-change="changeTab"
          >
          <el-tab-pane name="reply">
            <template #label>
              <div class="tab-item">
                <span
                  v-if="messageCountInfo.reply > 0"
                  class="count-tag"
                  >{{
                  messageCountInfo.reply > 99
                    ? '99+'
                    : messageCountInfo.reply
                }}</span>
                <span>回复我的</span>
              </div>
            </template>
          </el-tab-pane>
          <el-tab-pane name="likePost">
            <template #label>
              <div class="tab-item">
                <span
                  v-if="messageCountInfo.likePost > 0"
                  class="count-tag"
                  >{{
                  messageCountInfo.likePost > 99
                    ? '99+'
                    : messageCountInfo.likePost
                }}</span>
                <span>赞了我的文章</span>
              </div>
            </template>
          </el-tab-pane>
          <el-tab-pane name="downloadAttachment">
            <template #label>
              <div class="tab-item">
                <span
                  v-if="messageCountInfo.downloadAttachment > 0"
                  class="count-tag"
                  >{{
                  messageCountInfo.downloadAttachment > 99
                    ? '99+'
                    : messageCountInfo.downloadAttachment
                }}</span>
                <span>下载了我的附件</span>
              </div>
            </template>
          </el-tab-pane>
          <el-tab-pane name="likeComment">
            <template #label>
              <div class="tab-item">
                <span
                  v-if="messageCountInfo.likeComment > 0"
                  class="count-tag"
                  >{{
                  messageCountInfo.likeComment > 99
                    ? '99+'
                    : messageCountInfo.likeComment
                }}</span>
                <span>赞了我的评论</span>
              </div>
            </template>
          </el-tab-pane>
          <el-tab-pane name="sys">
            <template #label>
              <div class="tab-item">
                <span
                  v-if="messageCountInfo.sys > 0"
                  class="count-tag"
                  >{{
                  messageCountInfo.sys > 99
                    ? '99+'
                    : messageCountInfo.sys
                }}</span>
                <span>系统消息</span>
              </div>
            </template>
          </el-tab-pane>
        </el-tabs>
        <router-link :to="`/user/${userId}`" class="user a-link">
          &lt;&lt;个人中心</router-link>
        </div>
        <div class="message-list">
          <DataList 
            :dataSource="messageListInfo"
            :loading="loading"
            @loadData="loadMessage"
            noDataMsg="暂无消息"
            >
              <template #default="{data}">
                <!-- 系统消息 -->
                  <div
                  v-if="data.messageType === 0"
                  class="message-item">
                    <div class="message-content">
                      <span v-html="data.messageContent"></span>
                      <span class="create-time">{{ data.createTime }}</span>
                    </div>
                  </div>
                  <!-- 回复我的 -->
                  <div
                  v-if="data.messageType === 1"
                  class="message-item">
                  <Avatar :userId="data.sendUserId" :width="40"></Avatar>
                    <div class="message-content">
                      <div>
                        <router-link
                         class="a-link"
                         :to="`/user/${data.sendUserId}`">
                          @{{ data.sendNickName }}
                        </router-link>
                        对我的文章<<
                          <router-link
                           class="a-link"
                           :to="`/post/${data.articleId}`"
                           >{{ data.articleTitle }}</router-link>
                          >>发表了评论
                        <span class="create-time">{{ data.createTime }}</span>
                      </div>
                      <div class="reply-content" v-html="data.messageContent"></div>
                    </div>
                  </div>
                  <!-- 赞了我的评论 -->
                  <div
                  v-if="data.messageType === 3"
                  class="message-item">
                  <Avatar :userId="data.sendUserId" :width="40"></Avatar>
                    <div class="message-content">
                      <div>
                        <router-link
                         class="a-link"
                         :to="`/user/${data.sendUserId}`">
                          @{{ data.sendNickName }}
                        </router-link>
                         在文章<<
                          <router-link
                           class="a-link"
                           :to="`/post/${data.articleId}`"
                           >{{ data.articleTitle }}</router-link>
                          >>中赞了我的评论
                        <span class="create-time">{{ data.createTime }}</span>
                      </div>
                      <div class="reply-content" v-html="data.messageContent"></div>
                    </div>
                  </div>
                  <!-- 赞了我的文章-->
                  <div
                  v-if="data.messageType === 2"
                  class="message-item">
                  <Avatar :userId="data.sendUserId" :width="40"></Avatar>
                    <div class="message-content">
                        <router-link
                         class="a-link"
                         :to="`/user/${data.sendUserId}`">
                          @{{ data.sendNickName }}
                        </router-link>
                         赞了我的文章<<
                          <router-link
                           class="a-link"
                           :to="`/post/${data.articleId}`"
                           >{{ data.articleTitle }}</router-link>
                          >>
                        <span class="create-time">{{ data.createTime }}</span>
                    </div>
                  </div>
                  <!-- 下载了附件 -->
                  <div
                  v-if="data.messageType === 4"
                  class="message-item">
                  <Avatar :userId="data.sendUserId" :width="40"></Avatar>
                    <div class="message-content">
                        <router-link
                         class="a-link"
                         :to="`/user/${data.sendUserId}`">
                          @{{ data.sendNickName }}
                        </router-link>
                         在文章<<
                          <router-link
                           class="a-link"
                           :to="`/post/${data.articleId}`"
                           >{{ data.articleTitle }}</router-link>
                          >>中下载了我的附件
                        <span class="create-time">{{ data.createTime }}</span>
                    </div>
                  </div>
              </template>
            </DataList>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .message {
    margin-top: 60px;
    .message-body {
      .msg-banner {
        padding: 10px;
        .icon-right {
          color: rgb(136, 136, 136);
        }
        .iconfont::before {
          margin: 0px 10px;
        }
      }
      .message-panel {
        background: #fff;
        padding: 10px;
        .message-tab {
          position: relative;
          .tab-item {
            position: relative;
            padding: 0px 15px;
            .count-tag {
              position: absolute;
              right: -15px;
              top: -8px;
              font-size: 10px;
              width: 18px;
              height: 18px;
              border-radius: 50%;
              text-align: center;
              line-height: 18px;
              color: #fff;
              background: rgba(233, 81, 44, 0.726);
            }
          }
          .user {
            top: 8px;
            right: 20px;
            position: absolute;
          }
        }
        .message-list {
          .message-item {
            display: flex;
            align-items: center;
            font-size: 14px;
            justify-content: start;
            padding-bottom: 5px;
            border-bottom: 1px solid #ddd;
            .message-content {
              margin-left: 10px;
              .create-time {
                font-size: 13px;
                 color: #9ba7b9;
                 margin-left: 10px;
              }
              .reply-content {
                margin: 5px;
                padding-left: 5px;
                border-left: 2px solid rgb(94, 175, 221);
              }
            }
          }
        }
      }
    }
  }
</style>