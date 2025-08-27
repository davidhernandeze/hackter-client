import { createRouter, createWebHistory } from 'vue-router'
import Game from '@/views/Game.vue'
import Login from '@/views/Login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login,
    },
    {
      path: '/play',
      name: 'play',
      component: Game,
    }
  ],
})

export default router
