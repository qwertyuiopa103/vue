<template>
  <div class="timeline-container">
    <div class="timeline">
      <!-- 顯示步驟 -->
      <div v-for="(step, index) in timelineSteps" :key="index" class="timeline-step">
        <div class="timeline-icon">
          <v-icon :color="getStepColor(step)">mdi-check-circle</v-icon>
        </div>
        <div class="timeline-content">
          <div class="timeline-title">{{ step.title }}</div>
          <div class="timeline-date">{{ formatDate(step.date) }}</div>
        </div>
        <!-- 顯示步驟之間的連接線（橫線） -->
        <div
          v-if="index < timelineSteps.length - 1"
          class="timeline-connector"
          :class="{ completed: step.completed && isPaid }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  timelineSteps: {
    type: Array,
    required: true,
  },
  Status: {  // 接收付款狀態
    type: String,
    required: true,
  },
});

// 格式化日期顯示
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

// 根據付款狀態和時間判斷顏色
const getStepColor = (step) => {
  const currentTime = new Date();
  
  // 從 step 物件中獲取訂單的開始與結束時間
  const startDate = new Date(step.startDate);  // 訂單的開始時間
  const endDate = new Date(step.endDate); // 訂單的結束時間
  
  // 加入除錯信息，檢查 startDate 和 endDate
  console.log('startDate:', startDate);
  console.log('endDate:', endDate);
  console.log('currentTime:', currentTime);
  
  // 檢查日期是否正確解析
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    console.error('日期格式錯誤：', step.startDate, step.endDate);
    return 'grey'; // 如果解析出錯，顯示灰色
  }

  // 判斷付款狀態
  if (props.Status === 'paid') {
    return 'success';  // 付款完成，顯示綠色
  }

  // 判斷當前時間與訂單時間的關係
  if (currentTime >= startDate && currentTime <= endDate) {
    return 'success';  // 當前時間在訂單範圍內，顯示綠色
  }

  if (currentTime > endDate) {
    return 'success';  // 訂單已結束，顯示綠色
  }

  return 'grey';  // 默認顯示灰色
};
</script>

<style scoped>
.timeline-container {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.timeline {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  position: relative;
  width: 100%;
  max-width: 800px;
}

.timeline-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  margin: 0 30px; /* 加一些間距 */
}

.timeline-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #e0e0e0;
}

.timeline-step.completed .timeline-icon {
  border-color: #4caf50;
  background-color: #e8f5e9;
}

.timeline-content {
  text-align: center;
  margin-top: 12px;
}

.timeline-title {
  font-weight: 600;
  margin-bottom: 6px;
}

.timeline-date {
  font-size: 0.9rem;
  color: rgba(0, 0, 0, 0.6);
}

/* 顯示水平連接線 */
.timeline-connector {
  position: absolute;
  top: 25%;  /* 垂直居中 */
  left: 100%;  /* 使線條從圖標的右側開始 */
  width: 40px;  /* 調整線條寬度 */
  height: 4px;
  background-color: #e0e0e0;
  z-index: -1; /* 確保線在圖標下方 */
}

.timeline-connector.completed {
  background-color: #4caf50; /* 完成的線顏色 */
}
</style>
