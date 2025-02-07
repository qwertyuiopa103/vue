<template>
  <div>
    <v-tabs v-model="tab" color="#8E8E8E" style="font-weight: bolder;">
      <v-tab>預約資料表</v-tab>
      <v-tab>統計圖表</v-tab>
    </v-tabs>

    <!-- 預約資料表 -->
    <v-tab-item v-if="tab === 0">
      <v-data-table :headers="headers" :items="filteredReservations" :items-per-page="10"
        class="elevation-1 fixed-table" dense>
        <template v-slot:top>
          <v-toolbar flat>
            <v-text-field v-model="search" label="搜尋" class="mx-4 mt-3" clearable
              append-icon="mdi-magnify"></v-text-field>
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
          <input type="text" class="date-input" v-model="item.userBean.userID" />
        </template>
        <template v-slot:[`item.caregiverId`]="{ item }">
          <input type="number" class="date-input" v-model="item.caregiverBean.caregiverNO" />
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
            <option value="已接受">已接受</option>
            <option value="已拒絕">已拒絕</option>
            <option value="已過期">已過期</option>
          </select>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn @click="updateReserve(item)" icon class="my-2" color="warning">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn @click="deleteReserve(item.reserveId)" icon class="mb-2" color="error">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-tab-item>

    <!-- 統計圖表 -->
    <v-tab-item v-if="tab === 1">
      <v-row class="chart">
        <v-col>
          <div class="d-flex align-center mb-4">
            <VSelect v-model="selectedCaregiver" :items="caregiverList" item-title="user.userName"
              item-value="caregiverNO" label="選擇看護師" class="caregiver-select mr-4" />
            <VSelect v-model="selectedYear" :items="availableYears" label="選擇年份" class="year-select" />
          </div>
          <canvas id="caregiverStatsChart"></canvas>
        </v-col>
      </v-row>
    </v-tab-item>

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
          <v-btn color="blue" @click="edit">一鍵輸入</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';
import Chart from 'chart.js/auto';

export default {
  data() {
    return {
      tab: 0, // 默認顯示「預約資料表」tab
      search: '',
      headers: [
        { title: '預約編號', value: 'reserveId', sortable: true, width: '110px' },
        { title: '會員編號', value: 'userId', sortable: true, width: '100px' },
        { title: '看護編號', value: 'caregiverId', sortable: true, width: '100px' },
        { title: '開始日期', value: 'startDate', sortable: true, width: '120px' },
        { title: '結束日期', value: 'endDate', sortable: true, width: '120px' },
        { title: '訂單日期', value: 'orderDate', sortable: true, width: '120px' },
        { title: '總價格', value: 'totalPrice', sortable: true, width: '80px' },
        { title: '狀態', value: 'status', sortable: true, width: '100px' },
        { title: '操作', value: 'actions', sortable: false, width: '120px' },
      ],
      reservations: [],
      caregiverList: [],
      selectedCaregiver: null,
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
      statusOptions: ['待確認', '已接受', '已拒絕', '已過期'],
      selectedYear: new Date().getFullYear(), // 預設顯示當前年份
      availableYears: [], // 將從預約數據中提取可用的年份
    };
  },
  created() {
    this.fetchReservations();
    this.fetchCaregivers();
  },
  //監聽人物的變化
  watch: {
    selectedCaregiver(newCaregiver) {
      if (newCaregiver) {
        this.updateChart();
      }
    },
    // ***** 監聽 tab 切換，當切換到統計圖表頁面時更新圖表
    tab(newTab) {
      if (newTab === 1 && this.selectedCaregiver) {
        this.$nextTick(() => {
          this.updateChart();  // 強制更新圖表
        });
      }
    },
    selectedYear() {
      if (this.selectedCaregiver) {
        this.updateChart();
      }
    },
  },
  mounted() {
    this.fetchReservations();
    this.fetchCaregivers();
    // 頁面加載時初始化第一位看護師 這是我需要設定圖表是預設第一位看護師
    if (this.caregiverList.length > 0) {
      this.selectedCaregiver = this.caregiverList[0];
    }
  },
  methods: {
    edit() {
      this.newReservation = {
        userBean: {
          userID: "USR0006",
        },
        caregiverBean: {
          caregiverNO: "3",
        },
        startDate: "2025-01-01",
        endDate: "2025-01-01",
        orderDate: "2025-01-01", // 當天日期
        totalPrice: 3000,
        status: "待確認",
      };
    },

    fetchReservations() {
      axios
        .get('http://localhost:8080/api/ReserveAdmin')
        .then((response) => {
          this.reservations = response.data;
          this.updateAvailableYears(); // 更新可用年份列表
          this.updateChart();
        })
        .catch((error) => {
          console.error('Error fetching reservations:', error);
        });
    },
    async fetchCaregivers() {
      try {
        const response = await axios.get('http://localhost:8080/api/caregiver/findAllCaregiver');
        this.caregiverList = response.data;
        if (this.caregiverList.length > 0) {
          this.selectedCaregiver = this.caregiverList[0].caregiverNO;
          this.updateChart(); // 在设置默认值后更新图表
        }
      } catch (error) {
        console.error('Error fetching caregivers:', error);
      }
    },
    //更新圖表 同樣可以做初始化
    updateChart() {
      const caregiverStats = this.getCaregiverStats(this.selectedCaregiver);
      const chartData = {
        labels: Array.from({ length: 12 }, (_, i) => `${i + 1}月`), // 固定顯示 1-12 月
        datasets: [
          {
            label: `${this.selectedYear}年預約數`,
            data: Object.values(caregiverStats),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1,
          },
        ],
      };
      //會先把舊的圖表刪掉
      const ctx = document.getElementById('caregiverStatsChart').getContext('2d');
      if (this.caregiverStatsChart) {
        this.caregiverStatsChart.destroy();
      }
      //生成新的圖表
      this.caregiverStatsChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
          scales: {
            x: {
              title: {
                display: true,
                text: '月份'
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: '預約數量'
              }
            }
          }
        }
      });
    },
    //過濾我的訂單資訊 只找選擇的人的那筆資料
    getCaregiverStats(caregiverNO) {
      const stats = {};
      // 初始化所有月份為 0
      for (let month = 1; month <= 12; month++) {
        stats[month] = 0;
      }

      // 篩選指定年份和看護師的預約
      this.reservations
        .filter(reservation => {
          const reserveDate = new Date(reservation.startDate);
          return (
            reservation.caregiverBean.caregiverNO === caregiverNO &&
            reserveDate.getFullYear() === this.selectedYear
          );
        })
        .forEach(reservation => {
          const month = new Date(reservation.startDate).getMonth() + 1;
          stats[month]++;
        });

      return stats;
    },
    openDialog() {
      this.dialog = true;
    },
    addNewReservation() {
      axios.post('http://localhost:8080/api/ReserveAdmin', this.newReservation)
        .then(() => {
          Swal.fire('成功!', '新增資料成功', 'success');
          this.dialog = false;
          this.fetchReservations();
        })
        .catch((error) => {
          Swal.fire('錯誤!', '新增資料失敗', 'error');
        });
    },
    updateReserve(item) {// 創建一個淺拷貝的物件，避免直接修改原資料
      const cleanItem = JSON.parse(JSON.stringify(item));

      // 確保 `userBean` 存在，並移除 `profilePicture`
      if (cleanItem.userBean) {
        delete cleanItem.userBean.userPhoto; // 假設圖片欄位是 `profilePicture`
      }

      // 確保 `caregiverBean` 存在，並移除 `profilePicture`
      if (cleanItem.caregiverBean) {
        delete cleanItem.caregiverBean.certifiPhoto;
      }

      axios.put('http://localhost:8080/api/ReserveAdmin', cleanItem)
        .then(() => {
          Swal.fire({
            title: '成功',
            text: '資料已更新',
            icon: 'success',
            confirmButtonText: '確定',
            confirmButtonColor: '#FFC78E',
          });
          this.fetchReservations();
        })
        .catch((error) => {
          Swal.fire('錯誤!', error.message, 'error');
        });
    },
    deleteReserve(reserveId) {
      axios.delete(`http://localhost:8080/api/ReserveAdmin/${reserveId}`)
        .then(() => {
          Swal.fire({
            title: '成功',
            text: '資料已刪除',
            icon: 'success',
            confirmButtonText: '確定',
            confirmButtonColor: '#FFC78E',
          });
          this.fetchReservations();
        })
        .catch((error) => {
          Swal.fire('錯誤!', error.message, 'error');
        });
    },
    updateAvailableYears() {
      const years = new Set(
        this.reservations.map(reservation =>
          new Date(reservation.startDate).getFullYear()
        )
      );
      this.availableYears = Array.from(years).sort();
      if (this.availableYears.length > 0 && !this.availableYears.includes(this.selectedYear)) {
        this.selectedYear = this.availableYears[0];
      }
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
  width: 100px;
}

.date-input {
  width: 120px;
}

.chart {
  width: 70%;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.caregiver-select {
  width: 150px;
}

.year-select {
  width: 150px;
}

.fixed-table ::v-deep table {
  /* table-layout: fixed !important; */
  width: 100% !important;
  /* 確保表格寬度佔滿 */
}

th {
  font-weight: bold !important;
}
</style>