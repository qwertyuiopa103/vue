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
              <p class="text-caption">服務等級: {{ selectedCaregiver.services }}</p>
              <p class="text-caption">每日薪水: {{ selectedCaregiver.daylyRate }}</p>
            </div>
          </div>

          <v-form v-model="formValid">
            <!-- 開始日期 -->
            <v-text-field v-model="startDate" label="開始日期" type="date" required></v-text-field>

            <!-- 結束日期 -->
            <v-text-field v-model="endDate" label="結束日期" type="date" required></v-text-field>

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
        caregiverNO: '',
        user: {
          userName: '',
          userPhoto: '',
          userPhone: '',
          userEmail: '',
        },
        caregiverPhone: '',
        eduExperience: '',
        daylyRate: '',
        services: '',
      }, // 初始化selectedCaregiver的属性
      caregiverNO: this.$route.params.caregiverNO,
      startDate: null,
      endDate: null,
      formValid: false,
      minDate: new Date().toISOString().substr(0, 10),
      maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    };
  },

  mounted() {
    const adapter = useDate();
    const startOfMonth = adapter.startOfDay(adapter.startOfMonth(new Date()));
    const endOfMonth = adapter.endOfDay(adapter.endOfMonth(new Date()));
    this.fetchCaregiver();
    this.fetchOrdersByCaregiver({ start: startOfMonth, end: endOfMonth });
  },

  methods: {
    async fetchCaregiver() {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/caregiver/findCaregiver/${this.caregiverNO}`
        );
        const caregiver = response.data;
        console.log(caregiver);

        // **動態設置 selectedCaregiver**
        this.selectedCaregiver.caregiverNO = caregiver.caregiverNO || null;
        this.selectedCaregiver.user.userName = caregiver.user.userName || "未指定";
        this.selectedCaregiver.user.userPhoto = caregiver.user.userPhoto || "https://via.placeholder.com/150";
        this.selectedCaregiver.user.userPhone = caregiver.user.userPhone || "未知";
        this.selectedCaregiver.user.userEmail = caregiver.user.userEmail || "未知";
        this.selectedCaregiver.eduExperience = caregiver.eduExperience || "未提供";
        this.selectedCaregiver.daylyRate = caregiver.daylyRate || "未提供";
        this.selectedCaregiver.services = caregiver.services || "未提供";
      } catch (error) {
        console.error("Error fetching caregiver info:", error);
        this.selectedCaregiver = {
          caregiverNO: null,
          user: {
            userName: "未指定",
            userPhoto: "https://via.placeholder.com/150",
            userPhone: "未知",
            userEmail: "未知",
          },
          eduExperience: "未提供",
          daylyRate: "未提供",
        };
      }
    },
    async fetchOrdersByCaregiver({ start, end }) {
      try {
        const response = await axios.get(
          `http://localhost:8080/orders/OrderByCaregiver/${this.caregiverNO}`
        );
        const orders = response.data;

        // 動態設置看護師資料（直接賦值完整物件）
        // if (orders.length > 0 && orders[0].caregiver) {
        //   const caregiver = orders[0].caregiver;
        //   this.selectedCaregiver.caregiverNO = this.caregiverNO;
        //   this.selectedCaregiver.user.userName = caregiver.user.userName || "未指定";
        //   this.selectedCaregiver.user.userPhoto = caregiver.user.userPhoto || "https://via.placeholder.com/150";
        //   this.selectedCaregiver.user.userPhone = caregiver.user.userPhone || "未知";
        //   this.selectedCaregiver.eduExperience = caregiver.eduExperience || "未提供";
        //   this.selectedCaregiver.hourlyRate = caregiver.hourlyRate || "未提供";
        // } else {
        //   this.selectedCaregiver.caregiverNO = null;
        //   this.selectedCaregiver.user.userName = "未指定";
        //   this.selectedCaregiver.user.userPhoto = "https://via.placeholder.com/150";
        //   this.selectedCaregiver.caregiverPhone = "未知";
        //   this.selectedCaregiver.eduExperience = "未提供";
        //   this.selectedCaregiver.hourlyRate = caregiver.hourlyRate || "未提供";
        // }

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
      const today = new Date();

      if (!this.startDate) {
        Swal.fire({
          icon: "warning",
          title: "欄位未填",
          text: "請選擇開始日期",
        });
        return;
      }
      if (!this.endDate) {
        Swal.fire({
          icon: "warning",
          title: "欄位未填",
          text: "請選擇結束日期",
        });
        return;
      }
      if (this.endDate < this.startDate) {
        Swal.fire({
          icon: "error",
          title: "日期錯誤",
          text: "結束日期必須大於等於開始日期",
        });
        return;
      }
      if (new Date(this.startDate) <= today) {
        Swal.fire({
          icon: "error",
          title: "日期錯誤",
          text: "只能預約當日以後的服務",
        });
        return;
      }
      try {
        const userResponse = await axios.get("http://localhost:8080/api/user/profile");

        const data = userResponse.data;

        const userBean = {
          userID: data.id,
          userName: data.name,
          userEmail: data.email,
        };
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);

        // 計算天數（包含開始與結束當天）
        const timeDiff = end.getTime() - start.getTime();
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;
        const dailyPrice = this.selectedCaregiver.daylyRate || 0;
        const totalPrice = days * dailyPrice;

        const reservation = {
          userBean: userBean,
          caregiverBean: this.selectedCaregiver, // 包含看護師完整資料
          startDate: this.startDate,
          endDate: this.endDate,
          orderDate: today,
          totalPrice: totalPrice,
          status: "待確認",
        };

        const response = await axios.post(
          `http://localhost:8080/reserve`,
          reservation
        );
        Swal.fire({
          icon: "success",
          title: "預約成功",
          text: "您的預約已提交！",
          confirmButtonText: "確定"
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "預約失敗",
          text: "發生錯誤，請稍後再試！",
          confirmButtonText: "確定"
        });
      }
    },
  },
};
</script>


<style scoped>
/* 佈局和樣式調整 */
.v-container {
  padding: 16px;
  width: 90%;
  height: 100%;
  justify-content: center;
  /* 水平居中 */
  align-items: center;
  /* 垂直居中 */
  margin: 0 auto;
  /* 確保容器本身在其父容器中居中 */
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