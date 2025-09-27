<script setup>
import { getCurrentInstance,ref, onMounted, watch } from 'vue';
import ArticleItem from './ArticleItem.vue';
import { useRoute} from 'vue-router';
import { useUserStore } from '@/store';


const userStore = useUserStore()

const route = useRoute()
const {proxy} = getCurrentInstance()

const api = {
    loadArticle: "/forum/loadArticle",
}

//文章的所有数据
const articleListInfo = ref({})

//展示类型
const orderType = ref(0)
const changeOrderType = (type) => {
    orderType.value = type
    loadArticle() //更新页面
}

const pBoardId = ref(0)//一级板块
const boardId = ref(0)//二级板块


//更新渲染列表
const loadArticle = async () => {
    loading.value = true//正在加载
    let params = {
        pageNo: articleListInfo.value.pageNo,
        boardId: boardId.value,
        orderType: orderType.value,
        pBoardId: pBoardId.value,
    }
   let result = await proxy.Request({
       url: api.loadArticle,
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

onMounted(() => {
    loadArticle()
})

//二级路由变化
const subBoardList = ref([])
const setSubBoard = () => {
    subBoardList.value = userStore.getSubBoardList(pBoardId.value)
}

//监听路由变化
watch(
    [
      () => route.params.pBoardId,
      () => route.params.boardId,
    ],
    (newValue, oldValue) => {
        pBoardId.value = Number(route.params.pBoardId) || 0
        boardId.value = Number(route.params.boardId) || 0
        userStore.activeBoardId = boardId.value
        userStore.activePboardId = pBoardId.value
        setSubBoard()
        loadArticle() //更新页面
    },
    {immediate: true, deep: true})
</script>

<template>
    <div
     class="container-body article-list-body"
     :style="{width: proxy.globalInfo.bodyWidth + 'px'}">
     <!-- 二级板块 -->
      <div class="sub-board" v-if="pBoardId">
        <router-link 
            @click="boardId = 0"
            class="board-item" 
            :to="`/forum/${pBoardId}`"
            :class="{ 'active': boardId == 0 }"
        >全部</router-link>
        <router-link 
          v-for="board in subBoardList"
          :key="board.boardId"
          class="board-item"
          :class="{'active': boardId == board.boardId}"
          :to="`/forum/${board.pBoardId}/${board.boardId}`"
          >{{ board.boardName }}
        </router-link>
      </div>
        <div class="article-pannel">
            <div class="top-tab">
                <span class="tab" :class="{'active': orderType === 0}"
                 @click="changeOrderType(0)">热榜</span>
                <el-divider direction="vertical"></el-divider>
                <span :class="{'active': orderType === 1}"
                @click="changeOrderType(1)">发布时间</span>
                <el-divider direction="vertical"></el-divider>
                <span :class="{'active': orderType === 2}"
                @click="changeOrderType(2)">最新</span>
            </div>
            <div class="article-list">
                <DataList 
                :dataSource="articleListInfo"
                :loading="loading"
                noDataMsg="没有发现文章, 赶紧来发布一个吧"
                >
                    <template #default="{data}">
                        <ArticleItem :data="data" @loadData="loadArticle"></ArticleItem>
                    </template>
                </DataList>
            </div>
        </div>
    </div>

</template>

<style scoped>
.article-list-body {
    padding-top: 55px;
    .sub-board {
        margin-bottom: 8px;
        .board-item {
            background-color: #fff;
            border-radius: 15px;
            padding: 2px 10px;
            margin-right: 10px;
            color: #909090;
            cursor: pointer;
            font-size: 14px;
        }
        .board-item:hover {
            color: var(--link);
        }
        .active {
            background: var(--link);
            color: #fff;
        }
        .active:hover {
            color: #fff;
        }
    }
    .article-pannel {
        background-color: #fff;
        .top-tab {
            display: flex;
            align-items: center;
            padding: 6px;
            font-size: 15px;
            border-bottom: 1px solid #ddd;
            .tab {
                cursor: pointer;
            }
            .active {
                color: var(--link);
            }
        }
        .article-list {
            padding: 10px;
        }
    }
}

</style>