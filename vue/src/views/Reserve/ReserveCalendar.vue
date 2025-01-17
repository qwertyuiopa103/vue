<template>
  <v-sheet width="700">
    <v-calendar ref="calendar" v-model="focus" :events="events" color="primary" type="month">
      <!-- 使用插槽自定義事件顯示 -->
      <template v-slot:event="event">
        <div v-if="event" class="event-btn">
          <font-awesome-icon icon="xmark" class="red-icon" />
        </div>
      </template>
    </v-calendar>
  </v-sheet>
</template>

<script>
import axios from "axios";
import { useDate } from "vuetify";
import { VSheet } from "vuetify/components";
import { VCalendar } from "vuetify/labs/VCalendar";
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'; // 引入 FontAwesomeIcon

export default {
  components: {
    VCalendar,
    VSheet,
    FontAwesomeIcon, // 註冊 FontAwesomeIcon 組件
  },

  data: () => ({
    focus: [new Date()], // 修正為陣列型別
    events: [],
    caregiverNO: "1", // 預設的看護師 ID
  }),

  mounted() {
    const adapter = useDate();
    const startOfMonth = adapter.startOfDay(adapter.startOfMonth(new Date()));
    const endOfMonth = adapter.endOfDay(adapter.endOfMonth(new Date()));
    this.fetchOrdersByCaregiver({ start: startOfMonth, end: endOfMonth });
  },

  methods: {
    async fetchOrdersByCaregiver({ start, end }) {
      try {
        const response = await axios.get(
          `http://localhost:8080/orders/OrderByCaregiver/${this.caregiverNO}`
        );
        const orders = response.data;
        this.mapOrdersToEvents(orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    },

    mapOrdersToEvents(orders) {
      this.events = [];
      orders.forEach(order => {
        const caregiverNO = order.caregiver ? order.caregiver.caregiverNO : "Unknown";

        const startDate = new Date(order.startDate);
        const endDate = new Date(order.endDate);

        // 確保從 startDate 到 endDate 每一天都有一個事件，包括 start 和 end 當天
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          this.events.push({
            title: `Order for Caregiver ${caregiverNO}`,
            start: new Date(currentDate),  // 每一天的開始時間
            end: new Date(currentDate),    // 每一天的結束時間
            color: "red",
            allDay: true,
          });

          // 增加一天
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });
    },
  },
};
</script>

<style scoped>
/* 自定義樣式 */
.event-btn {
  position: absolute;
  /* 使用絕對定位 */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
  /* 確保圖標在最前面 */
}

.red-icon {
  font-size: 100px;
  /* 增加圖標大小，使其覆蓋整個區域 */
  color: red;
  /* 將 "X" 圖示顯示為紅色 */
}
</style>
