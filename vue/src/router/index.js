import { createRouter, createWebHashHistory } from 'vue-router'

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
          name: "userDetail_view",
          path: "user/:id",
          component: () => import("@/views/UserAdmin/UserDetail.vue"),
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
      ]
    },


    {
      name: "register_layout",
      path: "/register",
      component: () => import("@/layouts/RegisterLayout.vue")
    },


    {
      name: "login_layout",
      path: "/login",
      component: () => import("@/layouts/LoginLayout.vue")
    },

    {
      name: "adminlogin_layout",
      path: "/adminlogin",
      component: () => import("@/layouts/AdminLoginLayout.vue")
    },
  ],
})
// 添加全局導航守衛
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');

  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 如果路由需要驗證，檢查 token 是否存在
    if (!token) {
      next({ path: '/home' }); // 重定向到首頁
    } else {
      next(); // 放行
    }
  } else {
    next(); // 放行
  }
});

export default router
