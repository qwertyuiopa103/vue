<template>
  <div>
    <h2 align="center">預約資料表</h2>
    <v-data-table :headers="headers" :items="filteredReservations" :items-per-page="10" class="elevation-1" dense>
      <template v-slot:top>
        <v-toolbar flat>
          <!-- <v-toolbar-title>預約資料表</v-toolbar-title> -->
          <v-text-field v-model="search" label="搜尋" class="mx-4" clearable append-icon="mdi-magnify"></v-text-field>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="openDialog">
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
        <v-btn @click="updateReserve(item)" icon>
          <v-icon color="black">mdi-pencil</v-icon>
        </v-btn>
        <v-btn @click="deleteReserve(item.reserveId)" icon>
          <v-icon color="black">mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <!-- Dialog for adding new reservation -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">新增預約資料</span>
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="newReservation.reserveId" label="預約編號" required
            :disabled="isReserveIdDisabled"></v-text-field>

          <!-- 使用者編號輸入框 -->
          <v-text-field v-model="newReservation.userBean.userID" label="使用者編號" required></v-text-field>

          <!-- 看護師編號輸入框 -->
          <v-text-field v-model="newReservation.caregiverBean.caregiverNO" label="看護師編號" required></v-text-field>

          <v-text-field v-model="newReservation.startTime" label="開始時間" type="date" required></v-text-field>
          <v-text-field v-model="newReservation.endTime" label="結束時間" type="date" required></v-text-field>
          <v-text-field v-model="newReservation.orderDate" label="訂單時間" type="date" required></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn color="green darken-1" @click="addNewReservation">新增</v-btn>
          <v-btn color="red darken-1" @click="dialog = false">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
      dialog: false,
      newReservation: {
        reserveId: '',
        userBean: {
          userID: '',  // 使用者編號
        },
        caregiverBean: {
          caregiverNO: '',  // 看護師編號
        },
        startTime: '',
        endTime: '',
        orderDate: '',
      },
      isReserveIdDisabled: false,
    };
  },
  created() {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const userId = urlParams.get('userId');
    const caregiverId = urlParams.get('caregiverId');
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
    openDialog() {
      this.dialog = true;  // 打開 dialog
    },
    addNewReservation() {
      const reservation = this.newReservation;

      // 傳送帶有關聯的資料
      axios.post('http://localhost:8080/reserve', reservation)
        .then(response => {
          Swal.fire('成功!', '新增資料成功', 'success');
          this.dialog = false;  // 關閉 dialog
          this.fetchReservations();  // 更新預約資料表
        })
        .catch(error => {
          Swal.fire('錯誤!', '新增資料失敗', 'error');
        });
    },
    updateReserve(item) {
      const reserve = {
        reserveId: item.reserveId,
        userBean: item.userBean,
        caregiverBean: item.caregiverBean,
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
  computed: {
    filteredReservations() {
      return this.reservations.filter(reserve => {
        const searchTerm = this.search.toLowerCase();
        return (
          reserve.reserveId?.toString().toLowerCase().includes(searchTerm) ||
          reserve.userBean.userID?.toLowerCase().includes(searchTerm) ||
          reserve.caregiverBean.caregiverNO?.toString().toLowerCase().includes(searchTerm) ||
          reserve.startTime?.toLowerCase().includes(searchTerm) ||
          reserve.endTime?.toLowerCase().includes(searchTerm) ||
          reserve.orderDate?.toLowerCase().includes(searchTerm)
        );
      });
    },
  },
};
</script>

<style scoped>
/* .v-data-table {
  border-collapse: collapse;
  width: 100%;
}

.v-data-table th,
.v-data-table td {
  border: 1px solid #ddd;
  padding: 8px;
}

.v-data-table th {
  color: #000;
  text-align: center;
  background-color: #f4f4f4;
}

.v-dialog .v-card {
  padding: 20px;
} */
</style>

