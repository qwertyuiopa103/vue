<template>
  <v-container>
    <v-card>
      <v-card-title><strong>我的訂單</strong></v-card-title>

      <v-card-text>
        <v-tabs v-model="currentTab" color="primary" align-tabs="center">
          <v-tab value="all">全部</v-tab>
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
                  <v-col cols="1.5" class="text-subtitle-1">{{ order.caregiver.user.userName }}</v-col>
                  <v-col cols="1.5" class="text-subtitle-1">{{ formatDate(order.orderDate) }}</v-col>
                  <v-col cols="1.5" class="text-subtitle-1">{{ order.paymentMethod }}</v-col>
                  <v-col cols="1.5" class="text-subtitle-1">${{ formatPrice(order.totalPrice) }}</v-col>
                  <v-col cols="1.5" class="text-subtitle-1">{{ order.status }}</v-col>
                  <v-col cols="1.5" class="d-flex justify-start">
                    <!-- 按鍵-->
                    <template v-if="order.status === '未付款'">
                      <v-btn color="green" @click.stop="goToPaymentPage(order)" class="circle-btn">
                        <v-icon>mdi-credit-card-outline</v-icon>
                      </v-btn>
                    </template>
                    <template v-if="order.status == '付款完成'">
                      <v-btn color="red" @click.stop="openCancelDialog(order)" class="circle-btn ml-2">
                        <v-icon>mdi-skull-crossbones</v-icon>
                      </v-btn>
                    </template>
                    <template v-if="order.status == '未付款'">
                      <v-btn @click.stop="openCancelUnpaidDialog(order)" class="circle-btn ml-2">
                        <v-icon>mdi-cancel</v-icon>
                      </v-btn>
                    </template>

                    <template v-if="order.status === '已取消'">
                      <v-btn @click="cancelOrder(order)" icon class="ml-2">
                        <v-icon>mdi-file-cancel</v-icon>
                      </v-btn>
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
    <!-- 當 showCancelDetail 為 true 時顯示 CancelOrderDetail 組件，並將選中的訂單 ID 傳遞給它 -->

    <CancelOrderDetail v-if="showCancelDetail" :orderId="selectedOrderId" @close="showCancelDetail = false" />
  </v-container>

  <CancelOrderForm ref="cancelOrderForm" @order-cancelled="fetchOrders" />
  <CancelForUnpay ref="cancelforunpay" @order-cancelled="fetchOrders" />


</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useRoute, useRouter } from 'vue-router';
import Timeline from '@/components/Order/Timeline.vue';
import CancelOrderForm from '@/components/Order/CancelOrderForm.vue';
import CancelOrderDetail from '@/components/Order/CancelDetail.vue';
import CancelForUnpay from '@/components/Order/CancelForUnpay.vue'
const route = useRoute();
const userID = route.params.userID;
const router = useRouter();
const currentTab = ref('all');
const orders = ref([]);
const cancelOrderForm = ref(null);
const cancelforunpay = ref(null);
// 查看取消訂單詳情
const cancelOrder = (item) => {
  selectedOrderId.value = item.orderId;
  showCancelDetail.value = true;
};
const showCancelDetail = ref(false);
const selectedOrderId = ref(null);

const openCancelUnpaidDialog = (selectedOrder) => {
  console.log("Opening cancel dialog for unpaid order:", selectedOrder);
  if (cancelforunpay.value) {
    cancelforunpay.value.openDialog(selectedOrder);
  }
};

const filteredOrders = computed(() => {
  if (!orders.value) return [];
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
  const currentTime = new Date();

  const steps = [
    {
      title: '訂單建立',
      date: order.orderDate,
      completed: new Date(order.orderDate) <= currentTime
    },
    {
      title: '服務開始',
      date: order.startDate,
      completed: new Date(order.startDate) <= currentTime
    },
    {
      title: '服務結束',
      date: order.endDate,
      completed: new Date(order.endDate) <= currentTime
    },
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
const openCancelDialog = (selectedOrder) => {
  console.log("Opening cancel dialog for order:", selectedOrder);
  if (cancelOrderForm.value) {
    cancelOrderForm.value.openDialog(selectedOrder);
  }
};
const fetchOrders = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/orders/OrderByUser`);
    orders.value = response.data || [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    orders.value = [];
    Swal.fire({
      title: '錯誤',
      text: '無法載入訂單資料',
      icon: 'error'
    });
  }
};

const goToPaymentPage = (order) => {
  setTimeout(() => {
    // 儲存訂單資料到 sessionStorage
    sessionStorage.setItem('orderToPay', JSON.stringify(order));
    // 跳轉到付款頁面
    router.push({ name: 'order_Pay_Home' });
  }, 500); // 延遲500毫秒
};


onMounted(fetchOrders);
</script>

<style>
.circle-btn {
  width: 40px;
  /* 設定寬度 */
  height: 40px !important;
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