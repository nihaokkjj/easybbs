<script setup>
    const props = defineProps({
        data: {
            type: Object,
        }
    })
</script>

<template>
    <div class="article-item">
        <div class="article-item-inner">
            <div class="article-body">
                <div class="user-info">
                    <Avatar :userId="data.userId" :width="30"></Avatar>
                    <router-link :to="'/user/' + data.userId" 
                    class="link-info">{{ data.nickName }}</router-link>
                    <el-divider direction="vertical"></el-divider>
                    <div class="post-time">{{ data.postTime }}</div>
                    <div class="address">&nbsp;.&nbsp;{{ data.userIpAddress }}</div>
                    <el-divider direction="vertical"></el-divider>
                   <router-link :to="`/forum/${data.pBoardId}`" 
                   class="link-info">{{ data.pBoardName }}</router-link>
                   <template v-if="data.boardName">
                    <span>&nbsp;/&nbsp;</span>
                    <router-link :to="`/forum/${data.pBoardId}/${data.boardId}`"
                    class="link-info"
                    >{{ data.boardName }}</router-link>
                   </template> 
                </div>
                <router-link :to="`/post/${data.articleId}`" class="title-info">
                    <span v-if="data.topType === 1" class="top">置顶</span>
                    <span class="title">{{ data.title }}</span>
                </router-link>
                <div class="summary">{{ data.summary }}</div>
                <div class="article-info">
                    <span class="iconfont icon-eye-solid">
                        {{ data.readCount === 0 ? "阅读" : data.readCount }}
                    </span>
                    <span class="iconfont icon-good">
                        {{ data.goodCount === 0 ? "点赞" : data.goodCount }}
                    </span>
                    <span class="iconfont icon-comment">
                        {{ data.commentCount === 0 ? "评论" : data.commentCount }}
                    </span>
                </div>
            </div>
            <router-link 
            :to="`/post/${data.articleId}`" >
                <Cover :cover="data.cover"></Cover>
            </router-link>
        </div>
    </div>
</template>

<style scoped>
.article-item {
    padding: 10px 15px;
    .article-item-inner {
        border-bottom: 2px solid #ddd;
        padding: 8px 2px;
        display: flex;
        .article-body {
            flex: 1;
            .user-info {
                display: flex;
                align-items: center;
                font-size: 14px;
                .address {
                    font-size: 13px;
                    margin-left: 5px;
                    color: #757373;
                }
                .link-info {
                    margin-left: 5px;
                    color: #757373;
                }
                .link-info:hover {
                   color: var(--link); 
                    text-decoration: none;
                }
                .post-time {
                    font-size: 13px;
                    color: #9e9b9b;
                }
            }
            .title-info {
                color: rgb(77, 76, 76);
                font-weight: bold;
                font-size: 16px;
                margin: 10px 0; 
                display: inline-block; 
                align-items: center;
                /* 需要修改为块级, 否则间距不生效 */
                text-decoration: none;
                .top {
                    font-weight: normal;
                    font-size: 12px;
                    border-radius: 5px;
                    border: 1px solid var(--pink);
                    color: var(--pink);
                    padding: 1px 5px;
                    margin-right: 3px;
                }
                .title {
                    font-weight: bold;
                    font-size: 16px;
                    margin: 10px 0; 
                }
            }
            .summary {
                color: #757373;
                font-size: 14px;
            }
            .article-info {
                margin-top: 10px;
                display: flex;
                align-items: center;
                font-size: 13px;
                color: #757373;
                .iconfont {
                    margin-right: 25px;
                    margin-left: 5px;
                }
                .iconfont::before {
                    margin-right: 5px;
                }
            }
        }
    }
}

.article-item-inner:hover {
    background: #f3f4f5;
}
</style>