<template>
    <v-container>
      <v-card>
        <v-card-title>付款結果</v-card-title>
        <v-card-text>
          <v-alert v-if="paymentSuccess" type="success" dismissible>
            付款成功！訂單編號: {{ orderId }}
          </v-alert>
          <v-alert v-if="!paymentSuccess" type="error" dismissible>
            付款失敗，請稍後再試。
          </v-alert>
        </v-card-text>
      </v-card>
    </v-container>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  
  // 假設這是從 URL 中取得的訂單資料
  const orderId = ref(null);
  const paymentSuccess = ref(false);
  
  onMounted(() => {
    // 這裡模擬從 URL 或 API 獲取付款結果
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success'); // success = '1' 代表成功，'0' 代表失敗
    orderId.value = urlParams.get('orderId');
    paymentSuccess.value = success === '1'; // 根據 success 參數顯示不同結果
  });
  </script>
  