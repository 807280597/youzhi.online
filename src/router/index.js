import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  // 前台路由
  {
    path: '/',
    component: () => import('@/components/frontend/FrontLayout.vue'),
    children: [
      { path: '', name: 'Home', component: () => import('@/views/frontend/Home.vue') },
      { path: 'products', name: 'ProductList', component: () => import('@/views/frontend/ProductList.vue') },
      { path: 'products/:id', name: 'ProductDetail', component: () => import('@/views/frontend/ProductDetail.vue') }
    ]
  },
  // 登录页（独立，不在 AdminLayout 内）
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/views/admin/AdminLogin.vue'),
    meta: { public: true }
  },
  // 后台路由（需要登录）
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', name: 'Dashboard', component: () => import('@/views/admin/Dashboard.vue') },
      { path: 'home-config', name: 'HomeConfig', component: () => import('@/views/admin/HomeConfig.vue') },
      { path: 'products', name: 'ProductManage', component: () => import('@/views/admin/ProductManage.vue') },
      { path: 'products/new', name: 'ProductEdit', component: () => import('@/views/admin/ProductEdit.vue') },
      { path: 'products/:id/edit', name: 'ProductEditById', component: () => import('@/views/admin/ProductEdit.vue') },
      { path: 'categories', name: 'CategoryManage', component: () => import('@/views/admin/CategoryManage.vue') },
      { path: 'contact', name: 'ContactConfig', component: () => import('@/views/admin/ContactConfig.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

// 路由守卫：未登录访问后台 → 跳转登录页
router.beforeEach((to) => {
  const isLoggedIn = sessionStorage.getItem('ps_admin_logged_in') === 'true'

  if (to.meta.requiresAuth && !isLoggedIn) {
    return { path: '/admin/login', query: { redirect: to.fullPath } }
  }
  // 已登录时访问登录页 → 跳转后台
  if (to.name === 'AdminLogin' && isLoggedIn) {
    return { path: '/admin/dashboard' }
  }
})

export default router
