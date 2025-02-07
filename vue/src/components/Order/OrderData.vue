<template>
  <v-container>
    <v-card>
      <!-- <v-card-title>訂單分析</v-card-title> -->
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-select v-model="selectedYear" :items="availableYears" label="選擇年份" outlined dense />
          </v-col>
        </v-row>

        <v-card class="mt-4">
          <v-card-title><strong>月度訂單數量趨勢</strong></v-card-title>
          <v-card-text>
            <div style="position: relative; height: 300px;">
              <canvas ref="chartCanvas"></canvas>
            </div>
          </v-card-text>
        </v-card>

        <v-row class="mt-4">
          <v-col cols="12" md="3">
            <v-card class="stat-card" color="primary">
              <v-card-text class="white--text">
                <div class="text-subtitle-1 mb-2"><strong>總訂單數</strong></div>
                <div class="text-h4">{{ totalOrders }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card class="stat-card" color="info">
              <v-card-text class="white--text">
                <div class="text-subtitle-1 mb-2"><strong>平均每月訂單</strong></div>
                <div class="text-h4">{{ averageOrdersPerMonth }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card class="stat-card" color="success">
              <v-card-text class="white--text">
                <div class="text-subtitle-1 mb-2"><strong>最高訂單月份</strong></div>
                <div class="text-h4">{{ peakOrderMonth }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card class="stat-card" color="warning">
              <v-card-text class="white--text">
                <div class="text-subtitle-1 mb-2"><strong>總營業額</strong></div>
                <div class="text-h4">{{ totalPrice }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- 匯出 CSV 按鈕 -->
        <v-btn class="mt-4" color="secondary" @click="exportToCSV">
          匯出 CSV
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import axios from "axios";

const chartCanvas = ref(null);
const chart = ref(null);
const orders = ref([]);
const selectedYear = ref(new Date().getFullYear()); // 預設為當前年份
const monthLabels = [
  "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月",
];

// 獲取訂單資料
const fetchOrders = async () => {
  try {
    const response = await axios.get("http://localhost:8080/api/ordersAdmin/AllOrders");
    orders.value = response.data.map(order => ({
      ...order,
      orderDate: new Date(order.orderDate), // 確保日期格式正確
    }));
    console.log("Fetched Orders:", orders.value); // 檢查回傳的資料
    await nextTick();
    updateChart();
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
};

// 每月訂單數計算
const monthlyOrderCounts = computed(() => {
  const counts = new Array(12).fill(0);
  orders.value.forEach(order => {
    const orderDate = new Date(order.orderDate);
    if (orderDate.getFullYear() === selectedYear.value) {
      counts[orderDate.getMonth()]++;
    }
  });
  return counts;
});

// 可用年份計算
const availableYears = computed(() => {
  if (orders.value.length > 0) {
    const years = orders.value.map(order =>
      new Date(order.orderDate).getFullYear()
    );
    return [...new Set(years)].sort((a, b) => b - a);
  }
  return [new Date().getFullYear()];
});

// 統計資料
const totalOrders = computed(() =>
  monthlyOrderCounts.value.reduce((sum, count) => sum + count, 0)
);

const averageOrdersPerMonth = computed(() => {
  const total = totalOrders.value;
  const months = monthlyOrderCounts.value.filter(count => count > 0).length || 1;
  return Math.round(total / months);
});

const peakOrderMonth = computed(() => {
  if (monthlyOrderCounts.value.every(count => count === 0)) {
    return "無訂單";
  }
  const maxCount = Math.max(...monthlyOrderCounts.value);
  const maxIndex = monthlyOrderCounts.value.indexOf(maxCount);
  return monthLabels[maxIndex];
});

// 總營業額計算
const totalPrice = computed(() => {
  return orders.value
    .filter(order => new Date(order.orderDate).getFullYear() === selectedYear.value)
    .reduce((sum, order) => sum + (order.totalPrice || 0), 0);
});

// 更新圖表
const updateChart = () => {
  if (!chartCanvas.value) {
    console.error("Canvas element not found");
    return;
  }

  if (chart.value) {
    chart.value.destroy(); // 銷毀舊圖表
  }

  const ctx = chartCanvas.value.getContext("2d");
  chart.value = new Chart(ctx, {
    type: "line",
    data: {
      labels: monthLabels,
      datasets: [
        {
          label: "訂單數量",
          data: monthlyOrderCounts.value,
          borderColor: "#1867C0",
          backgroundColor: "rgba(24, 103, 192, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true },
      },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } },
      },
    },
  });
};

// 匯出 CSV 功能
const exportToCSV = () => {
  // 統計數據表頭
  const statisticsHeaders = [
    "總訂單數",
    "平均每月訂單數",
    "最高訂單月份",
    "總營業額"
  ];

  // 統計數據
  const statisticsRow = [
    totalOrders.value,
    averageOrdersPerMonth.value,
    peakOrderMonth.value,
    totalPrice.value
  ];

  // 訂單明細表頭
  const orderHeaders = [
    "訂單編號",
    "訂單日期",
    "總金額"
  ];

  // 訂單明細數據
  const orderRows = orders.value
    .filter(order => new Date(order.orderDate).getFullYear() === selectedYear.value)
    .map(order => [
      order.orderId,
      order.orderDate.toLocaleDateString(),
      order.totalPrice || 0
    ]);

  // 整理 CSV 內容
  const csvContent = [
    statisticsHeaders.join(","), // 第一行: 統計數據表頭
    statisticsRow.join(","),     // 第二行: 統計數據
    orderHeaders.join(","),      // 第三行: 訂單明細表頭
    ...orderRows.map(row => row.join(",")) // 從第四行開始: 訂單明細數據
  ].join("\n");

  // 添加 BOM 來確保 Excel 正確識別 UTF-8 編碼
  const bom = "\uFEFF";
  const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "orders.csv");
  link.click();
};

// 監聽年份變化
watch(selectedYear, () => {
  updateChart();
});

// 初始載入
onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
.stat-card {
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
