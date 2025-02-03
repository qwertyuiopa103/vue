<template>
  <v-container>
    <v-row>
      <!-- 左側篩選欄 -->
      <v-col cols="12" md="3">
        <v-card class="mb-4">
          <v-card-title>搜尋條件</v-card-title>
          <v-card-text>
            <!-- 關鍵字搜尋 -->
            <v-text-field
              v-model="searchKeyword"
              label="搜尋關鍵字"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
            ></v-text-field>

            <v-expansion-panels variant="accordion">
              <!-- 性別篩選 -->
              <v-expansion-panel>
                <v-expansion-panel-title>性別</v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-checkbox
                    v-for="gender in genderOptions"
                    :key="gender.value"
                    v-model="selectedGender"
                    :label="gender.label"
                    :value="gender.value"
                    density="comfortable"
                  ></v-checkbox>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <!-- 日薪範圍篩選 -->
              <v-expansion-panel>
                <v-expansion-panel-title>日薪範圍</v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-checkbox
                    v-for="range in salaryRanges"
                    :key="range.value"
                    v-model="selectedSalaryRanges"
                    :label="range.label"
                    :value="range.value"
                    density="comfortable"
                  ></v-checkbox>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <!-- 服務區域篩選 -->
              <v-expansion-panel>
                <v-expansion-panel-title>服務區域</v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-checkbox
                    v-for="area in serviceAreas"
                    :key="area.value"
                    v-model="selectedServiceAreas"
                    :label="area.label"
                    :value="area.value"
                    density="comfortable"
                  ></v-checkbox>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 右側護理人員列表 -->
      <v-col cols="12" md="9">
        <v-row>
          <v-col cols="12">
            <div class="text-subtitle-1">
              顯示 {{ paginatedCaregivers.length }} 位，共 {{ filteredCaregivers.length }} 位護理人員
            </div>
          </v-col>

          <!-- 護理人員卡片 -->
          <v-col
            v-for="caregiver in paginatedCaregivers"
            :key="caregiver.caregiverNO"
            cols="12"
            sm="6"
            md="4"
          >
            <v-card class="h-100">
              <div class="text-center pt-4">
                <!-- 點擊照片開啟詳細資料 -->
                <v-avatar
                  size="150"
                  @click="showDetails(caregiver)"
                  style="cursor: pointer"
                >
                  <v-img
                    :src="caregiver.user?.userPhoto || '/api/placeholder/150/150'"
                    :alt="caregiver.user?.userName"
                    cover
                  ></v-img>
                </v-avatar>
              </div>

              <v-card-title class="text-center">
                {{ caregiver.user?.userName || 'N/A' }}
              </v-card-title>

              <v-card-text>
                <div class="d-flex flex-column gap-2">
                  <div>
                    <v-icon icon="mdi-currency-usd" class="mr-2"></v-icon>
                    日薪：{{ caregiver.daylyRate }}元/日
                  </div>
                  <div>
                    <v-icon icon="mdi-briefcase" class="mr-2"></v-icon>
                    經驗：{{ caregiver.expYears }}年
                  </div>
                  <div>
                    <v-icon icon="mdi-school" class="mr-2"></v-icon>
                    學歷：{{ caregiver.education }}
                  </div>
                </div>
              </v-card-text>

              <v-card-actions class="justify-center pb-4">
                <v-btn 
                  color="primary" 
                  variant="elevated"
                  :to="`/reserve/calendar/${caregiver.caregiverNO}`"
                >
                  立即預約
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <!-- 分頁 -->
        <v-row>
          <v-col cols="12" class="d-flex justify-center mt-4">
            <v-pagination
              v-model="currentPage"
              :length="totalPages"
              :total-visible="7"
            ></v-pagination>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- 詳細資料對話框 -->
    <v-dialog
      v-model="detailDialog"
      max-width="600px"
    >
      <v-card v-if="selectedCaregiver">
        <v-card-title class="text-h5">
          護理人員詳細資料
          <v-btn icon="mdi-close" variant="text" @click="detailDialog = false" class="float-right"></v-btn>
        </v-card-title>

        <v-card-text>
          <v-row>
            <!-- 主要照片 -->
            <v-col cols="12" class="text-center">
              <v-avatar size="200">
                <v-img
                  :src="selectedCaregiver.user?.userPhoto || '/api/placeholder/200/200'"
                  :alt="selectedCaregiver.user?.userName"
                  cover
                ></v-img>
              </v-avatar>
            </v-col>

            <!-- 基本資料列表 -->
            <v-col cols="12">
              <v-list>
                <v-list-item>
                  <v-list-item-title>姓名</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedCaregiver.user?.userName }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>性別</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedCaregiver.caregiverGender }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>年齡</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedCaregiver.caregiverAge }} 歲</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>工作經驗</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedCaregiver.expYears }} 年</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>學歷</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedCaregiver.education }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>日薪</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedCaregiver.daylyRate }} 元/日</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>服務類型</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedCaregiver.services }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>服務區域</v-list-item-title>
                  <v-list-item-subtitle>{{ getServiceAreas(selectedCaregiver.serviceArea) }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>

            <!-- 證書照片 -->
            <!-- 證書照片 -->
<v-col cols="12" class="text-center">
  <div class="text-subtitle-2 mb-2">證書照片</div>
  <v-row justify="center">
    <v-col v-for="i in 5" :key="i" cols="12" sm="6" md="4">
      <template v-if="selectedCaregiver.certifiPhoto">
        <v-img
          v-if="selectedCaregiver.certifiPhoto[`photo${i}Base64`]"
          :src="selectedCaregiver.certifiPhoto[`photo${i}Base64`]"
          :alt="`證書照片 ${i}`"
          max-width="300"
          class="mx-auto mb-2"
          contain
          @error="handleImageError"
        >
          <template v-slot:placeholder>
            <div class="text-caption">載入中...</div>
          </template>
        </v-img>
        <div v-else class="text-caption">
          證書照片 {{i}} 未上傳
        </div>
      </template>
      <div v-else class="text-caption">
        無證書照片資料
      </div>
    </v-col>
  </v-row>
</v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="elevated"
            :to="`/reserve/calendar/${selectedCaregiver.caregiverNO}`"
          >
            立即預約
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

// 主要資料與參數
const caregivers = ref([]);
const searchKeyword = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(9);

// 篩選條件
const selectedGender = ref([]);
const selectedSalaryRanges = ref([]);
// 使用 SERVICEAREA 篩選，變數名稱更新為 selectedServiceAreas
const selectedServiceAreas = ref([]);

const detailDialog = ref(false);
const selectedCaregiver = ref(null);

// 選項設定
const genderOptions = [
  { label: '男', value: '男' },
  { label: '女', value: '女' }
];

const salaryRanges = [
  { label: '2000-2500元', value: '2000-2500' },
  { label: '2501-3000元', value: '2501-3000' },
  { label: '3001-3500元', value: '3001-3500' },
  { label: '3501元以上', value: '3501-up' }
];

const serviceAreas = [
  { label: '台北市', value: 'taipei_city' },
  { label: '新北市', value: 'new_taipei_city' },
  { label: '桃園市', value: 'taoyuan_city' },
  { label: '台中市', value: 'taichung_city' },
  { label: '台南市', value: 'tainan_city' },
  { label: '高雄市', value: 'kaohsiung_city' },
  { label: '新竹市', value: 'hsinchu_city' },
  { label: '新竹縣', value: 'hsinchu_county' },
  { label: '基隆市', value: 'keelung_city' },
  { label: '宜蘭縣', value: 'yilan_county' },
  { label: '苗栗縣', value: 'miaoli_county' },
  { label: '彰化縣', value: 'changhua_county' },
  { label: '南投縣', value: 'nantou_county' },
  { label: '雲林縣', value: 'yunlin_county' },
  { label: '嘉義市', value: 'chiayi_city' },
  { label: '嘉義縣', value: 'chiayi_county' },
  { label: '屏東縣', value: 'pingtung_county' },
  { label: '台東縣', value: 'taitung_county' },
  { label: '花蓮縣', value: 'hualien_county' },
  { label: '澎湖縣', value: 'penghu_county' },
  { label: '金門縣', value: 'kinmen_county' },
  { label: '連江縣', value: 'lienchiang_county' }
];

// computed 過濾條件
const filteredCaregivers = computed(() => {
  let filtered = caregivers.value;

  // 關鍵字搜尋（比對使用者姓名）
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    filtered = filtered.filter(c =>
      (c.user?.userName || '').toLowerCase().includes(keyword)
    );
  }

  // 性別篩選
  if (selectedGender.value.length > 0) {
    filtered = filtered.filter(c =>
      selectedGender.value.includes(c.caregiverGender)
    );
  }

  // 日薪範圍篩選
  if (selectedSalaryRanges.value.length > 0) {
    filtered = filtered.filter(c => {
      return selectedSalaryRanges.value.some(range => {
        const [min, max] = range.split('-');
        if (max === 'up') {
          return c.daylyRate >= parseInt(min);
        }
        return c.daylyRate >= parseInt(min) && c.daylyRate <= parseInt(max);
      });
    });
  }

  // SERVICEAREA 篩選
  if (selectedServiceAreas.value.length > 0) {
    filtered = filtered.filter(c => {
      // 假設 c.serviceArea 為一物件，key 為 serviceAreas 的 value 值，且值為布林型態
      return selectedServiceAreas.value.some(area => 
        c.serviceArea && c.serviceArea[area] === true
      );
    });
  }

  return filtered;
});

const paginatedCaregivers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredCaregivers.value.slice(start, start + itemsPerPage.value);
});

const totalPages = computed(() => {
  return Math.ceil(filteredCaregivers.value.length / itemsPerPage.value);
});

// 方法

// 取得所有護理人員資料
const fetchCaregivers = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/caregiver/findAllCaregiver');
    caregivers.value = response.data;
  } catch (error) {
    console.error('Error fetching caregivers:', error);
  }
};

// 點擊圖片顯示詳細資料對話框
const showDetails = (caregiver) => {
  selectedCaregiver.value = caregiver;
  detailDialog.value = true;
};

// 依據 serviceArea 物件轉換成可讀字串，使用 serviceAreas 陣列來對應
const getServiceAreas = (serviceArea) => {
  if (!serviceArea) return '未指定';
  const areas = [];
  for (const [key, value] of Object.entries(serviceArea)) {
    if (value === true) {
      const areaOption = serviceAreas.find(area => area.value === key);
      if (areaOption) {
        areas.push(areaOption.label);
      }
    }
  }
  return areas.length > 0 ? areas.join('、') : '未指定';
};

// 生命週期掛鉤
onMounted(() => {
  fetchCaregivers();
});
</script>

<style scoped>
.v-avatar {
  transition: transform 0.2s;
}
.v-avatar:hover {
  transform: scale(1.05);
}
</style>
