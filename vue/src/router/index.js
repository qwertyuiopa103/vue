import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore';
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [

    {
      name: "admin_layout",
      path: "/admin",
      component: () => import("@/layouts/AdminLayout.vue"),
      children: [
        {
          name: "userAll_view",
          path: "user",
          component: () => import("@/views/UserAdmin/UserAll.vue"),
        },
        {
          name: "user_view",
          path: "userOne/:id",
          component: () => import("@/views/UserAdmin/User.vue"),
        },
      ]
    },
    {
      name: "Home_layout",
      path: "/home",
      component: () => import("@/layouts/HomeLayout.vue"),
      children: [
        {
          name: "default_view", // 預設的子頁面名稱
          path: "", // 默認子路由，當訪問 `/home` 時自動加載
          component: () => import("@/views/Home/Home.vue"),
        },
        {
          name: "userProfile_view",
          path: "userProfile",
          component: () => import("@/views/UserHome/UserProfile.vue"),
          meta: { requiresAuth: true },
        },
        {
          name: "userRegister_view",
          path: "userRegister",
          component: () => import("@/views/UserHome/UserRegister.vue"),
        },
        {
          name: "userLogin_view",
          path: "userLogin",
          component: () => import("@/views/UserHome/UserLogin.vue"),
        },
        {
          name: "userMail_view",
          path: "userMail",
          component: () => import("@/views/UserHome/UserMail.vue"),
        },
        {
          name: "userPassword_view",
          path: "userPassword",
          component: () => import("@/views/UserHome/UserPassword.vue"),
        },
        {
          name: "userChangePassword_view",
          path: "userChangePassword/:token",
          component: () => import("@/views/UserHome/UserChangePassword.vue"),
        },
      ]
    },

    {
      name: "adminlogin_layout",
      path: "/adminlogin",
      component: () => import("@/layouts/AdminLoginLayout.vue")
    },
  ],
})


router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const token = localStorage.getItem('token');
  if (to.path === '/adminlogin') {
    return next();
  }

  // 如果進入 admin 區域，檢查角色
  if (to.path.startsWith('/admin')) {
    if (!token) {
      // 如果沒有 token，重定向到後台登錄頁
      return next({ path: '/adminlogin' });
    }

    // 如果有 token，但角色不是 admin
    if (authStore.role !== 'ROLE_ADMIN') {
      return next({ path: '/adminlogin' });
    }
  }

  // 檢查需要身份驗證的路由
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!token) {
      return next({ path: '/home' }); // 沒有 token，跳轉到首頁
    }
  }

  // 預設放行
  next();
});

export default router
