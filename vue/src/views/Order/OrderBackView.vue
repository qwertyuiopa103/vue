<!-- http://localhost:5173/#/admin/orderView -->
<template>
  <v-container>
    <v-tabs v-model="activeTab" background-color="primary" dark>
      <v-tab value="orders">訂單管理</v-tab>
      <v-tab value="analysis">訂單分析</v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <!-- 訂單管理頁籤 -->
      <v-window-item value="orders">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">

            <div>
              <v-btn color="primary" @click="quickAddOrder" class="mr-2">快速新增</v-btn>
              <v-btn color="primary" @click="openCreateDialog" class="mr-2">新增訂單</v-btn>
              
            </div>
          </v-card-title>

          <v-card-text>
            <div class="d-flex align-center mb-4">
              <v-switch v-model="showNames" :label="showNames ? '顯示名稱' : '顯示編號'" class="mr-4"></v-switch>

              <v-text-field v-model="search" label="搜尋" clearable outlined dense class="mb-3" />
            </div>

            <v-data-table :headers="headers" :items="filteredOrders" :items-per-page="10" class="elevation-1">
              <template v-slot:item.actions="{ item }">
                <v-btn @click="editOrder(item)" icon>
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn @click="deleteOrder(item.orderId)" icon>
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
                <!-- 前往付款按鈕 -->
                <v-btn v-if="item.status === '未付款'" @click="goToPayment(item)" color="green" icon>
                  <v-icon>mdi-credit-card-outline</v-icon>
                </v-btn>
                <!-- 新增取消細節按鈕，只在狀態為可取消時顯示 -->
                <v-btn 
                v-if="item.status === '已取消'" 
                @click="cancelOrder(item)" 
                icon
                >
                <v-icon>mdi-file-cancel</v-icon>
                </v-btn>

              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-window-item>

      <!-- 訂單分析頁籤 -->
      <v-window-item value="analysis">
        <OrderAnalysis />
      </v-window-item>
    </v-window>

    <!-- 編輯或新增訂單的 Dialog 彈窗 -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>{{ dialogTitle }}</v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-text-field v-model="currentOrder.user.userID" label="使用者 ID" required />
            <v-text-field v-model="currentOrder.caregiver.caregiverNO" label="照護人員編號" required />
            <v-text-field v-model="currentOrder.orderDate" type="date" label="訂單日期" required />
            <v-text-field v-model="currentOrder.startDate" type="date" label="開始日期" required />
            <v-text-field v-model="currentOrder.endDate" type="date" label="結束日期" required />
            <v-select v-model="currentOrder.status" :items="['待確認', '未付款', '付款完成', '付款失敗', '已取消']" label="狀態" required
              outlined></v-select>
            <v-select v-model="currentOrder.paymentMethod"
              :items="['', '現金', '信用卡', '網路ATM', 'ATM櫃員機', '超商代碼', 'Apple Pay']" label="付款方式" required
              outlined></v-select>
            <v-text-field v-model="currentOrder.totalPrice" label="總金額" type="number" required />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="saveOrder">儲存</v-btn>
          <v-btn color="error" @click="closeDialog">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- 當 showCancelDetail 為 true 時顯示 CancelOrderDetail 組件，並將選中的訂單 ID 傳遞給它 -->

    <CancelOrderDetail 
    v-if="showCancelDetail" 
   :orderId="selectedOrderId"
    @close="showCancelDetail = false"
      />
  </v-container>
</template>


<script setup>
// 引入所需的函式和庫
import { ref, reactive, onMounted, computed } from "vue"; // Composition API
import axios from "axios"; // 用於發送 HTTP 請求
import Swal from "sweetalert2"; // 用於顯示彈出式警告
import OrderAnalysis from '@/components/Order/OrderData.vue';
import { useRouter } from 'vue-router';
import CancelOrderDetail from '@/components/Order/CancelDetail.vue';

// 新增頁籤控制變數
const activeTab = ref('orders');
// 搜尋框文字 新增的搜尋變數
const search = ref("");
// 訂單數據的反應式變數
const orders = ref([]);
// 控制 Dialog 顯示與隱藏
const dialog = ref(false);
// 控制 Dialog 標題
const dialogTitle = ref("");
// 控制是否顯示名稱
const showNames = ref(false);
const router = useRouter();
// 查看取消訂單詳情
const cancelOrder = (item) => {
  selectedOrderId.value = item.orderId;
  showCancelDetail.value = true;
};
const showCancelDetail = ref(false);
const selectedOrderId = ref(null);


// 當前正在編輯的訂單數據
const currentOrder = reactive({
  orderId: null,
  user: {
    userID: ""
  },
  caregiver: {
    caregiverNO: ""
  },
  orderDate: null,
  startDate: null,
  endDate: null,
  status: "",
  paymentMethod: "",
  totalPrice: 0
});
// 跳轉到付款頁面，並傳遞訂單資料
const goToPayment = (item) => {
  // 可以根據需要做一些資料傳遞或處理

  console.log("抓取的訂單資料:", item);
  setTimeout(() => {
    localStorage.setItem('orderToPay', JSON.stringify(item)); // 儲存訂單資料
    
    router.push({ name: 'order_Pay_Home' });  // 跳轉頁面
  }, 500); // 延遲 500 毫秒
};


// 資料表的欄位標題
const headers = computed(() => [
  { title: "編號", key: "orderId", align: 'start' },
  { title: showNames.value ? "使用者名稱" : "使用者編號", key: showNames.value ? "userName" : "userID" },
  { title: showNames.value ? "照護人員名稱" : "照護人員編號", key: showNames.value ? "caregiverName" : "caregiverNO" },
  { title: "訂單日期", key: "orderDate" },
  { title: "開始日期", key: "startDate" },
  { title: "結束日期", key: "endDate" },
  { title: "狀態", key: "status" },
  { title: "付款方式", key: "paymentMethod" },
  { title: "總金額", key: "totalPrice" },
  { title: "操作", key: "actions", sortable: false }
]);


// 快速新增訂單功能
const quickAddOrder = () => {
  dialogTitle.value = "快速新增訂單";
  const currentDate = new Date().toISOString().split('T')[0];
  // 預填表單數據
  Object.assign(currentOrder, {
    orderId: null,
    user: {
      userID: "USR0001"
    },
    caregiver: {
      caregiverNO: "2"
    },
    orderDate: currentDate,  // 當前日期
    startDate: currentDate,
    endDate: currentDate,
    status: "未付款",
    totalPrice: 114
  });

  dialog.value = true; // 打開對話框
};

// 格式化日期為本地日期格式
const formatDateToLocalDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

// 從後端獲取訂單資料
const fetchOrders = async () => {
  try {
    const response = await axios.get("http://localhost:8080/api/ordersAdmin/AllOrders");
    orders.value = response.data; // 直接保存完整的響應數據
  } catch (error) {
    console.error('Error fetching orders:', error);
    Swal.fire("錯誤", "無法載入訂單資料", "error");
  }
};

// 打開新增訂單的 Dialog
const openCreateDialog = () => {
  dialogTitle.value = "新增訂單";
  resetCurrentOrder(); // 重置當前訂單
  dialog.value = true; // 顯示 Dialog
};

// 編輯訂單
const editOrder = (item) => {
  console.log('Editing item:', item);
  dialogTitle.value = "編輯訂單";

  if (!item) {
    console.error('No item data received');
    return;
  }

  // 設置當前訂單的資料
  try {
    Object.assign(currentOrder, {
      orderId: item.orderId,
      user: {
        userID: item.userID || ''
      },
      caregiver: {
        caregiverNO: item.caregiverNO || ''
      },
      orderDate: formatDateToLocalDate(item.orderDate),
      startDate: formatDateToLocalDate(item.startDate),
      endDate: formatDateToLocalDate(item.endDate),
      status: item.status || '',
      paymentMethod: item.paymentMethod || '',
      totalPrice: item.totalPrice || 0
    });

    console.log('Formatted currentOrder:', currentOrder);
  } catch (error) {
    console.error('Error in editOrder:', error);
  }

  dialog.value = true; // 顯示 Dialog
};

// 刪除訂單
const deleteOrder = async (orderId) => {
  const confirmed = await Swal.fire({
    title: "確定刪除?",
    text: "此操作將無法復原!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "刪除",
    cancelButtonText: "取消",
  });

  if (confirmed.isConfirmed) {
    try {
      await axios.delete(`http://localhost:8080/api/ordersAdmin/deleteOrder/${orderId}`);
      Swal.fire("成功", "訂單已刪除", "success");
      fetchOrders(); // 重新獲取訂單列表
    } catch (error) {
      Swal.fire("錯誤", "刪除失敗", "error");
    }
  }
};

// 儲存訂單
const saveOrder = async () => {
  try {
    const orderData = {
      user: {
        userID: currentOrder.user.userID
      },
      caregiver: {
        caregiverNO: currentOrder.caregiver.caregiverNO
      },
      orderDate: formatDateToLocalDate(currentOrder.orderDate),
      startDate: formatDateToLocalDate(currentOrder.startDate),
      endDate: formatDateToLocalDate(currentOrder.endDate),
      status: currentOrder.status,
      paymentMethod: currentOrder.paymentMethod,
      totalPrice: Number(currentOrder.totalPrice)
    };

    // 判斷是新增還是更新訂單
    if (currentOrder.orderId) {
      await axios.put(`http://localhost:8080/api/ordersAdmin/UpdateOrder/${currentOrder.orderId}`,
        orderData
      );
      Swal.fire("成功", "訂單已更新", "success");
    } else {
      await axios.post("http://localhost:8080/api/ordersAdmin/createOrder", orderData);
      Swal.fire("成功", "訂單已新增", "success");
    }
    await fetchOrders(); // 重新獲取訂單列表
    closeDialog(); // 關閉 Dialog
  } catch (error) {
    console.error("Error saving order:", error);
    Swal.fire("錯誤", error.response?.data?.message || "操作失敗", "error");
  }
};

const filteredOrders = computed(() => {
  // 首先處理名稱/編號的轉換
  const processedData = orders.value.map(order => ({
    orderId: order.orderId,
    userID: order.user?.userID || '',
    userName: order.user?.userName || '',
    caregiverNO: order.caregiver?.caregiverNO || '',
    caregiverName: order.caregiver?.user.userName || '',
    orderDate: formatDateToLocalDate(order.orderDate),
    startDate: formatDateToLocalDate(order.startDate),
    endDate: formatDateToLocalDate(order.endDate),
    status: order.status || '',
    paymentMethod: order.paymentMethod || '',
    totalPrice: order.totalPrice ? order.totalPrice.toLocaleString() : '0'
  }));

  // 然後進行搜尋過濾
  if (!search.value) return processedData;

  const searchTerm = search.value.toLowerCase();
  return processedData.filter(order => {
    return (
      order.orderId?.toString().toLowerCase().includes(searchTerm) ||
      order.userID?.toLowerCase().includes(searchTerm) ||
      order.userName?.toLowerCase().includes(searchTerm) ||
      order.caregiverNO?.toString().toLowerCase().includes(searchTerm) ||
      order.caregiverName?.toLowerCase().includes(searchTerm) ||
      order.orderDate?.toLowerCase().includes(searchTerm) ||
      order.startDate?.toLowerCase().includes(searchTerm) ||
      order.endDate?.toLowerCase().includes(searchTerm) ||
      order.status?.toLowerCase().includes(searchTerm) ||
      order.totalPrice?.toString().toLowerCase().includes(searchTerm)
    );
  });
});

// 重置當前訂單數據
const resetCurrentOrder = () => {
  Object.assign(currentOrder, {
    orderId: null,
    user: {
      userID: ""
    },
    caregiver: {
      caregiverNO: ""
    },
    orderDate: null,
    startDate: null,
    endDate: null,
    status: "",
    totalPrice: 0
  });
};

// 關閉 Dialog
const closeDialog = () => {
  dialog.value = false;
  resetCurrentOrder();
};

// 頁面加載時獲取訂單資料
onMounted(fetchOrders);
</script>

<style scoped>
.v-data-table {
  margin-top: 20px;
}
</style>