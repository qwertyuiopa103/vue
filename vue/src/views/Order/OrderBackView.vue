<!-- http://localhost:5173/#/admin/orderView -->
<template>
  <v-container>
  <v-card>
    <!-- 卡片標題，顯示 "訂單管理" 並包含新增訂單按鈕 -->
    <v-card-title class="d-flex justify-space-between align-center">
      <span>訂單管理</span>
      <v-btn color="primary" @click="openCreateDialog">新增訂單</v-btn>
    </v-card-title>

    <v-card-text>
      <!-- 訂單資料表，顯示訂單列表 -->
      <v-data-table
        :headers="headers"
        :items="orders"
        :items-per-page="10"
        class="elevation-1"
      >
        <template v-slot:item.actions="{ item }">
          <!-- 訂單操作按鈕：編輯和刪除 -->
          <v-btn
          color="primary"
          size="small"
          class="mr-2"
          @click="editOrder(item)"  
          > 
            編輯
          </v-btn>
          <v-btn
            color="error"
            size="small"
            @click="deleteOrder(item.orderId)"
          >
            刪除
          </v-btn>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>

  <!-- 編輯或新增訂單的 Dialog 彈窗 -->
  <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>{{ dialogTitle }}</v-card-title>
        <v-card-text>
          <!-- 表單，包含訂單的各項欄位 -->
          <v-form ref="form">
            <v-text-field
              v-model="currentOrder.user.userID"
              label="使用者 ID"
              required
            />
            <v-text-field
              v-model="currentOrder.caregiver.caregiverNO"
              label="照護人員編號"
              required
            />
            <v-text-field
              v-model="currentOrder.orderDate"
              type="date"
              label="訂單日期"
              required
            />
            <v-text-field
              v-model="currentOrder.startDate"
              type="date"
              label="開始日期"
              required
            />
            <v-text-field
              v-model="currentOrder.endDate"
              type="date"
              label="結束日期"
              required
            />
            <v-text-field
              v-model="currentOrder.status"
              label="狀態"
              required
            />
            <v-text-field
              v-model="currentOrder.totalPrice"
              label="總金額"
              type="number"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <!-- 儲存和取消按鈕 -->
          <v-btn color="primary" @click="saveOrder">儲存</v-btn>
          <v-btn color="error" @click="closeDialog">取消</v-btn>
        </v-card-actions>
      </v-card>
  </v-dialog>
  </v-container>
</template>

<script setup>
// 引入所需的函式和庫
import { ref, reactive, onMounted } from "vue"; // Composition API
import axios from "axios"; // 用於發送 HTTP 請求
import Swal from "sweetalert2"; // 用於顯示彈出式警告

// 訂單數據的反應式變數
const orders = ref([]);
// 控制 Dialog 顯示與隱藏
const dialog = ref(false);
// 控制 Dialog 標題
const dialogTitle = ref("");
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
totalPrice: 0
});

// 資料表的欄位標題
const headers = [
{ title: "編號", key: "orderId", align: 'start' },
{ title: "使用者編號", key: "userID" },
{ title: "照護人員編號", key: "caregiverNO" },
{ title: "訂單日期", key: "orderDate" },
{ title: "開始日期", key: "startDate" },
{ title: "結束日期", key: "endDate" },
{ title: "狀態", key: "status" },
{ title: "總金額", key: "totalPrice" },
{ title: "操作", key: "actions", sortable: false }
];

// 格式化日期為本地日期格式
const formatDateToLocalDate = (dateString) => {
if (!dateString) return null;
const date = new Date(dateString);
return date.toISOString().split('T')[0];
};

// 從後端獲取訂單資料
const fetchOrders = async () => {
try {
  const response = await axios.get("http://localhost:8080/orders/AllOrders");
  console.log('Raw response:', response.data); // 輸出原始資料
  
  // 處理數據，格式化日期
  orders.value = response.data.map(order => ({
    orderId: order.orderId,
    userID: order.user?.userID || '',
    caregiverNO: order.caregiver?.caregiverNO || '',
    orderDate: formatDateToLocalDate(order.orderDate),
    startDate: formatDateToLocalDate(order.startDate),
    endDate: formatDateToLocalDate(order.endDate),
    status: order.status || '',
    totalPrice: order.totalPrice || 0
  }));
  
  console.log('Processed orders:', orders.value); // 輸出處理後的資料
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
    await axios.delete(`http://localhost:8080/orders/deleteOrder/${orderId}`);
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
    totalPrice: Number(currentOrder.totalPrice)
  };

  // 判斷是新增還是更新訂單
  if (currentOrder.orderId) {
    await axios.put(
      `http://localhost:8080/orders/UpdateOrder/${currentOrder.orderId}`,
      orderData
    );
    Swal.fire("成功", "訂單已更新", "success");
  } else {
    await axios.post("http://localhost:8080/orders/createOrder", orderData);
    Swal.fire("成功", "訂單已新增", "success");
  }
  await fetchOrders(); // 重新獲取訂單列表
  closeDialog(); // 關閉 Dialog
} catch (error) {
  console.error("Error saving order:", error);
  Swal.fire("錯誤", error.response?.data?.message || "操作失敗", "error");
}
};

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
