<template>
  <v-dialog v-model="dialog" max-width="500px" @click:outside="handleClose">
    <v-card>
      <v-card-title>取消訂單詳情</v-card-title>
      <v-card-text v-if="cancelDetail">
        <v-row>
          <v-col cols="12" class="pb-0">
            <strong>取消編號：</strong>{{ cancelDetail.cancellationId }}
          </v-col>
          <v-col cols="12" class="pb-0">
            <strong>取消日期：</strong>{{ formatDate(cancelDetail.cancelDate) }}
          </v-col>
          <v-col cols="12" class="pb-0">
            <strong>取消原因：</strong>{{ cancelDetail.cancellationReason }}
          </v-col>
          <v-col cols="12" class="pb-0">
            <strong>詳細原因：</strong>{{ cancelDetail.reason }}
          </v-col>
          <v-col cols="12" class="pb-0">
            <strong>賠款金額：</strong>{{ formatCurrency(cancelDetail.refundAmount) }}
          </v-col>
          <v-col cols="12" class="pb-0">
            <strong>照片證明：</strong>{{ cancelDetail.proofReceived ? '已提供' : '未提供' }}
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="closeDialog">關閉</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

// 定義 props
const props = defineProps({
  orderId: {
    type: [Number, String],
    required: true
  }
})

const emit = defineEmits(['close'])

const dialog = ref(false) // 預設關閉對話框
const cancelDetail = ref(null)

// 查詢取消訂單 ID
const fetchCancellationId = async () => {
  if (!props.orderId) {
    Swal.fire({
      icon: 'error',
      title: '錯誤',
      text: '無效的訂單 ID'
    })
    return
  }

  console.log("開始查詢 cancellationId...")

  try {
    // 查詢 cancellationId
    const cancellationIdResponse = await axios.get(`/OrderNoAuth/getCancellationIdByOrderId/${props.orderId}`)
    const cancellationId = cancellationIdResponse.data
    console.log("取得的 cancellationId:", cancellationId)

    if (!cancellationId) {
      Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: '未找到取消訂單 ID'
      })
      return
    }

    // 繼續執行根據 cancellationId 查詢取消詳情的程式碼
    fetchCancelDetail(cancellationId)

  } catch (error) {
    console.error('Error fetching cancellationId:', error)
    Swal.fire({
      icon: 'error',
      title: '錯誤',
      text: '無法查詢取消訂單 ID'
    })
  }
}

// 根據取消 ID 查詢取消詳情
const fetchCancelDetail = async (cancellationId) => {
  console.log("查詢取消訂單詳情，取消 ID:", cancellationId)

  if (!cancellationId) {
    Swal.fire({
      icon: 'error',
      title: '錯誤',
      text: '無效的取消訂單 ID'
    })
    return
  }

  try {
    // 查詢取消訂單詳情
    const response = await axios.get(`/ordercancel/getcancel/${cancellationId}`)
    cancelDetail.value = response.data
    console.log("取消訂單詳情:", cancelDetail.value)

  } catch (error) {
    console.error('Error fetching cancel detail:', error)
    Swal.fire({
      icon: 'error',
      title: '錯誤',
      text: '無法載入取消訂單詳情'
    })
    dialog.value = false
    emit('close')
  }
}

// 日期格式化
const formatDate = (dateString) => {
  return dateString ? new Date(dateString).toLocaleString() : '未知'
}

// 金額格式化
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD'
  }).format(amount || 0)
}

// 開啟取消訂單詳情對話框
const openDialog = () => {
  cancelDetail.value = null  // 每次打開都清空 cancelDetail
  dialog.value = true // 開啟對話框
  fetchCancellationId()  // 查詢取消訂單
}

// 關閉對話框
const closeDialog = () => {
  dialog.value = false
  emit('close')
}

// 點擊空白區域時關閉對話框
const handleClose = () => {
  cancelDetail.value = null  // 重新設置為 null
  dialog.value = false // 關閉對話框
  emit('close')
}

// 當元件掛載時，開始查詢 cancellationId
onMounted(() => {
  openDialog()
})
</script>
