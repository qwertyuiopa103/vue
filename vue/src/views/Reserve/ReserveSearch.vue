<template>
  <div>
    <h2 align="center">預約資料表</h2>
    <v-data-table
      :headers="headers"
      :items="reservations"
      :search="search"
      :items-per-page="10"
      class="elevation-1"
      dense
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>預約資料表</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-text-field
            v-model="search"
            label="搜尋"
            class="mx-4"
            clearable
            append-icon="mdi-magnify"
          ></v-text-field>
          <v-btn color="primary" @click="addData">
            <v-icon left>mdi-plus</v-icon> 新增資料
          </v-btn>
        </v-toolbar>
      </template>

      <template v-slot:[`item.reserveId`]="{ item }">
        <input type="number" name="reserveId" readonly :value="item.reserveId" />
      </template>
      <template v-slot:[`item.userId`]="{ item }">
        <input type="text" name="userId" v-model="item.userBean.userID" />
      </template>
      <template v-slot:[`item.caregiverId`]="{ item }">
        <input type="number" name="caregiverId" v-model="item.caregiverBean.caregiverNO" />
      </template>
      <template v-slot:[`item.startTime`]="{ item }">
        <input type="date" name="startTime" v-model="item.startTime" />
      </template>
      <template v-slot:[`item.endTime`]="{ item }">
        <input type="date" name="endTime" v-model="item.endTime" />
      </template>
      <template v-slot:[`item.orderDate`]="{ item }">
        <input type="date" name="orderDate" v-model="item.orderDate" />
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <button @click="updateReserve(item)">更新</button>
        <button @click="deleteReserve(item.reserveId)">刪除</button>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';
export default {
  data() {
    return {
      search: '',
      headers: [
        { title: '預約編號', value: 'reserveId', sortable: true, key: 'reserveId' },
        { title: '使用者編號', value: 'userId', sortable: true, key: 'userId' },
        { title: '看護師編號', value: 'caregiverId', sortable: true, key: 'caregiverId' },
        { title: '開始時間', value: 'startTime', sortable: true, key: 'startTime' },
        { title: '結束時間', value: 'endTime', sortable: true, key: 'endTime' },
        { title: '訂單時間', value: 'orderDate', sortable: true, key: 'orderDate' },
        { title: '操作', value: 'actions', sortable: false, key: 'actions' },
    ],
      reservations: [],
    };
  },
  created() {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]); // 這樣可以取得 hash 中的查詢參數
    const userId = urlParams.get('userId');
    const caregiverId = urlParams.get('caregiverId');

    console.log('使用者:'+userId+'看護師:'+caregiverId);

    this.fetchReservations(userId, caregiverId);
  },
  methods: {
    fetchReservations(userId, caregiverId) {
      const data = { userId, caregiverId };
      const url = (!userId && !caregiverId) ? 'http://localhost:8080/reserve' : 'http://localhost:8080/reserve/search';

      axios
        .get(url, { params: data })
        .then(response => {
          this.reservations = response.data;
        })
        .catch(error => {
          console.error('Error fetching reservations:', error);
        });
    },
    addData() {
      // 導向新增資料的頁面
      this.$router.push("/admin/reserve/insert");
    },
    updateReserve(item) {
      const reserve = {
        reserveId: item.reserveId,
        userBean: item.userBean,  // 直接使用修改后的 userBean
        caregiverBean: item.caregiverBean,  // 直接使用修改后的 caregiverBean
        startTime: item.startTime,
        endTime: item.endTime,
        orderDate: item.orderDate,
      };

      Swal.fire({
        title: '確認更新?',
        text: '確定要更新這筆資料嗎？',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '是的，更新!',
        cancelButtonText: '取消',
      }).then((result) => {
        if (result.isConfirmed) {
          fetch(`http://localhost:8080/reserve`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(reserve),
          })
            .then((response) => {
              if (!response.ok) throw new Error('更新失敗');
              Swal.fire('成功!', '資料已更新', 'success');
              this.fetchReservations();
            })
            .catch((error) => {
              Swal.fire('錯誤!', error.message, 'error');
            });
        }
      });
    },
    deleteReserve(reserveId) {
      Swal.fire({
        title: '確認刪除?',
        text: '刪除後將無法恢復!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '是的，刪除!',
        cancelButtonText: '取消',
      }).then((result) => {
        if (result.isConfirmed) {
          fetch(`http://localhost:8080/reserve/${reserveId}`, {
            method: 'DELETE',
          })
            .then((response) => {
              if (!response.ok) throw new Error('刪除失敗');
              Swal.fire('成功!', '資料已刪除', 'success');
              this.fetchReservations();
            })
            .catch((error) => {
              Swal.fire('錯誤!', error.message, 'error');
            });
        }
      });
    },
  },
};
</script>

<style>
.v-data-table {
  border-collapse: collapse;
  width: 100%;
}

.v-data-table th, .v-data-table td {
  border: 1px solid #ddd;
  padding: 8px;
}

.v-data-table th {
  color: #000; /* 确保文字颜色是黑色，或者您可以选择其他颜色 */
  text-align: center;
  background-color: #f4f4f4;
}

</style>
