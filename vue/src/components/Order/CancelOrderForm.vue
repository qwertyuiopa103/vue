<template>
  <v-dialog v-model="dialog" max-width="500px">
    <v-card>
      <v-card-title>
        <span class="headline">取消訂單</span>
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
            服務已開始，無法取消訂單
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
  { text: '個人因素', value: 'A' },
  { text: '家人已過世', value: 'B' }
];

const canCancel = computed(() => {
  if (!formData.value.startDate) return false;

  const startDate = new Date(formData.value.startDate);
  const today = new Date();

  startDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return startDate > today;
});

const calculatedRefund = computed(() => {
  if (!canCancel.value || !formData.value.totalPrice) return 0;

  const startDate = new Date(formData.value.startDate);
  const today = new Date();
  const diffDays = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));

  return diffDays >= 7 ? formData.value.totalPrice : Math.floor(formData.value.totalPrice * 0.5);
});

const refundMessage = computed(() => {
  if (!formData.value.startDate) return '';

  const startDate = new Date(formData.value.startDate);
  const today = new Date();
  const diffDays = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));

  return diffDays >= 7
    ? '距離服務開始7天以上，可全額退款'
    : '距離服務開始少於7天，退還50%金額';
});

const formatPrice = (price) => {
  if (!price) return '0';
  return new Intl.NumberFormat('zh-TW').format(price);
};

const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
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
    // 1. 首先建立取消訂單記錄，這裡使用 formatDate 函數，只傳遞年月日
    const cancelData = {
      cancelDate: formatDate(new Date()), // 只傳遞年月日
      cancellationReason: formData.value.cancelReason,
      refundAmount: calculatedRefund.value,
      reason: formData.value.cancelReason === 'A' ? '個人因素' : '家人已過世',
      proofReceived: false
    };

    console.log('Creating cancellation record:', cancelData);

    const cancelResponse = await axios.post('http://localhost:8080/api/ordercancel/createcancel', cancelData);
    console.log('Cancellation response:', cancelResponse);

    if (cancelResponse.status === 201) {
      // 2. 取得新建立的 cancellation_id
      const cancellationId = cancelResponse.data.cancellationId;

      // 3. 更新訂單狀態
      const updateOrderData = {
        status: '已取消',
        cancellationId: cancellationId
      };

      console.log('Updating order with data:', updateOrderData);

      const orderResponse = await axios.put(
        `http://localhost:8080/orders/updateStatus/${formData.value.orderId}`,
        updateOrderData
      );

      if (orderResponse.status === 200) {
        await Swal.fire({
          title: '成功',
          text: '訂單已成功取消',
          icon: 'success',
          confirmButtonColor: '#FFC78E',
        });
        closeDialog();
        emit('order-cancelled');
      }
    }
  } catch (error) {
    console.error('取消訂單失敗:', error);
    console.error('錯誤詳情:', error.response?.data);

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

defineExpose({
  openDialog
});
</script>