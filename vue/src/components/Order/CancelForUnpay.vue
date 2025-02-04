<template>
  <v-dialog v-model="dialog" max-width="500px">
    <v-card>
      <v-card-title>
        <span class="headline">未付款取消訂單</span>
      </v-card-title>

      <v-card-text>
        <v-form>
          <v-text-field label="訂單編號" :model-value="formData.orderId" readonly></v-text-field>
          <v-text-field label="看護名字" :model-value="formData.caregiverName" readonly></v-text-field>
          <v-text-field label="開始時間" :model-value="formData.startDate" readonly></v-text-field>
          <v-text-field label="總金額" :model-value="`NT$ ${formatPrice(formData.totalPrice)}`" readonly></v-text-field>

          <v-select label="取消原因" v-model="formData.cancelReason" :items="cancelReasonOptions" item-title="text"
            item-value="value" :rules="[v => !!v || '請選擇取消原因']" outlined></v-select>

          <v-alert v-if="!canCancel" type="error" class="mt-3">
            已超過七天退款日，無法取消訂單
          </v-alert>

          <v-alert v-else type="info" class="mt-3">
            {{ refundMessage }}
          </v-alert>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="handleCancel" :disabled="!canCancel || !formData.cancelReason">
          確認取消
        </v-btn>
        <v-btn color="error" @click="closeDialog">
          關閉
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

const dialog = ref(false);
const formData = ref({
  orderId: '',
  caregiver: '',
  startDate: '',
  totalPrice: 0,
  cancelReason: null
});

const emit = defineEmits(['order-cancelled']);

const cancelReasonOptions = [
  { text: '關你屁事', value: 'A' },
  { text: '家裡死人', value: 'B' }
];

const canCancel = computed(() => {
  if (!formData.value.startDate) return false;

  const startDate = new Date(formData.value.startDate);
  const today = new Date();

  startDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return startDate > today;
});

const refundMessage = computed(() => {
  if (!formData.value.startDate) return '';

  const startDate = new Date(formData.value.startDate);
  const today = new Date();
  const diffDays = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));

  if (diffDays >= 7) {
    return '距離服務開始7天以上，可全額退款';
  } else {
    return '距離服務開始少於7天，請先完成訂單後再取消(退還50%金額)';
  }
});

const formatPrice = (price) => {
  if (!price) return '0';
  return new Intl.NumberFormat('zh-TW').format(price);
};

const openDialog = (order) => {
  formData.value = {
    orderId: order.orderId,
    caregiverName: order.caregiver.user.userName,
    startDate: order.startDate,
    totalPrice: order.totalPrice,
    cancelReason: null
  };
  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  formData.value.cancelReason = null;
};

const handleCancel = async () => {
  try {
    // 計算距離服務開始的天數
    const startDate = new Date(formData.value.startDate);
    const today = new Date();
    const diffDays = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));

    // 1. 距離服務開始7天以上，可全額退款
    if (diffDays >= 7) {
      const cancelData = {
        cancelDate: formatDate(new Date()), // 只傳遞年月日
        cancellationReason: formData.value.cancelReason,
        refundAmount: formData.value.totalPrice,
        reason: formData.value.cancelReason === 'A' ? '關你屁事' : '家裡死人',
        proofReceived: false
      };

      console.log('Creating cancellation record:', cancelData);

      const cancelResponse = await axios.post('http://localhost:8080/api/ordercancel/createcancel', cancelData);
      console.log('Cancellation response:', cancelResponse);

      if (cancelResponse.status === 201) {
        // 更新訂單狀態為已取消
        const updateOrderData = {
          status: '已取消',
          cancellationId: cancelResponse.data.cancellationId
        };

        const orderResponse = await axios.put(
          `http://localhost:8080/api/ordersAdmin/updateStatus/${formData.value.orderId}`,
          updateOrderData
        );

        if (orderResponse.status === 200) {
          closeDialog();

          await Swal.fire({
            title: '成功',
            text: '訂單已成功取消',
            icon: 'success'
          });
          closeDialog();
          emit('order-cancelled');
        }
      }
    } else {
      // 2. 距離服務開始少於7天，顯示提示訊息
      closeDialog();

      Swal.fire({
        title: '注意',
        text: '請先完成訂單後再取消(退還50%金額)',
        icon: 'warning'
      });
    }
  } catch (error) {
    console.error('取消訂單失敗:', error);
    let errorMessage = '取消訂單失敗';
    if (error.response?.data) {
      errorMessage = typeof error.response.data === 'string'
        ? error.response.data
        : error.response.data.message || errorMessage;
    }
    Swal.fire({
      title: '錯誤',
      text: errorMessage,
      icon: 'error'
    });
  }
};

const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

defineExpose({
  openDialog
});
</script>