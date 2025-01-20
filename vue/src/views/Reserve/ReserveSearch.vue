<template>
  <div>
    <h2 align="center">預約資料表</h2>
    <v-data-table :headers="headers" :items="filteredReservations" :items-per-page="10" class="elevation-1" dense>
      <template v-slot:top>
        <v-toolbar flat>
          <v-text-field v-model="search" label="搜尋" class="mx-4" clearable append-icon="mdi-magnify"></v-text-field>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="openDialog">
            <v-icon left>mdi-plus</v-icon> 新增資料
          </v-btn>
        </v-toolbar>
      </template>

      <!-- Define each column with inputs -->
      <template v-slot:[`item.reserveId`]="{ item }">
        <input type="number" class="short-input" readonly :value="item.reserveId" />
      </template>
      <template v-slot:[`item.userId`]="{ item }">
        <input type="text" class="short-input" v-model="item.userBean.userID" />
      </template>
      <template v-slot:[`item.caregiverId`]="{ item }">
        <input type="number" class="short-input" v-model="item.caregiverBean.caregiverNO" />
      </template>
      <template v-slot:[`item.startDate`]="{ item }">
        <input type="date" class="date-input" v-model="item.startDate" />
      </template>
      <template v-slot:[`item.endDate`]="{ item }">
        <input type="date" class="date-input" v-model="item.endDate" />
      </template>
      <template v-slot:[`item.orderDate`]="{ item }">
        <input type="date" class="date-input" v-model="item.orderDate" />
      </template>
      <template v-slot:[`item.totalPrice`]="{ item }">
        <input type="number" class="short-input" v-model="item.totalPrice" />
      </template>
      <template v-slot:[`item.status`]="{ item }">
        <select class="short-input" v-model="item.status">
          <option value="待確認">待確認</option>
          <option value="已取消">已取消</option>
        </select>
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
          <v-text-field v-model="newReservation.userBean.userID" label="使用者編號" required></v-text-field>
          <v-text-field v-model="newReservation.caregiverBean.caregiverNO" label="看護師編號" required></v-text-field>
          <v-text-field v-model="newReservation.startDate" label="開始日期" type="date" required></v-text-field>
          <v-text-field v-model="newReservation.endDate" label="結束日期" type="date" required></v-text-field>
          <v-text-field v-model="newReservation.orderDate" label="訂單日期" type="date" required></v-text-field>
          <v-text-field v-model="newReservation.totalPrice" label="總價格" type="number" required></v-text-field>
          <v-select v-model="newReservation.status" :items="statusOptions" label="狀態" required></v-select>
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
        { title: '預約編號', value: 'reserveId', sortable: true },
        { title: '使用者編號', value: 'userId', sortable: true },
        { title: '看護師編號', value: 'caregiverId', sortable: true },
        { title: '開始日期', value: 'startDate', sortable: true },
        { title: '結束日期', value: 'endDate', sortable: true },
        { title: '訂單日期', value: 'orderDate', sortable: true },
        { title: '總價格', value: 'totalPrice', sortable: true },
        { title: '狀態', value: 'status', sortable: true },
        { title: '操作', value: 'actions', sortable: false },
      ],
      reservations: [],
      dialog: false,
      newReservation: {
        userBean: {
          userID: '',
        },
        caregiverBean: {
          caregiverNO: '',
        },
        startDate: '',
        endDate: '',
        orderDate: '',
        totalPrice: '',
        status: '待確認',
      },
      statusOptions: ['待確認', '已取消'],
    };
  },
  created() {
    this.fetchReservations();
  },
  methods: {
    fetchReservations() {
      axios
        .get('http://localhost:8080/reserve')
        .then((response) => {
          this.reservations = response.data;
        })
        .catch((error) => {
          console.error('Error fetching reservations:', error);
        });
    },
    openDialog() {
      this.dialog = true;
    },
    addNewReservation() {
      axios.post('http://localhost:8080/reserve', this.newReservation)
        .then(() => {
          Swal.fire('成功!', '新增資料成功', 'success');
          this.dialog = false;
          this.fetchReservations();
        })
        .catch((error) => {
          Swal.fire('錯誤!', '新增資料失敗', 'error');
        });
    },
    updateReserve(item) {
      axios.put('http://localhost:8080/reserve', item)
        .then(() => {
          Swal.fire('成功!', '資料已更新', 'success');
          this.fetchReservations();
        })
        .catch((error) => {
          Swal.fire('錯誤!', error.message, 'error');
        });
    },
    deleteReserve(reserveId) {
      axios.delete(`http://localhost:8080/reserve/${reserveId}`)
        .then(() => {
          Swal.fire('成功!', '資料已刪除', 'success');
          this.fetchReservations();
        })
        .catch((error) => {
          Swal.fire('錯誤!', error.message, 'error');
        });
    },
  },
  computed: {
    filteredReservations() {
      return this.reservations.filter((reserve) => {
        const searchTerm = this.search.toLowerCase();
        return (
          reserve.reserveId?.toString().toLowerCase().includes(searchTerm) ||
          reserve.userBean.userID?.toLowerCase().includes(searchTerm) ||
          reserve.caregiverBean.caregiverNO?.toString().toLowerCase().includes(searchTerm) ||
          reserve.startDate?.toLowerCase().includes(searchTerm) ||
          reserve.endDate?.toLowerCase().includes(searchTerm) ||
          reserve.orderDate?.toLowerCase().includes(searchTerm) ||
          reserve.totalPrice?.toString().toLowerCase().includes(searchTerm) ||
          reserve.status?.toLowerCase().includes(searchTerm)
        );
      });
    },
  },
};
</script>

<style>
.short-input {
  width: 70px;
}

.date-input {
  width: 100px;
}
</style>
