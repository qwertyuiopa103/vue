<template>
  <v-container>
    <v-card v-if="order && isValidOrder">
      <v-card-title>確認訂單資訊</v-card-title>
      <v-card-text>
        <div>
          <p><strong>訂單編號:</strong> {{ order.orderId }}</p>
          <p><strong>使用者名稱:</strong> {{ order.user?.userName || '未提供' }}</p>
          <p><strong>照護人員名稱:</strong> {{ order.caregiver?.user?.userName || '未提供' }}</p>
          <p><strong>狀態:</strong> {{ order.status || '未提供' }}</p>
          <p><strong>總金額:</strong> {{ order.totalPrice || '0' }}</p>
        </div>

        <!-- 付款方式下拉選單 -->
        <v-select v-model="paymentMethod" :items="paymentMethods" item-title="label" item-value="value" label="選擇付款方式"
          required></v-select>

        <v-btn @click="processPayment" color="green" :disabled="!paymentMethod || isProcessing" :loading="isProcessing">
          付款
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- 如果 order 沒有找到或無效，顯示錯誤訊息 -->
    <v-alert v-else type="error" dismissible>
      無法加載訂單資訊，請稍後再試。
    </v-alert>

    <!-- 用於提交綠界表單的隱藏區域 -->
    <div ref="ecpayFormContainer" style="display: none;"></div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const order = ref(null);
const paymentMethod = ref(null);
const isProcessing = ref(false);
const ecpayFormContainer = ref(null);

// 設定付款方式選項
const paymentMethods = ref([
  { label: '信用卡', value: 'credit_card' },
  { label: '網路ATM', value: 'atm' },
  { label: 'ATM櫃員機', value: 'atm_machine' },
  { label: '超商代碼', value: 'convenience_store' },
  { label: 'Apple Pay', value: 'apple_pay' }
]);

const isValidOrder = computed(() => {
  return order.value &&
    typeof order.value === 'object' &&
    order.value.orderId;
});

// 初始化訂單資料
try {
  const orderData = localStorage.getItem('orderToPay');
  if (orderData) {
    order.value = JSON.parse(orderData);
  } else {
    console.error('未找到訂單資料');
  }
} catch (error) {
  console.error('解析訂單資料時發生錯誤:', error);
}

// 付款處理邏輯
async function processPayment() {
  if (!isValidOrder.value || !paymentMethod.value) {
    console.error("訂單資料無效或未選擇付款方式");
    return;
  }

  try {
    isProcessing.value = true;

    
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/payment/ecpay/create`,
      {
        orderId: order.value.orderId,
        totalPrice: order.value.totalPrice,
        paymentMethod: paymentMethod.value
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer yourTokenHere'
        }
      }
    );

    const { formHtml } = response.data;

    if (ecpayFormContainer.value) {
      ecpayFormContainer.value.innerHTML = formHtml;
      const form = ecpayFormContainer.value.querySelector('form');
      if (form) {
        form.submit();
      }
    }
  } catch (error) {
    console.error('處理付款時發生錯誤:', error);
  } finally {
    isProcessing.value = false;
  }
}

// 組件初始化
onMounted(() => {
  // 這裡可以根據需要從後端載入付款方式
  // 目前已經用靜態數據填充了 paymentMethods
});
</script>
