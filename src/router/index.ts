import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../views/Layout/index.vue'
import Home from '../views/Home/index.vue'
import Search from '../views/Search/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Layout,
      children: [
        {
        path: '',
        component: Home,
      }, {
        path: '/search',
        component: Search,
      }
    ]
    }
  ]
})

export default router