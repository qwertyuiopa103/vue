<template>
  <div class="main-container">
    <!-- 左邊的行事曆區塊：顯示訂單 -->
    <v-sheet class="calendar-container">
      <v-calendar ref="calendar" v-model="focus" :events="events" color="primary" type="month">
        <!-- 使用插槽自定義事件顯示 -->
        <template v-slot:event="{ event }">
          <div v-if="event" class="event-btn" :style="{
            backgroundColor:
              event.color === 'blue'
                ? '#A3C8FF'      // 淺藍色（進行中）
                : event.color === 'red'
                  ? '#FFA3A3'      // 淺紅色（已取消）
                  : event.color === 'yellow'
                    ? '#FFF4A3'      // 淺黃色（即將開始的預約）
                    : event.color === 'green'
                      ? '#A3FFB3'      // 淺灰色（已完成）
                      : '#FFFFFF'      // 其他顏色為白色
          }">
            <span>{{ event.title }}</span> <!-- 顯示 caregiverName 或 userName -->
          </div>
        </template>
      </v-calendar>
    </v-sheet>

    <!-- 右邊的預約列表 -->
    <div class="reserve-list">
      <div class="reserve-list-header">
        <h3>預約列表</h3>
      </div>

      <div class="reserve-items">
        <div v-for="(reserve, index) in reserves" :key="index" class="reserve-item">
          <p>使用者: {{ reserve.userBean.userName }}</p>
          <p>開始時間: {{ formatDate(reserve.startDate) }}</p>
          <p>結束時間: {{ formatDate(reserve.endDate) }}</p>
          <p>訂單總金額: {{ reserve.totalPrice }}</p>
          <!-- 每一筆預約有獨立的新增與刪除按鈕 -->
          <div class="reserve-actions">
            <i class="fas fa-check-circle" @click="createOrder(reserve)" style="font-size: 36px; color: green; cursor: pointer;"></i>
            <i class="fas fa-times-circle" @click="deleteReserve(reserve, index)" style="font-size: 36px; color: red; cursor: pointer;"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";  // 引入 SweetAlert2
import { useDate } from "vuetify";
import { VSheet, VBtn } from "vuetify/components";
import { VCalendar } from "vuetify/labs/VCalendar";

export default {
  components: {
    VCalendar,
    VSheet,
    VBtn,
  },

  data: () => ({
    focus: [new Date()], // 當前焦點日期
    events: [],          // 儲存事件的陣列 (訂單與預約)
    reserves: [],        // 預約資料 (右邊的預約列表)
    orders: [],
    caregiverNO: 1,      // 預設的看護師 ID (caregiverNO)
    userId:'',
  }),

  async mounted() {
    const adapter = useDate();
    const startOfMonth = adapter.startOfDay(adapter.startOfMonth(new Date()));
    const endOfMonth = adapter.endOfDay(adapter.endOfMonth(new Date()));
    await this.fetchLoginUser();
    console.log(this.caregiverNO);
    
    this.fetchOrdersByCaregiver({ start: startOfMonth, end: endOfMonth }); // 用於行事曆的訂單資料
    this.fetchReservesByCaregiver(this.caregiverNO); // 用於右邊預約列表的資料
  },

  methods: {
    // 從 API 獲取看護師的訂單數據（左邊行事曆顯示）
    async fetchOrdersByCaregiver({ start, end }) {
      try {
        const response = await axios.get(
          `http://localhost:8080/orders/OrderByCaregiver/${this.caregiverNO}`
        );
        this.orders = response.data; // 儲存完整訂單資料

        this.mapOrdersToEvents(this.orders); // 將數據映射為事件
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    },

    // 從 API 獲取預約資料（右邊的預約列表）
    async fetchReservesByCaregiver(caregiverNO) {
      try {
        const response = await axios.get(
          `http://localhost:8080/reserve/search/caregiver/${caregiverNO}`
        );

        // 篩選出 status 為 "待確認" 的預約
        this.reserves = response.data.filter(reserve => reserve.status === "待確認");
        console.log(this.reserves);
        
        // 將篩選後的預約資料映射到行事曆事件
        this.mapReservesToEvents(this.reserves);
      } catch (error) {
        console.error("Error fetching reserves:", error);
      }
    },
    async fetchLoginUser() {
      try {
        const userResponse = await axios.get(
          `http://localhost:8080/api/user/profile`
        );
        this.userId = userResponse.data.id;
        
        const userBean = {
            userID: userResponse.data.id,
            userName: userResponse.data.name,
            userEmail: userResponse.data.email,
          }
        const caregiverResponse = await axios.get(
          `http://localhost:8080/api/caregiver/FindByUserID/${this.userId}`
        )
        this.caregiverNO = caregiverResponse.data.caregiverNO;
        
      } catch (error) {
        console.error("Error fetching reserves:", error);
      }
    },

    // 將獲取的訂單數據映射到行事曆事件 (訂單行事曆)
    mapOrdersToEvents(orders) {
      orders.forEach(order => {
        const caregiverName = order.user ? order.user.userName : "Unknown Caregiver";

        const startDate = new Date(order.startDate);
        const endDate = new Date(order.endDate);

        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          let eventColor = 'blue'; // 預設為藍色（進行中）

          // 如果訂單被取消，改為紅色
          if (order.cancellation && order.cancellation.cancellationId !== null) {
            eventColor = 'red';
          }
          // 如果已經完成，設為灰色
          else if (endDate < new Date()) {
            eventColor = 'green';
          }
          // 如果結束日期大於今天，表示進行中，保持藍色
          else if (endDate >= new Date()) {
            eventColor = 'blue';
          }

          this.events.push({
            title: caregiverName,         // 事件的標題顯示看護師名字
            start: new Date(currentDate), // 事件的開始日期
            end: new Date(currentDate),   // 事件的結束日期
            color: eventColor,            // 根據邏輯設定顏色
            allDay: true,                 // 全日事件
            type: "order"                 // 標識這個事件為訂單
          });

          // 增加一天
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });
    },

    // 將預約資料映射到行事曆事件 (預約行事曆)
    mapReservesToEvents(reserves) {
      reserves.forEach(reserve => {
        const userName = reserve.userBean ? reserve.userBean.userName : "Unknown User";

        const startDate = new Date(reserve.startDate);
        const endDate = new Date(reserve.endDate);

        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          this.events.push({
            title: userName,             // 事件的標題顯示預約的使用者名稱
            start: new Date(currentDate), // 事件的開始日期
            end: new Date(currentDate),   // 事件的結束日期
            color: "yellow",             // 預約的顏色設定為淡黃色
            allDay: true,                // 全日事件
            type: "reserve"              // 標識這個事件為預約
          });

          // 增加一天
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });
    },

    // 格式化日期
    formatDate(date) {
      const options = { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" };
      return new Date(date).toLocaleDateString(undefined, options);
    },

    // 新增預約（每一筆獨立操作）
    async createOrder(reserve) {
      try {
        const reserveId = reserve.reserveId;
        const order = {
          orderId: 0, // 由後端自動生成
          user: reserve.userBean,
          caregiver: reserve.caregiverBean,
          cancellationId:null,
          orderDate: reserve.orderDate,
          startDate: reserve.startDate,
          endDate: reserve.endDate,
          status: "進行中",
          totalPrice: 0,
        };

        // 1. 新增訂單
        const response = await axios.post("http://localhost:8080/orders/createOrder", order);

        if (response.status === 201) {
          // 2. 刪除對應的預約
          const deleteResponse = await axios.put(`http://localhost:8080/reserve/order/${reserveId}`);

          if (deleteResponse.status === 200) {
            // 3. 更新 reserves
            this.reserves = this.reserves.filter(reserve => reserve.reserveId !== reserveId);

            // 4. 更新行事曆事件
            const startDate = new Date(reserve.startDate).toISOString();
            const endDate = new Date(reserve.endDate).toISOString();

            this.events = this.events.map(event => {
              const eventStart = new Date(event.start).toISOString();
              const eventEnd = new Date(event.end).toISOString();

              if (
                event.color === "yellow" && // 確保是黃色事件
                event.title === reserve.userBean.userName &&
                eventStart >= startDate &&
                eventEnd <= endDate
              ) {
                return {
                  ...event,
                  color: "blue", // 修改顏色為藍色
                  type: "order", // 更新事件類型為訂單
                };
              }
              return event; // 保留其他事件不變
            });

            // 5. 顯示成功提示
            Swal.fire({
              icon: "success",
              title: "成功",
              text: "訂單新增成功，預約已轉為訂單",
              confirmButtonText: "確定",
            });
          } else {
            throw new Error("刪除預約失敗");
          }
        } else {
          throw new Error(response.data.message || "新增訂單失敗");
        }
      } catch (error) {
        // 顯示錯誤提示
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "失敗",
          text: error.message || "操作失敗，請稍後再試",
          confirmButtonText: "確定",
        });
      }
    }
,

    // 刪除預約（每一筆獨立操作）
    // 刪除預約（每一筆獨立操作）
    async deleteReserve(reserve, index) {
      Swal.fire({
        title: "刪除預約",
        text: `你確定要刪除預約 ID: ${reserve.reserveId} 嗎?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "確定",
        cancelButtonText: "取消",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            // 使用 axios 發送 DELETE 請求
            const response = await axios.put(`http://localhost:8080/reserve/${reserve.reserveId}`);

            // 成功處理
            if(response.status===200){
              Swal.fire("成功!", "資料已刪除", "success");
            }

            // 從 reserves 陣列中移除該預約
            this.reserves.splice(index, 1);

            // 從 events 陣列中移除對應的事件
            const startDate = new Date(reserve.startDate).toISOString();
            const endDate = new Date(reserve.endDate).toISOString();

            this.events = this.events.filter((event) => {
              const eventStart = new Date(event.start).toISOString();
              const eventEnd = new Date(event.end).toISOString();
              const isYellowEvent = event.color === "yellow";
              return !(
                isYellowEvent && // 確保只刪除黃色事件
                event.title === reserve.userBean.userName &&
                eventStart >= startDate &&
                eventEnd <= endDate
              );
            });
          } catch (error) {
            // 捕捉錯誤並顯示錯誤訊息
            Swal.fire("錯誤!", error.response?.data?.message || "刪除失敗", "error");
          }
        }
      });
    },
  },
};
</script>

<style scoped>
/* 主容器：水平佈局 */
.main-container {
  display: flex;
  flex-direction: row;
  width: 90%;
  height: 100%;
  justify-content: center; /* 水平居中 */
  align-items: center;     /* 垂直居中 */
  margin: 0 auto;          /* 確保容器本身在其父容器中居中 */
}

/* 行事曆區塊 */
.calendar-container {
  width: 60%;
  /* 左側佔 50% */
  padding-right: 10px;
}

/* 預約列表區塊 */
.reserve-list {
  width: 40%;
  /* 右側佔 50% */
  padding-left: 10px;
  border-left: 1px solid #ddd;
  margin-top: 50px;
}

/* 預約列表標題 */
.reserve-list-header {
  margin-bottom: 10px;
}

.reserve-list-header h3 {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}
.reserve-items {
  height: 800px;
  overflow-y: auto;
}
/* 預約列表中的每一項 */
.reserve-item {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 10px;
}

/* 每一筆預約的按鈕區域 */
.reserve-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

/* 事件顯示區域 */
.event-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 123, 255, 0.2);
  /* 淡藍色背景 */
  border-radius: 4px;
  padding: 4px;
  color: #000;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
}

/* 設定滾動條背景顏色 */
::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

/* 滾動條背景 */
::-webkit-scrollbar-track {
  background: #ffffff;  /* 白色背景 */
  border-radius: 10px;
}

/* 滾動條滑塊 */
::-webkit-scrollbar-thumb {
  background: #f0f0f0;  /* 非常淺的灰色滑塊 */
  border-radius: 10px;
}

/* 滾動條滑塊在滑動時顯示的顏色 */
::-webkit-scrollbar-thumb:hover {
  background: #e0e0e0;  /* 略深的灰色 */
}
</style>