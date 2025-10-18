import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/views/Layout/index.vue'
import ArticleList from '@/views/forum/ArticleList.vue'
import Search from '@/views/Search/Search.vue'
import Ucenter from '@/views/ucenter/Ucenter.vue'
import ArticleDetail from '@/views/forum/ArticleDetail.vue'
import EditPost from '@/views/forum/EditPost.vue'
import MessageList from '@/views/ucenter/MessageList.vue'
import { useUserStore } from '../store/index'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: "layout",
      component: Layout,
      children: [
        {
        path: '/',
        name: "所有文章",
        component: ArticleList,
        }, 
        {
          path: '/forum/:pBoardId',
          name: '一级板块',
          component: ArticleList,
        },
        {
          path: '/forum/:pBoardId/:boardId/',
          name: '二级板块',
          component: ArticleList,
        },
        {
          path: '/post/:articleId',
          name: '文章详情',
          component: ArticleDetail,
        },
        {
          path: '/newPost',
          name: '发布文章',
          component: EditPost,
        },
        {
          path: '/editPost/:articleId',
          name: '编辑文章',
          component: EditPost,
        },
        {
          path: '/user/:userId',
          name: '用户信息',
          component: Ucenter,
        },
        {
          path: '/user/message/:type',
          name: '消息中心',
          component: MessageList,
        },
        {
          path: '/search',
          component: Search,
        }]
    }, 
    {
      path: '/:pathMatch(.*)*',
      name: '404',
      component: ()=> import("@/views/ucenter/Error404.vue")
    },
  ]
},
)

//进去 '/user'中心后取消板块的选中
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  if (to.path.indexOf("/user") != -1) {
    userStore.activePboardId = -1
  }
  next()
})

export default router
