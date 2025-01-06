import { createRouter, createWebHistory } from 'vue-router'

import IndexPage from '@/pages/IndexPage.vue'

const routes = [
  {
    path: '/idle-packs',
    component: IndexPage,
    meta: {
      title: 'Idle Packs',
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
