import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../views/Layout/index.vue'
import ArticleList from '../views/forum/ArticleList.vue'
import Search from '../views/Search/index.vue'
import Ucenter from '@/views/ucenter/ucenter.vue'
import ArticleDetail from '@/views/forum/ArticleDetail.vue'


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
          path: '/user/:userId',
          name: '用户信息',
          component: Ucenter,
        },
        {
          path: '/search',
          component: Search,
        }
    ]
    }
  ]
})

export default router