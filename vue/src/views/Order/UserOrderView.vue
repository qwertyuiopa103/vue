<!-- UserOrderView.vue -->
<template>
    <v-container>
      <v-card>
        <v-card-title>我的訂單</v-card-title>
        
        <v-card-text>
          <!-- 頁籤 -->
          <v-tabs
            v-model="currentTab"
            color="primary"
            align-tabs="center"
          >
          <v-tab value="allOrders">全部訂單</v-tab>
            <v-tab value="unpaid">未付款</v-tab>
            <v-tab value="inProgress">進行中</v-tab>
            <v-tab value="completed">完成</v-tab>
          </v-tabs>
  
          <!-- 表格 -->
          <v-table
            class="mt-4"
          >
            <thead>
              <tr>
                <th>訂單編號</th>
                <th>看護名字</th>
                <th>建立時間</th>
                <th>付款方式</th>
                <th>總金額</th>
                <th>狀態</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in filteredOrders" :key="order.orderId">
                <td>{{ order.orderId }}</td>
                <td>{{ order.caregiver.caregiverName }}</td>
                <td>{{ formatDate(order.orderDate) }}</td>
                <td>信用卡</td>
                <td>${{ formatPrice(order.totalPrice) }}</td>
                <td>{{ order.status }}</td>
              </tr>
              <tr v-if="filteredOrders.length === 0">
                <td colspan="5" class="text-center">目前沒有訂單</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </v-container>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import axios from 'axios';
  import Swal from 'sweetalert2';
  import { useRoute } from 'vue-router'

  const route = useRoute()
  const userID = route.params.userID
  // 當前選中的頁籤
  const currentTab = ref('allOrders');
  
  // 所有訂單數據
  const orders = ref([]);
  
  // 根據頁籤過濾訂單
  const filteredOrders = computed(() => {
    const statusMap = {
      'unpaid': '未付款',
      'inProgress': '進行中',
      'completed': '完成'
    };
    if (currentTab.value === 'allOrders') {
    return orders.value;
  }
    return orders.value.filter(order => order.status === statusMap[currentTab.value]);
  });
  
  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // 格式化價格
  const formatPrice = (price) => {
    return new Intl.NumberFormat('zh-TW').format(price);
  };
  
  // 獲取訂單數據
  const fetchOrders = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/orders/OrderByUser/${userID}`);
    orders.value = response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    Swal.fire({
      title: '錯誤',
      text: '無法載入訂單資料',
      icon: 'error'
    });
  }
}
  
  // 頁面載入時獲取數據
  onMounted(fetchOrders);
  </script>
  
  <style scoped>
  .v-table {
    margin-top: 1rem;
  }
  
  thead th {
    font-weight: bold;
    background-color: #f5f5f5;
  }
  
  tbody tr:hover {
    background-color: #f5f5f5;
  }
  
  .text-center {
    text-align: center;
  }
  </style>