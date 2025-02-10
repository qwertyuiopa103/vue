<template>
  <div class="main-container">
    <!-- 左邊的行事曆區塊：顯示訂單 -->
    <v-sheet class="calendar-container">
      <div class="calendar-header">
        <v-calendar ref="calendar" v-model="focus" :events="events" color="primary" type="month"
          @click:event="showEventDetails">
          <!-- 使用插槽自定義事件顯示 -->
          <template v-slot:event="{ event }">
            <div v-if="event" class="event-btn" @click="showEventDetails(event)" :style="{
              backgroundColor:
                event.color === 'blue'
                  ? '#A3C8FF'
                  : event.color === 'red'
                    ? '#FFA3A3'
                    : event.color === 'yellow'
                      ? '#FFF4A3'
                      : event.color === 'green'
                        ? '#A3FFB3'
                        : '#FFFFFF'
            }">
              <span>{{ event.title }}</span>
            </div>
          </template>
        </v-calendar>
      </div>
    </v-sheet>

    <!-- 右邊的預約列表 -->
    <div class="reserve-list">
      <!-- 狀態圖例放在預約列表上方 -->
      <div class="status-legend">
        <div class="legend-item">
          <div class="color-box" style="background-color: #A3C8FF"></div>
          <span>進行中</span>
        </div>
        <div class="legend-item">
          <div class="color-box" style="background-color: #A3FFB3"></div>
          <span>已完成</span>
        </div>
        <div class="legend-item">
          <div class="color-box" style="background-color: #FFA3A3"></div>
          <span>已取消</span>
        </div>
        <div class="legend-item">
          <div class="color-box" style="background-color: #FFF4A3"></div>
          <span>待確認預約</span>
        </div>
      </div>
      <div class="reserve-list-header">
        <h3>預約列表</h3>
      </div>

      <div class="reserve-items">
        <div v-for="(reserve, index) in reserves" :key="index" class="reserve-item">
          <p>顧客: {{ reserve.userBean.userName }}</p>
          <p>開始時間: {{ formatDate(reserve.startDate) }}</p>
          <p>結束時間: {{ formatDate(reserve.endDate) }}</p>
          <p>訂單總金額: {{ reserve.totalPrice }}</p>
          <p>顧客地址: {{ reserve.userBean.userCity + reserve.userBean.userDistrict + reserve.userBean.userAddress }}</p>
          <div class="reserve-actions">
            <i class="fas fa-check-circle" @click="createOrder(reserve)"
              style="font-size: 36px; color: green; cursor: pointer;"></i>
            <i class="fas fa-times-circle" @click="deleteReserve(reserve, index)"
              style="font-size: 36px; color: red; cursor: pointer;"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 訂單詳細資訊對話框 -->
    <v-dialog v-model="showDialog" max-width="600">
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          {{ dialogTitle }}
        </v-card-title>

        <v-card-text class="mt-4">
          <template v-if="selectedEvent">
            <div v-if="selectedEvent.type === 'order' && selectedEvent.order" class="detail-container">
              <div class="photo-container" v-if="selectedEvent.order.user.userPhoto">
                <img :src="selectedEvent.order.user.userPhoto" alt="User Photo" class="user-photo" />
              </div>
              <div class="info-container">
                <v-list>
                  <v-list-item two-line>
                    <v-list-item-content>
                      <v-list-item-title>顧客姓名</v-list-item-title>
                      <v-list-item-subtitle>{{ selectedEvent.order.user.userName }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item two-line>
                    <v-list-item-content>
                      <v-list-item-title>開始時間</v-list-item-title>
                      <v-list-item-subtitle>{{ formatDate(selectedEvent.order.startDate) }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item two-line>
                    <v-list-item-content>
                      <v-list-item-title>結束時間</v-list-item-title>
                      <v-list-item-subtitle>{{ formatDate(selectedEvent.order.endDate) }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item two-line>
                    <v-list-item-content>
                      <v-list-item-title>訂單金額</v-list-item-title>
                      <v-list-item-subtitle>{{ selectedEvent.order.totalPrice }} 元</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item two-line>
                    <v-list-item-content>
                      <v-list-item-title>顧客地址</v-list-item-title>
                      <v-list-item-subtitle>{{
                        selectedEvent.order.user.userCity + selectedEvent.order.user.userDistrict + selectedEvent.order.user.userAddress
                        || '未提供地址' }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item two-line>
                    <v-list-item-content>
                      <v-list-item-title>連絡電話</v-list-item-title>
                      <v-list-item-subtitle>{{ selectedEvent.order.user.userPhone || '未提供電話' }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>

                </v-list>
              </div>
            </div>
            <div v-else-if="selectedEvent.type === 'reserve' && selectedEvent.reserve" class="detail-container">
              <div class="photo-container" v-if="selectedEvent.reserve.userBean.userPhoto">
                <img :src="selectedEvent.reserve.userBean.userPhoto" alt="User Photo" class="user-photo" />
              </div>
              <div class="info-container">
                <v-list>
                  <v-list-item two-line>
                    <v-list-item-content>
                      <v-list-item-title>預約顧客</v-list-item-title>
                      <v-list-item-subtitle>{{ selectedEvent.reserve.userBean.userName }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item two-line>
                    <v-list-item-content>
                      <v-list-item-title>開始時間</v-list-item-title>
                      <v-list-item-subtitle>{{ formatDate(selectedEvent.reserve.startDate) }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item two-line>
                    <v-list-item-content>
                      <v-list-item-title>結束時間</v-list-item-title>
                      <v-list-item-subtitle>{{ formatDate(selectedEvent.reserve.endDate) }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item two-line>
                    <v-list-item-content>
                      <v-list-item-title>預約金額</v-list-item-title>
                      <v-list-item-subtitle>{{ selectedEvent.reserve.totalPrice }} 元</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item two-line>
                    <v-list-item-content>
                      <v-list-item-title>顧客地址</v-list-item-title>
                      <v-list-item-subtitle>{{
                        selectedEvent.reserve.userBean.userCity + selectedEvent.reserve.userBean.userDistrict + selectedEvent.reserve.userBean.userAddress
                        || '未提供地址' }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item two-line>
                    <v-list-item-content>
                      <v-list-item-title>連絡電話</v-list-item-title>
                      <v-list-item-subtitle>{{ selectedEvent.reserve.userBean.userPhone || '未提供電話'
                        }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </div>
            </div>
          </template>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="showDialog = false">
            關閉
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";
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
    focus: [new Date()],
    events: [],
    reserves: [],
    orders: [],
    caregiverNO: 1,
    userId: '',
    showDialog: false,
    selectedEvent: null,

  }),

  computed: {
    dialogTitle() {
      if (this.selectedEvent) {
        return this.selectedEvent.type === 'order' ? '訂單詳細資訊' : '預約詳細資訊';
      }
      return '';
    },
  },

  async mounted() {
    const adapter = useDate();
    const startOfMonth = adapter.startOfDay(adapter.startOfMonth(new Date()));
    const endOfMonth = adapter.endOfDay(adapter.endOfMonth(new Date()));
    await this.fetchLoginUser();

    this.fetchOrdersByCaregiver({ start: startOfMonth, end: endOfMonth });
    this.fetchReservesByCaregiver(this.caregiverNO);
  },

  methods: {
    async fetchOrdersByCaregiver({ start, end }) {
      try {
        const response = await axios.get(
          `http://localhost:8080/orders/OrderByCaregiver/${this.caregiverNO}`
        );
        this.orders = response.data;
        this.mapOrdersToEvents(this.orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    },

    async fetchReservesByCaregiver(caregiverNO) {
      try {
        const response = await axios.get(
          `http://localhost:8080/reserve/search/caregiver/${caregiverNO}`
        );
        this.reserves = response.data.filter(reserve => reserve.status === "待確認");
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

        const caregiverResponse = await axios.get(
          `http://localhost:8080/api/caregiver/findByUserId/${this.userId}`
        );
        this.caregiverNO = caregiverResponse.data.caregiverNO;
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    },

    getUserPhotoUrl(photoData) {
      if (photoData) {
        return `data:image/jpeg;base64,${photoData}`;
      }
      return null;
    },

    showEventDetails(event) {
      this.selectedEvent = event;
      this.showDialog = true;
    },

    formatDate(date) {
      const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      };
      return new Date(date).toLocaleString('zh-TW', options);
    },

    mapOrdersToEvents(orders) {
      this.events = this.events.filter(event => event.type !== 'order');

      orders.forEach(order => {
        const userName = order.user ? order.user.userName : "Unknown User";
        const startDate = new Date(order.startDate);
        const endDate = new Date(order.endDate);

        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          let eventColor = 'blue';

          if (order.status === '已取消') {
            eventColor = 'red';
          } else if (new Date(endDate) < new Date()) {
            eventColor = 'green';
          } else if (new Date(endDate) >= new Date()) {
            eventColor = 'blue';
          }

          this.events.push({
            title: userName,
            start: new Date(currentDate),
            end: new Date(currentDate),
            color: eventColor,
            allDay: true,
            type: "order",
            orderId: order.orderId,
            order: order  // 存储完整订单信息
          });

          currentDate.setDate(currentDate.getDate() + 1);
        }
      });
    },

    mapReservesToEvents(reserves) {
      this.events = this.events.filter(event => event.type !== 'reserve');

      reserves.forEach(reserve => {
        const userName = reserve.userBean ? reserve.userBean.userName : "Unknown User";
        const startDate = new Date(reserve.startDate);
        const endDate = new Date(reserve.endDate);

        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          this.events.push({
            title: userName,
            start: new Date(currentDate),
            end: new Date(currentDate),
            color: "yellow",
            allDay: true,
            type: "reserve",
            reserveId: reserve.reserveId,
            reserve: reserve  // 存储完整预约信息
          });

          currentDate.setDate(currentDate.getDate() + 1);
        }
      });
    },

    async createOrder(reserve) {
      try {
        const reserveId = reserve.reserveId;

        const userWithoutImage = { ...reserve.userBean };
        delete userWithoutImage.userPhoto;

        const caregiverWithoutImage = { ...reserve.caregiverBean };
        delete caregiverWithoutImage.certifiPhoto;

        const order = {
          orderId: 0,
          user: userWithoutImage,
          caregiver: caregiverWithoutImage,
          cancellationId: null,
          orderDate: new Date(),
          startDate: reserve.startDate,
          endDate: reserve.endDate,
          status: "未付款",
          totalPrice: reserve.totalPrice,
          paymentMethod: null,
          TradeNo: null,
          MerchantTradeNo: null,
        };

        const response = await axios.post("http://localhost:8080/orders/createOrder", order);

        if (response.status === 201) {
          const deleteResponse = await axios.put(`http://localhost:8080/reserve/order/${reserveId}`);

          if (deleteResponse.status === 200) {
            this.reserves = this.reserves.filter(reserve => reserve.reserveId !== reserveId);

            // 更新行事曆事件
            this.events = this.events.filter(event => {
              if (event.type === 'reserve' && event.reserveId === reserveId) {
                return false;
              }
              return true;
            });

            // 重新獲取訂單並更新行事曆
            await this.fetchOrdersByCaregiver({
              start: this.focus[0],
              end: this.focus[0]
            });

            Swal.fire({
              icon: "success",
              title: "成功",
              text: "訂單新增成功，預約已轉為訂單",
              confirmButtonColor: '#FFC78E',
              confirmButtonText: "確定",
            });
          }
        }
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "失敗",
          text: error.message || "操作失敗，請稍後再試",
          confirmButtonText: "確定",
        });
      }
    },

    async deleteReserve(reserve, index) {
      Swal.fire({
        title: "刪除預約",
        text: `你確定要刪除預約 ID: ${reserve.reserveId} 嗎?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: '#FFB5B5',
        cancelButtonColor: '#95CACA',
        confirmButtonText: "確定",
        cancelButtonText: "取消",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const response = await axios.put(`http://localhost:8080/reserve/${reserve.reserveId}`);

            if (response.status === 200) {
              Swal.fire({
                title: '成功',
                text: '資料已刪除',
                icon: 'success',
                confirmButtonText: '確定',
                confirmButtonColor: '#FFC78E',
              });

              // 從預約列表中移除
              this.reserves.splice(index, 1);

              // 從行事曆事件中移除
              this.events = this.events.filter(event => {
                if (event.type === 'reserve' && event.reserveId === reserve.reserveId) {
                  return false;
                }
                return true;
              });
            }
          } catch (error) {
            Swal.fire("錯誤!", error.response?.data?.message || "刪除失敗", "error");
          }
        }
      });
    },
  },
};
</script>

<style scoped>
.main-container {
  display: flex;
  flex-direction: row;
  width: 90%;
  height: 100%;
  justify-content: center;
  align-items: flex-start;
  margin: 0 auto;
  padding-top: 20px;
}

.calendar-header {
  width: 100%;
  margin-bottom: 20px;
}

.status-legend {
  display: flex;
  /* justify-content: flex-end; */
  gap: 20px;
  padding: 10px;
  margin-bottom: 10px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.color-box {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.calendar-container {
  width: 60%;
  padding-right: 20px;
}

.reserve-list {
  width: 40%;
  padding-left: 20px;
  border-left: 1px solid #ddd;
  margin-top: 20px;
}

.reserve-list-header {
  margin-bottom: 20px;
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

.reserve-item {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 15px;
  margin-bottom: 15px;
}

.reserve-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 10px;
}

.event-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  padding: 4px;
  color: #000;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.event-btn:hover {
  transform: scale(1.05);
}

.detail-container {
  display: flex;
  gap: 20px;
  padding: 15px;
}

.photo-container {
  width: 150px;
  height: 150px;
  flex-shrink: 0;
}

.user-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.info-container {
  flex-grow: 1;
}

::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

::-webkit-scrollbar-track {
  background: #ffffff;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #f0f0f0;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #e0e0e0;
}
</style>