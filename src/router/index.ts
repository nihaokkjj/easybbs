import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../store/index' // 使用别名，更健壮


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: "layout",
      // 动态导入 Layout
      component: () => import('@/views/Layout/index.vue'),
      children: [
        {
        path: '/',
        name: "所有文章",
        // 动态导入 ArticleList
        component: () => import('@/views/forum/ArticleList.vue'),
        }, 
        {
          path: '/forum/:pBoardId',
          name: '一级板块',
          // 动态导入 ArticleList
          component: () => import('@/views/forum/ArticleList.vue'),
        },
        {
          path: '/forum/:pBoardId/:boardId/',
          name: '二级板块',
          // 动态导入 ArticleList
          component: () => import('@/views/forum/ArticleList.vue'),
        },
        {
          path: '/post/:articleId',
          name: '文章详情',
          // 动态导入 ArticleDetail
          component: () => import('@/views/forum/ArticleDetail.vue'),
        },
        {
          path: '/newPost',
          name: '发布文章',
          // 动态导入 EditPost
          component: () => import('@/views/forum/EditPost.vue'),
        },
        {
          path: '/editPost/:articleId',
          name: '编辑文章',
          // 动态导入 EditPost
          component: () => import('@/views/forum/EditPost.vue'),
        },
        {
          path: '/user/:userId',
          name: '用户信息',
          component: () => import('@/views/ucenter/ucenter.vue'),
        },
        {
          path: '/user/message/:type',
          name: '消息中心',
          // 动态导入 MessageList
          component: () => import('@/views/ucenter/MessageList.vue'),
        },
        {
          path: '/search',
          // 动态导入 Search
          component: () => import('@/views/Search/Search.vue'),
        }]
    }, 
    {
      path: '/:pathMatch(.*)*',
      name: '404',
      component: ()=> import("@/views/ucenter/Error404.vue")
    },
  ]
}
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