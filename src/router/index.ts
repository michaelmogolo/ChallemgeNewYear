import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path : '/',
      name : 'newYear',
      component : () => import('../views/HappyNewYear.vue')
    }
  ],
})

export default router
