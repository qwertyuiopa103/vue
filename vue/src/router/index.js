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
          name: "order_view",
          path: "orderView",
          component: () => import("@/views/Order/OrderBackView.vue"),
        },
        {
          name: "order_Pay_admin",
          path: "order/pay",
          component: () => import("@/views/Order/OrderPay.vue"),
        },
        {
          name: "order_Pay_return",
          path: "order/return",
          component: () => import("@/views/Order/Return.vue"),
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
          name: "order_Userview",
          path: "UserOrderView/:userID",
          component: () => import("@/views/Order/UserOrderView.vue"),
        },
        {
          name: "order_Pay_Home",
          path: "order/pay",
          component: () => import("@/views/Order/OrderPay.vue"),
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
