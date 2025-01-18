<template>
  <div class="timeline-container">
    <div class="timeline">
      <!-- 顯示步驟 -->
      <div v-for="(step, index) in timelineSteps" :key="index" class="timeline-step">
        <div class="timeline-icon">
          <v-icon :color="step.completed ? 'success' : 'grey'">mdi-check-circle</v-icon>
        </div>
        <div class="timeline-content">
          <div class="timeline-title">{{ step.title }}</div>
          <div class="timeline-date">{{ formatDate(step.date) }}</div>
        </div>
        <!-- 顯示步驟之間的連接線（橫線） -->
        <div
          v-if="index < timelineSteps.length - 1"
          class="timeline-connector"
          :class="{ completed: step.completed }"
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
});

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    
  });
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
