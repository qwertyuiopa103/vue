<template>
  <v-container fluid>
    <v-row>
      <!-- 左側行事曆 -->
      <v-col cols="7">
        <v-calendar ref="calendar" v-model="focus" :events="events" color="primary" type="month">
          <template v-slot:event="event">
            <div v-if="event" class="event-btn">
              <font-awesome-icon icon="xmark" class="red-icon" />
            </div>
          </template>
        </v-calendar>
      </v-col>

      <!-- 右側預約表單 -->
      <v-col cols="5" style="margin-top: 50px;">
        <v-sheet class="pa-4 elevation-2">
          <h3 class="text-center">預約服務</h3>
          <v-divider class="my-4"></v-divider>

          <!-- 看護師資訊 -->
          <div class="d-flex align-center mb-4">
            <v-avatar size="80">
              <img :src="selectedCaregiver.user.userPhoto || '/user/img/user3.png'" alt="Avatar"
                                style="width: 100%; height: auto; object-fit: cover;" />
            </v-avatar>
            <div class="ml-4">
              <h4 class="mb-2">{{ selectedCaregiver.user.userName }}</h4>
              <p class="text-caption">聯絡方式: {{ selectedCaregiver.user.userPhone }}</p>
              <p class="text-caption">專長: {{ selectedCaregiver.eduExperience }}</p>
            </div>
          </div>

          <v-form v-model="formValid">
            <!-- 開始日期 -->
            <v-text-field v-model="startDate" label="開始日期" type="date" :rules="[requiredRule]" required></v-text-field>

            <!-- 結束日期 -->
            <v-text-field v-model="endDate" label="結束日期" type="date" :rules="[requiredRule, endDateRule]"
              required></v-text-field>

            <!-- 預約按鈕 -->
            <v-btn :disabled="!formValid" @click="submitReservation" color="primary" block>
              提交預約
            </v-btn>
          </v-form>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";
import { useDate } from "vuetify";
import { VContainer, VRow, VCol, VSheet, VAvatar, VTextField, VDatePicker, VBtn } from "vuetify/components";
import { VCalendar } from "vuetify/labs/VCalendar";

export default {
  components: {
    VContainer,
    VRow,
    VCol,
    VSheet,
    VAvatar,
    VTextField,
    VDatePicker,
    VBtn,
    VCalendar,
  },

  data() {
  return {
    focus: [new Date()],
    events: [],
    selectedCaregiver: {
      user: {
        userName: '',
        userPhoto: '',
      },
      caregiverPhone: '',
      eduExperience: '',
    }, // 初始化selectedCaregiver的属性
    caregiverNO: 2,
    startDate: null,
    endDate: null,
    formValid: false,
    minDate: new Date().toISOString().substr(0, 10),
    maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    requiredRule: [(v) => !!v || '此欄位為必填'],  // requiredRule 設定
    endDateRule: [
      (v) => v >= this.startDate || '結束日期必須大於等於開始日期',
    ],
  };
},

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
        
        // 動態設置看護師資料（直接賦值完整物件）
        if (orders.length > 0 && orders[0].caregiver) {
          const caregiver = orders[0].caregiver;
          this.selectedCaregiver.user.userName = caregiver.user.userName || "未指定";
          this.selectedCaregiver.user.userPhoto = caregiver.user.userPhoto || "https://via.placeholder.com/150";
          this.selectedCaregiver.user.userPhone = caregiver.user.userPhone || "未知";
          this.selectedCaregiver.eduExperience = caregiver.eduExperience || "未提供";
        } else {
          this.selectedCaregiver.user.userName = "未指定";
          this.selectedCaregiver.user.userPhoto = "https://via.placeholder.com/150";
          this.selectedCaregiver.caregiverPhone = "未知";
          this.selectedCaregiver.eduExperience = "未提供";
        }
        
        this.mapOrdersToEvents(orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    },

    mapOrdersToEvents(orders) {
      this.events = [];
      orders.forEach(order => {
        const startDate = new Date(order.startDate);
        const endDate = new Date(order.endDate);

        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          this.events.push({
            title: `Order for Caregiver ${order.caregiver?.caregiverNO || "Unknown"}`,
            start: new Date(currentDate),
            end: new Date(currentDate),
            color: "red",
            allDay: true,
          });

          currentDate.setDate(currentDate.getDate() + 1);
        }
      });
    },

    async submitReservation() {
      if (this.startDate && this.endDate) {
        try {
          const reservation = {
            ...this.selectedCaregiver, // 包含看護師完整資料
            startDate: this.startDate,
            endDate: this.endDate,
          };

          const response = await axios.post(
            `http://localhost:8080/orders/reserve`,
            reservation
          );
          console.log("預約成功", response.data);
          alert("預約成功！");
        } catch (error) {
          console.error("預約錯誤:", error);
          alert("預約失敗！");
        }
      }
    },
  },
};
</script>


<style scoped>
/* 佈局和樣式調整 */
.v-container {
  padding: 16px;
}

.v-sheet {
  border-radius: 12px;
  background: #fff;
}

.d-flex.align-center {
  display: flex;
  align-items: center;
}

.v-avatar img {
  border-radius: 50%;
}

.text-center {
  text-align: center;
}
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