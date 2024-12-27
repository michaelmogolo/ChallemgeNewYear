import { createRouter, createWebHistory } from 'vue-router'
import HappyNewYear from '../views/HappyNewYear.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path : '/',
      name : 'newYear',
      component : () => HappyNewYear
    }
  ],
})

export default router
