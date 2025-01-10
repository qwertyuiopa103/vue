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
        {
          name: "reserve_home",
          path: "reserve",
          component: () => import("@/views/Reserve/ReserveHome.vue"),
        },
        {
          name: "reserve_search",
          path: "reserve/search",
          component: () => import("@/views/Reserve/ReserveSearch.vue"),
        },
        {
          name: "reserve_insert",
          path: "reserve/insert",
          component: () => import("@/views/Reserve/ReserveInsert.vue"),
        },

      ]
    },
    {
      name: "Home_layout",
      path: "/home",
      component: () => import("@/layouts/HomeLayout.vue"),
      children: [
        {
          name: "userCreat_view",
          path: "userCreat",
          component: () => import("@/views/UserHome/UserCreat.vue"),
        },
      ]
    },


    //   {
    //     name: "login_layout",
    //     path: "/login",
    //     component: () => import("@/layouts/LoginLayout.vue")
    //   },

    //   {
    //     name: "admin_layout",
    //     path: "/admin",
    //     component: () => import("@/layouts/AdminLayout.vue")
    // },
  ],
})

export default router
