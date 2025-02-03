<!-- http://localhost:5173/#/home/UserOrderView/USR0001 -->
<template>
  <v-container>
    <v-card>
      <v-card-title>我的訂單</v-card-title>

      <v-card-text>
        <v-tabs v-model="currentTab" color="primary" align-tabs="center">
          <v-tab value="all">全部</v-tab>
          <v-tab value="unconfirmed">待確認</v-tab>
          <v-tab value="unpaid">未付款</v-tab>
          <v-tab value="paid">付款完成</v-tab>
          <v-tab value="failed">付款失敗</v-tab>
          <v-tab value="cancelled">已取消</v-tab>
        </v-tabs>

        <div class="mt-4">
          <v-row no-gutters class="header-row mb-2">
            <v-col cols="1.5" class="text-subtitle-1 font-weight-bold">訂單編號</v-col>
            <v-col cols="1.5" class="text-subtitle-1 font-weight-bold">看護名字</v-col>
            <v-col cols="1.5" class="text-subtitle-1 font-weight-bold">建立時間</v-col>
            <v-col cols="1.5" class="text-subtitle-1 font-weight-bold">付款方式</v-col>
            <v-col cols="1.5" class="text-subtitle-1 font-weight-bold">總金額</v-col>
            <v-col cols="1.5" class="text-subtitle-1 font-weight-bold">狀態</v-col>
            <v-col cols="1.5" class="text-subtitle-1 font-weight-bold">操作</v-col>
          </v-row>

          <v-expansion-panels>
            <v-expansion-panel v-for="order in filteredOrders" :key="order.orderId" class="mb-4">
              <v-expansion-panel-title>
                <v-row no-gutters>
                  <v-col cols="1.5" class="text-subtitle-1">{{ order.orderId }}</v-col>
                  <v-col cols="1.5" class="text-subtitle-1">{{ order.caregiver.caregiverName }}</v-col>
                  <v-col cols="1.5" class="text-subtitle-1">{{ formatDate(order.orderDate) }}</v-col>
                  <v-col cols="1.5" class="text-subtitle-1">{{ order.paymentMethod }}</v-col>
                  <v-col cols="1.5" class="text-subtitle-1">${{ formatPrice(order.totalPrice) }}</v-col>
                  <v-col cols="1.5" class="text-subtitle-1">{{ order.status }}</v-col>
                  <v-col cols="1.5" class="d-flex justify-start">
                    <!-- 如果是未付款的訂單顯示操作按鈕 -->
                    <template v-if="order.status === '未付款'">
                      <v-btn color="green" @click="goToPaymentPage(order)" class="circle-btn">
                        <v-icon>mdi-credit-card-outline</v-icon>
                      </v-btn>
                      <v-btn @click="cancelOrder(order)" class="circle-btn">
                        <v-icon>mdi-cancel</v-icon>
                      </v-btn>

                    </template>
                    <template v-else>
                      <!-- 其他狀態不顯示操作按鈕 -->
                    </template>
                  </v-col>
                </v-row>
              </v-expansion-panel-title>

              <v-expansion-panel-text>
                <v-card flat>
                  <v-card-text>
                    <!-- 使用 Timeline 組件 -->
                    <Timeline :timelineSteps="getTimelineSteps(order)" />
                  </v-card-text>
                </v-card>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <v-card v-if="filteredOrders.length === 0" flat class="text-center pa-4">
            目前沒有訂單
          </v-card>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>



<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useRoute, useRouter } from 'vue-router';
import Timeline from '@/components/Order/Timeline.vue';
//接入UserID
const route = useRoute();
const userID = route.params.userID;

const router = useRouter();
const currentTab = ref('all');
const orders = ref([]);

const filteredOrders = computed(() => {
  const statusMap = {
    'unconfirmed': '待確認',
    'unpaid': '未付款',
    'paid': '付款完成',
    'failed': '付款失敗',
    'cancelled': '已取消'
  };

  if (currentTab.value === 'all') {
    return orders.value;
  }

  return orders.value.filter(order => order.status === statusMap[currentTab.value]);
});

const getTimelineSteps = (order) => {
  const steps = [
    { title: '訂單建立', date: order.orderDate, completed: new Date(order.orderDate) <= new Date() },
    { title: '服務開始', date: order.startDate, completed: new Date(order.startDate) <= new Date() },
    { title: '服務結束', date: order.endDate, completed: new Date(order.endDate) <= new Date() },
  ];
  return steps;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('zh-TW').format(price);
};

const fetchOrders = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/orders/OrderByUser`);
    orders.value = response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    Swal.fire({
      title: '錯誤',
      text: '無法載入訂單資料',
      icon: 'error'
    });
  }
};

const goToPaymentPage = (order) => {
  console.log("抓取的訂單資料:", order);
  setTimeout(() => {
    // 儲存訂單資料到 sessionStorage
    sessionStorage.setItem('orderToPay', JSON.stringify(order));
    // 跳轉到付款頁面
    router.push({ name: 'order_Pay_Home' });
  }, 500); // 延遲500毫秒
};

const cancelOrder = (order) => {
  Swal.fire({
    title: '確定要取消訂單嗎?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '確定',
    cancelButtonText: '取消'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.put(`http://localhost:8080/orders/${order.orderId}/cancel`);
        fetchOrders();  // 重新載入訂單資料
        Swal.fire('訂單已取消', '', 'success');
      } catch (error) {
        Swal.fire('取消失敗', '無法取消訂單', 'error');
      }
    }
  });
};

onMounted(fetchOrders);
</script>
<style>
.circle-btn {
  width: 40px;
  /* 設定寬度 */
  height: 40px;
  /* 設定高度 */
  border-radius: 50% !important;
  /* 強制設置為圓形 */
  padding: 0;
  /* 去除內邊距 */
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 45px;
  /* 確保不會過小 */
}

.v-btn .v-icon {
  font-size: 24px;
  /* 設定圖標大小 */
}
</style>