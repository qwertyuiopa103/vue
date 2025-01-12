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
          name: "post_view",
          path: "test",
          component: () => import("@/views/UserAdmin/test.vue"),
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
          name: "userCreat_view",
          path: "userCreat",
          component: () => import("@/views/UserHome/UserCreat.vue"),
        },
        {
          name: "userProfile_view",
          path: "userProfile",
          component: () => import("@/views/UserHome/UserProfile.vue"),
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

    //   {
    //     name: "admin_layout",
    //     path: "/admin",
    //     component: () => import("@/layouts/AdminLayout.vue")
    // },
  ],
})

export default router
