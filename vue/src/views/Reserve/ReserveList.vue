<template>
    <div>
      <h2 align="center">預約列表</h2>
      <v-container>
        <v-row justify="center">
          <v-col cols="12" md="8">
            <v-list class="reservation-list">
              <v-list-item v-for="item in reservations" :key="item.reserveId" class="reservation-item">
                <v-row align="center" class="reservation-row">
                  <v-col cols="2" class="avatar-col">
                    <v-img :src="item.userBean.userPhoto || defaultPhoto" class="avatar-img"></v-img>
                  </v-col>
                  <v-col cols="8">
                    <v-list-item-title>
                      <strong>預約編號:</strong> {{ item.reserveId }} - <strong>看護師編號:</strong> {{ item.caregiverBean.caregiverNO }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      <strong>開始日期:</strong> {{ item.startDate }} - <strong>結束日期:</strong> {{ item.endDate }}
                    </v-list-item-subtitle>
                    <v-list-item-subtitle>
                      <strong>訂單日期:</strong> {{ item.orderDate }} - <strong>總價格:</strong> ${{ item.totalPrice }}
                    </v-list-item-subtitle>
                    <v-chip :color="getStatusColor(item.status)" small>
                      {{ item.status }}
                    </v-chip>
                  </v-col>
                  <v-col cols="2" class="action-col" v-if="item.status === '待確認'">
                    <v-btn @click="confirmDelete(item.reserveId)" icon>
                      <v-icon color="red">mdi-delete</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import Swal from 'sweetalert2';
  
  export default {
    data() {
      return {
        reservations: [],
        defaultPhoto: 'https://via.placeholder.com/50',
      };
    },
    created() {
      this.fetchReservations();
    },
    methods: {
      async fetchReservations() {
        try {
            const userResponse = await axios.get('http://localhost:8080/api/user/profile');
            this.userId = userResponse.data.id;
            const response = await axios.get(`http://localhost:8080/reserve/search/user/${this.userId}`);
            this.reservations = response.data;
          } catch (error) {
            console.error('Error fetching reservations:', error);
          };
      },
      confirmDelete(reserveId) {
        Swal.fire({
          title: '確定要取消本次預約嗎?',
          text: '此操作無法還原!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: '是, 取消預約!',
          cancelButtonText: '否'
        }).then((result) => {
          if (result.isConfirmed) {
            this.deleteReserve(reserveId);
          }
        });
      },
      deleteReserve(reserveId) {
        axios.delete(`http://localhost:8080/reserve/${reserveId}`)
          .then(() => {
            Swal.fire(
              '已取消!',
              '預約已成功取消.',
              'success'
            );
            this.fetchReservations();
          })
          .catch(error => {
            console.error('Error deleting reservation:', error);
          });
      },
      getStatusColor(status) {
        if (status === '待確認') return 'orange';
        if (status === '已接受') return 'green';
        return 'red'; // 已拒絕
      }
    }
  };
  </script>
  
  <style>
  .reservation-item {
    border-bottom: 1px solid #ddd;
    padding: 10px;
  }
  .reservation-row {
    display: flex;
    align-items: center;
  }
  .avatar-col {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .avatar-img {
    width: 60px;
    height: 60px;
    border-radius: 50%;
  }
  .action-col {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .reservation-list {
    /* max-height: 600px; 改為適當的高度 */
    height: 600px; /* 設置固定高度 */
    overflow-y: auto; /* 啟用垂直滾動 */
    border: 1px solid #ddd; /* 可選: 加邊框讓區域更加明顯 */
  }
  </style>
  