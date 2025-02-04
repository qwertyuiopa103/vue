<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    Title,
    CategoryScale,
    ArcElement,
    PieController,
    Tooltip,
    Legend
} from 'chart.js';
import 'vuetify/styles'; // 確保引入 Vuetify 的樣式
import { createVuetify } from 'vuetify';
import { VAutocomplete } from 'vuetify/components';

// 註冊 Vuetify 元件
const vuetify = createVuetify();

// 註冊 Chart.js 所需的模組
Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    Title,
    CategoryScale,
    ArcElement,
    PieController,
    Tooltip,
    Legend
);

// 定義反應式變量
const loading = ref(false);
const users = ref([]);
const years = ref([]);
const counties = ref([]);
const selectedYear = ref(null);
const selectedCounty = ref("臺中市");

let lineChart = null;
let countyPieChart = null;
let districtPieChart = null;

const countyColors = {
    '嘉義縣': '#BEBEBE',   // 灰色基準
    '屏東縣': '#FF9999',   // 淺粉紅
    '彰化縣': '#99CCFF',   // 淺藍
    '新北市': '#FFAD86',   // 金色
    '臺中市': '#66CC99',   // 青綠
    '臺北市': '#CC99FF',   // 紫色
    '臺南市': '#E1C4C4',   // 橙色
    '苗栗縣': '#6699CC',   // 中藍
    '雲林縣': '#FFCC66',   // 淡黃
    '桃園市': '#99CC66'    // 草綠
};

// 抓取用戶資料
const fetchUsers = async () => {
    loading.value = true;
    try {
        const response = await axios.get('/UserAdmin/users');
        console.log('API 返回資料:', response.data);
        if (response.status === 200) {
            //users.value = response.data.filter(user => !user.userDeleted);
            users.value = response.data;
            processData();
            initializeCharts();
        } else {
            throw new Error('Failed to fetch users');
        }
    } catch (error) {
        console.error(error);
        Swal.fire('錯誤', '取得用戶資料失敗', 'error');
    } finally {
        loading.value = false;
    }
};

// 處理數據以適應圖表需求
const processData = () => {
    // 提取年份
    const yearSet = new Set();
    users.value.forEach(user => {
        const creationDate = new Date(user.userSecurity.userCreat);
        if (!isNaN(creationDate)) { // 檢查日期有效性
            const year = creationDate.getFullYear();
            yearSet.add(year);
        }
    });
    years.value = Array.from(yearSet).sort((a, b) => a - b);

    // 提取縣市
    const countySet = new Set();
    users.value.forEach(user => {
        if (user.userCity) { // 確保 userCity 存在
            countySet.add(user.userCity);
        }
    });
    counties.value = Array.from(countySet).sort();

    // 初始化選擇
    if (!selectedYear.value && years.value.length > 0) {
        selectedYear.value = years.value[0];
    }
    if (!selectedCounty.value && counties.value.length > 0) {
        selectedCounty.value = counties.value[0];
    }
};

// 初始化圖表
const initializeCharts = () => {
    // 折線圖 - 用戶創建時間 (月份)
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    lineChart = new Chart(lineCtx, {
        type: 'line',
        data: getLineChartData(),
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `用戶創建時間 (${selectedYear.value} 年) - 每月數量`,
                    font: {
                        size: 20 // 修改標題字體大小，例如 20px
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                },
                legend: {
                    display: true,
                    position: 'top',
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '月份',
                        font: {
                            size: 14 // 修改標題字體大小，例如 20px
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '用戶數量',
                        font: {
                            size: 14 // 修改標題字體大小，例如 20px
                        }
                    },
                    beginAtZero: true,
                    ticks: {
                        precision: 0 // 確保不顯示小數點
                    }
                }
            }
        }
    });

    // 縣市圓餅圖 - 縣市分布
    const countyCtx = document.getElementById('countyPieChart').getContext('2d');
    countyPieChart = new Chart(countyCtx, {
        type: 'pie',
        data: getCountyPieChartData(),
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '縣市分布',
                    font: {
                        size: 20 // 修改標題字體大小，例如 20px
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.formattedValue || 0;
                            return `${label}: ${value}`;
                        }
                    }
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: 16 // 修改圖例文字大小，例如 14px
                        }
                    }
                },
            }
        }
    });

    // 鄉鎮區圓餅圖 - 鄉鎮區分布
    const districtCtx = document.getElementById('districtPieChart').getContext('2d');
    districtPieChart = new Chart(districtCtx, {
        type: 'doughnut',
        data: getDistrictPieChartData(),
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '鄉鎮區分布',
                    font: {
                        size: 20 // 修改標題字體大小，例如 20px
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.formattedValue || 0;
                            return `${label}: ${value}`;
                        }
                    }
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: 16 // 修改圖例文字大小，例如 14px
                        }
                    }
                },
            }
        }
    });
};

// 更新 Line Chart 數據
const updateLineChart = () => {
    if (lineChart) {
        lineChart.data = getLineChartData();
        lineChart.options.plugins.title.text = `用戶創建時間 (${selectedYear.value} 年) - 每月數量`;
        lineChart.update();
    }
};

// 更新 District Pie Chart 數據
const updateDistrictChart = () => {
    if (districtPieChart) {
        districtPieChart.data = getDistrictPieChartData();
        districtPieChart.update();
    }
};

// 獲取 Line Chart 的數據 (每月)
const getLineChartData = () => {
    const labels = [
        '一月', '二月', '三月', '四月', '五月', '六月',
        '七月', '八月', '九月', '十月', '十一月', '十二月'
    ];
    const data = Array(12).fill(0); // 初始化 12 個月的數據為 0

    users.value.forEach(user => {
        const creationDate = new Date(user.userSecurity.userCreat);
        if (!isNaN(creationDate)) { // 檢查日期有效性
            const year = creationDate.getFullYear();
            const month = creationDate.getMonth(); // 0-11

            if (year === selectedYear.value) {
                data[month] += 1;
            }
        }
    });

    return {
        labels,
        datasets: [{
            label: '用戶創建數量',
            data,
            borderColor: '#5CADAD', // 使用基準色
            backgroundColor: '#5CADAD33', // 半透明填充
            fill: true,
            tension: 0.1,
            font: {
                size: 14 // 修改標題字體大小，例如 20px
            }
        }]
    };
};

// 獲取 County Pie Chart 的數據
const getCountyPieChartData = () => {
    const labels = counties.value;
    const data = labels.map(county => {
        return users.value.filter(user => user.userCity === county).length;
    });

    const backgroundColors = labels.map(county => countyColors[county] || 'rgba(201, 203, 207, 0.6)');

    return {
        labels,
        datasets: [{
            data,
            backgroundColor: backgroundColors,
            hoverOffset: 4
        }]
    };
};

// 獲取 District Pie Chart 的數據
const getDistrictPieChartData = () => {
    if (!selectedCounty.value) {
        return {
            labels: [],
            datasets: []
        };
    }

    // 假設用戶資料中有 district 欄位
    const filteredUsers = users.value.filter(user => user.userCity === selectedCounty.value);
    const districtCountMap = {};
    filteredUsers.forEach(user => {
        const district = user.userDistrict || '未指定';
        districtCountMap[district] = (districtCountMap[district] || 0) + 1;
    });

    const labels = Object.keys(districtCountMap);
    const data = Object.values(districtCountMap);
    const backgroundColors = generateColors(labels.length);

    return {
        labels,
        datasets: [{
            data,
            backgroundColor: backgroundColors,
            hoverOffset: 4
        }]
    };
};

// 生成固定顏色方案以保持一致性
const predefinedColors = [
    'rgba(255, 99, 132, 0.6)',
    'rgba(54, 162, 235, 0.6)',
    'rgba(255, 206, 86, 0.6)',
    'rgba(75, 192, 192, 0.6)',
    'rgba(153, 102, 255, 0.6)',
    'rgba(255, 159, 64, 0.6)'
];

const generateColors = (num) => {
    const colors = [];
    for (let i = 0; i < num; i++) {
        colors.push(predefinedColors[i % predefinedColors.length]);
    }
    return colors;
};

// 在組件掛載時抓取用戶資料
onMounted(() => {
    fetchUsers();
});

// 監聽年份變化以更新折線圖
watch(selectedYear, () => {
    updateLineChart();
});

// 監聽縣市變化以更新鄉鎮區圓餅圖
watch(selectedCounty, () => {
    updateDistrictChart();
});
</script>

<template>
    <div>
        <div class="filters">
            <div class="filter">
                <v-autocomplete label="選擇年份" v-model="selectedYear" :items="years" :menu-props="{ maxHeight: '400' }"
                    @change="updateLineChart"></v-autocomplete>
            </div>


        </div>

        <!-- 圖表區域 -->
        <div class="charts">
            <!-- 折線圖獨佔一行 -->
            <div class="chart-row full-width">
                <canvas id="lineChart"></canvas>
            </div>
        </div>
        <div class="filters mt-5">
            <div class="filter2">
                <v-autocomplete label="選擇縣市" v-model="selectedCounty" :items="counties"
                    :menu-props="{ maxHeight: '400' }" @change="updateDistrictChart"></v-autocomplete>
            </div>
        </div>
        <div class="charts">
            <!-- 兩個圓餅圖並列顯示 -->
            <div class="chart-row side-by-side">
                <canvas id="countyPieChart"></canvas>
                <canvas id="districtPieChart"></canvas>
            </div>
        </div>

        <!-- 加載中指示 -->
        <div v-if="loading" class="loading">
            加載中...
        </div>
    </div>
</template>

<style scoped>
/* .filters {
    display: flex;
} */

.filter {
    display: flex;

    /* flex-direction: column; */
    width: 200px;
    /* 設置固定寬度以確保一致性 */
}

.filter2 {
    display: flex;
    margin-left: 670px;
    /* flex-direction: column; */
    width: 200px;
    /* 設置固定寬度以確保一致性 */
}

.charts {
    display: flex;
    flex-direction: column;
    gap: 40px;
}

.chart-row {
    display: flex;
    justify-content: center;
    gap: 20px;
}

.chart-row.full-width canvas {
    max-width: 800px;
    width: 100%;
    height: 400px !important;
}

.chart-row.side-by-side {
    flex-wrap: wrap;
    justify-content: center;
}

.chart-row.side-by-side canvas {
    max-width: 500px;
    width: 100%;
    height: 500px !important;
}

.loading {
    text-align: center;
    font-size: 1.5em;
    color: #555;
    margin-top: 20px;
}
</style>