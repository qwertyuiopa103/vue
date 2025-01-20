import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore';
import jwtDecode from 'jwt-decode';
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
        {
          name: "order_Userview",
          path: "UserOrderView",
          component: () => import("@/views/Order/UserOrderView.vue"),
        },
        {
          name: "order_Pay_Home",
          path: "order/pay",
          component: () => import("@/views/Order/OrderPay.vue"),
        },

        {
          name: "reserve_calendar",
          path: "reserve/calendar",
          component: () => import("@/views/Reserve/ReserveCalendar.vue"),
        },
        {
          name: "caregiver_calendar",
          path: "caregiver/calendar",
          component: () => import("@/views/Reserve/CaregiverCalendar.vue"),
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

  // 如果有 Token，檢查是否過期
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000); // 當前時間（秒）

      if (decodedToken.exp && decodedToken.exp < currentTime) {
        console.log('Token 已過期');
        authStore.logout(); // 執行登出操作
        return next({ path: '/home' }); // 重定向到登入頁
      }
    } catch (error) {
      console.error('Token 解碼失敗:', error);
      authStore.logout(); // 執行登出操作
      return next({ path: '/home' }); // 重定向到登入頁
    }
  }

  // 如果進入 admin 區域，檢查角色
  if (to.path.startsWith('/admin')) {
    if (!token) {
      return next({ path: '/adminlogin' }); // 沒有 Token，重定向
    }

    if (authStore.role !== 'ROLE_ADMIN') {
      return next({ path: '/adminlogin' }); // 角色不符，重定向
    }
  }

  // 檢查需要身份驗證的路由
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!token) {
      return next({ path: '/home' }); // 沒有 Token，跳轉到首頁
    }
  }

  // 預設放行
  next();
});
export default router
