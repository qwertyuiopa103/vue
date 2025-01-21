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
          name: "eventDetail_view",
          path: "event/detail",
          component: () => import("@/views/EventAdmin/EventDetails.vue"),
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
        {
          name: "eventAll_view",
          path: "events",
          component: () => import("@/views/EventHome/EventAll.vue"),
        },
        {
          name: "event_view",
          path: "event",
          component: () => import("@/views/EventHome/EventGet.vue"),
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
