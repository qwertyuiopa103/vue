<template>
  <div class="container">
    <div class="row">
      <!-- 左側篩選欄 -->
      <div class="col-lg-3">
        <div class="sidebar">
          <div class="widget border-0">
            <div class="search">
              <input class="form-control" type="text" v-model="searchKeyword" placeholder="搜尋關鍵字">
            </div>
          </div>
          
          <!-- 性別篩選 -->
          <div class="widget">
            <div class="widget-title widget-collapse">
              <h6>性別</h6>
              <a class="ml-auto" @click="toggleSection('gender')" role="button">
                <i class="fas fa-chevron-down"></i>
              </a>
            </div>
            <div class="collapse show" id="gender">
              <div class="widget-content">
                <div class="custom-control custom-checkbox" v-for="(gender, index) in genderOptions" :key="'gender'+index">
                  <input type="checkbox" class="custom-control-input" 
                         :id="'gender'+index"
                         v-model="selectedGender"
                         :value="gender.value">
                  <label class="custom-control-label" :for="'gender'+index">{{ gender.label }}</label>
                </div>
              </div>
            </div>
          </div>
          <!-- 時薪範圍篩選 -->
          <div class="widget">
            <div class="widget-title widget-collapse">
              <h6>時薪範圍</h6>
              <a class="ml-auto" @click="toggleSection('salary')" role="button">
                <i class="fas fa-chevron-down"></i>
              </a>
            </div>
            <div class="collapse show" id="salary">
              <div class="widget-content">
                <div class="custom-control custom-checkbox" v-for="(range, index) in salaryRanges" :key="'salary'+index">
                  <input type="checkbox" class="custom-control-input" 
                         :id="'salary'+index"
                         v-model="selectedSalaryRanges"
                         :value="range.value">
                  <label class="custom-control-label" :for="'salary'+index">{{ range.label }}</label>
                </div>
              </div>
            </div>
          </div>
          <!-- 地區篩選 -->
          <div class="widget">
            <div class="widget-title widget-collapse">
              <h6>地區</h6>
              <a class="ml-auto" @click="toggleSection('city')" role="button">
                <i class="fas fa-chevron-down"></i>
              </a>
            </div>
            <div class="collapse show" id="city">
              <div class="widget-content">
                <div class="custom-control custom-checkbox" v-for="(city, index) in cityOptions" :key="'city'+index">
                  <input type="checkbox" class="custom-control-input" 
                         :id="'city'+index"
                         v-model="selectedCities"
                         :value="city.value">
                  <label class="custom-control-label" :for="'city'+index">{{ city.label }}</label>
                </div>
              </div>
            </div>
          </div>  
          <!-- 經驗年資篩選
          <div class="widget">
            <div class="widget-title widget-collapse">
              <h6>工作經驗</h6>
              <a class="ml-auto" @click="toggleSection('experience')" role="button">
                <i class="fas fa-chevron-down"></i>
              </a>
            </div>
            <div class="collapse show" id="experience">
              <div class="widget-content">
                <div class="custom-control custom-checkbox" v-for="(year, index) in experienceOptions" :key="'exp'+index">
                  <input type="checkbox" class="custom-control-input" 
                         :id="'experience'+index"
                         v-model="selectedExperience"
                         :value="year.value">
                  <label class="custom-control-label" :for="'experience'+index">{{ year.label }}</label>
                </div>
              </div>
            </div>
          </div> -->

          

        </div>
      </div>

      <!-- 右側主要內容區 -->
      <div class="col-lg-9">
        <div class="row mb-4">
          <div class="col-12">
            <h6 class="mb-0">顯示 1-{{ paginatedCaregivers.length }} 位，共 <span class="text-primary">{{ filteredCaregivers.length }} 位護理人員</span></h6>
          </div>
        </div>

        <!-- 護理人員列表部分 -->
        <div class="row">
          <div class="col-sm-6 col-lg-4 mb-4" v-for="caregiver in paginatedCaregivers" :key="caregiver.caregiverNO">
            <div class="candidate-list candidate-grid">
              <div class="candidate-list-image">
                <img class="img-fluid" 
                  :src="caregiver.user?.userPhoto || '/api/placeholder/100/100'" 
                  :alt="caregiver.user?.userName || '使用者照片'"
                  style="object-fit: cover; width: 150px; height: 150px;">
              </div>
              <div class="candidate-list-details">
                <div class="candidate-list-info">
                  <div class="candidate-list-title">
                    <h5 class="mb-2">{{ caregiver.user?.userName || 'N/A' }}</h5>
                  </div>
                  <div class="candidate-list-option">
                    <p class="mb-2">
                      <i class="fas fa-dollar-sign mr-2"></i>
                      時薪：{{ caregiver.hourlyRate }}元/小時
                    </p>
                    <p class="mb-2">
                      <i class="fas fa-briefcase mr-2"></i>
                      經驗：{{ caregiver.expYears }}年
                    </p>
                  </div>
                  <div class="text-center mt-3">
                    <router-link 
                      :to="`/reserve/calendar/${caregiver.caregiverNO}`" 
                      class="btn btn-primary btn-sm">
                      立即預約
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 分頁部分 -->
        <div class="row">
          <div class="col-12 text-center mt-4 mt-sm-5">
            <!-- 原有的分頁部分 -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
data() {
  return {
    caregivers: [],
    searchKeyword: '',
    currentPage: 1,
    itemsPerPage: 9,
    selectedGender: [],
    selectedSalaryRanges: [],
    selectedExperience: [],
    selectedCities: [], // 改為縣市選擇
    cityOptions: [
  { label: '基隆市', value: '基隆市' },
  { label: '臺北市', value: '臺北市' },
  { label: '新北市', value: '新北市' },
  { label: '桃園市', value: '桃園市' },
  { label: '新竹市', value: '新竹市' },
  { label: '新竹縣', value: '新竹縣' },
  { label: '苗栗縣', value: '苗栗縣' },
  { label: '臺中市', value: '臺中市' },
  { label: '彰化縣', value: '彰化縣' },
  { label: '南投縣', value: '南投縣' },
  { label: '雲林縣', value: '雲林縣' },
  { label: '嘉義市', value: '嘉義市' },
  { label: '嘉義縣', value: '嘉義縣' },
  { label: '臺南市', value: '臺南市' },
  { label: '高雄市', value: '高雄市' },
  { label: '屏東縣', value: '屏東縣' },
  { label: '宜蘭縣', value: '宜蘭縣' },
  { label: '花蓮縣', value: '花蓮縣' },
  { label: '臺東縣', value: '臺東縣' },
  { label: '澎湖縣', value: '澎湖縣' },
  { label: '金門縣', value: '金門縣' },
  { label: '連江縣', value: '連江縣' }
],
    genderOptions: [
      { label: '男', value: '男' },
      { label: '女', value: '女' }
    ],
    salaryRanges: [
      
      { label: '301-350元', value: '301-350' },
      { label: '351-400元', value: '351-400' },
      { label: '401-500元', value: '401-500' },
      { label: '501元以上', value: '501-up' }
    ],
  }
},
computed: {
  filteredCaregivers() {
    let filtered = this.caregivers;

    // 關鍵字搜尋
    if (this.searchKeyword) {
      const keyword = this.searchKeyword.toLowerCase();
      filtered = filtered.filter(c => 
        (c.user?.userName || '').toLowerCase().includes(keyword)
      );
    }

    // 地區篩選 (替換原本的經驗篩選)
  if (this.selectedCities.length > 0) {
    filtered = filtered.filter(c => 
      this.selectedCities.includes(c.user?.userCity)
    );
  }

    // 性別篩選
    if (this.selectedGender.length > 0) {
      filtered = filtered.filter(c => 
        this.selectedGender.includes(c.caregiverGender)
      );
    }

    // 時薪範圍篩選
    if (this.selectedSalaryRanges.length > 0) {
      filtered = filtered.filter(c => {
        return this.selectedSalaryRanges.some(range => {
          const [min, max] = range.split('-');
          if (max === 'up') {
            return c.hourlyRate >= parseInt(min);
          }
          return c.hourlyRate >= parseInt(min) && c.hourlyRate <= parseInt(max);
        });
      });
    }

    return filtered;
  },
  paginatedCaregivers() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredCaregivers.slice(start, end);
  },
  totalPages() {
    return Math.ceil(this.filteredCaregivers.length / this.itemsPerPage);
  }
},
methods: {
  async fetchCaregivers() {
    try {
      const response = await axios.get('http://localhost:8080/api/caregiver/FindAllCaregiver');
      console.log('API Response:', response.data); // 用於調試
      this.caregivers = response.data;
    } catch (error) {
      console.error('Error fetching caregivers:', error);
    }
  },
  toggleSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element.classList.contains('show')) {
      element.classList.remove('show');
    } else {
      element.classList.add('show');
    }
  },
  changePage(page) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
},
mounted() {
  this.fetchCaregivers();
}
}
</script>

<style scoped>
/* 保持原有的 CSS 样式 */
.bg-primary {
background-color: #f8f9fa !important;
color: #6c757d !important;
}

.widget {
background: #fff;
padding: 20px;
margin-bottom: 20px;
border: 1px solid #eee;
}

.candidate-grid {
margin-bottom: 20px;
}

.custom-control {
margin-bottom: 10px;
}

.page-link {
cursor: pointer;
}

.candidate-list-image img {
width: 100%;
height: 200px;
object-fit: cover;
}

.router-link-active {
color: #b72388;
text-decoration: none;
}
.container {
  max-width: 1400px;
  margin: 0 auto;
}

.sidebar {
  position: sticky;
  top: 20px;}

</style>