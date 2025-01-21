<template>
  <div class="container mt-12 mb-12">
      <div class="row">
          <!-- 左側個人資料卡 -->
          <div class="col-lg-4">
              <div class="card mb-4">
                  <div class="card-body text-center bg-light">
                      <img :src="user.avatar || '/user/img/user3.png'" alt="avatar"
                          class="rounded-circle img-fluid mb-2" style="width: 150px;">
                      <h5 class="my-3">{{ user.name }}</h5>
                      <p class="text-muted mb-1">會員 #{{ user.id }}</p>
                      <p class="text-muted mb-4">{{ user.city }} {{ user.district }}</p>
                  </div>
                  <div class="card-body">
                      <div class="row">
                          <div class="col-sm-12">
                              <p class="mb-1">
                                  <i class="mdi mdi-email me-2"></i>
                                  {{ user.email }}
                              </p>
                              <p class="mb-0">
                                  <i class="mdi mdi-phone me-2"></i>
                                  {{ user.phone }}
                              </p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          <!-- 右側詳細資訊 -->
          <div class="col-lg-8">
              <div class="card mb-4">
                  <div class="card-body">
                      <!-- 導航標籤 -->
                      <ul class="nav nav-tabs mb-4">
                          <li class="nav-item" v-for="tab in tabs" :key="tab.id">
                              <a class="nav-link" :class="{ active: activeTab === tab.id }" href="#"
                                  @click.prevent="setActiveTab(tab.id)">
                                  <i :class="tab.icon" class="me-2"></i>{{ tab.label }}
                              </a>
                          </li>
                      </ul>

                      <!-- 基本資料內容 -->
                      <div v-if="activeTab === 'basic'" class="tab-content">
                          <div class="row">
                              <div class="col-sm-3">
                                  <p class="mb-0">姓名</p>
                              </div>
                              <div class="col-sm-9">
                                  <p class="text-muted mb-0">{{ user.name }}</p>
                              </div>
                          </div>
                          <hr>
                          <div class="row">
                              <div class="col-sm-3">
                                  <p class="mb-0">信箱</p>
                              </div>
                              <div class="col-sm-9">
                                  <p class="text-muted mb-0">{{ user.email }}</p>
                              </div>
                          </div>
                          <hr>
                          <div class="row">
                              <div class="col-sm-3">
                                  <p class="mb-0">手機</p>
                              </div>
                              <div class="col-sm-9">
                                  <p class="text-muted mb-0">{{ user.phone }}</p>
                              </div>
                          </div>
                          <hr>
                          <div class="row">
                              <div class="col-sm-3">
                                  <p class="mb-0">地址</p>
                              </div>
                              <div class="col-sm-9">
                                  <p class="text-muted mb-0">{{ user.city }}{{ user.district }}{{ user.address }}</p>
                              </div>
                          </div>

                          <!-- 護理人員資料 (如果有的話) -->
                          <template v-if="caregiver">
                              <hr>
                              <h5 class="mb-3">護理人員資料</h5>
                              <div class="row">
                                  <div class="col-sm-3">
                                      <p class="mb-0">性別</p>
                                  </div>
                                  <div class="col-sm-9">
                                      <p class="text-muted mb-0">{{ caregiver.caregiverGender }}</p>
                                  </div>
                              </div>
                              <hr>
                              <div class="row">
                                  <div class="col-sm-3">
                                      <p class="mb-0">年齡</p>
                                  </div>
                                  <div class="col-sm-9">
                                      <p class="text-muted mb-0">{{ caregiver.caregiverAge }} 歲</p>
                                  </div>
                              </div>
                              <hr>
                              <div class="row">
                                  <div class="col-sm-3">
                                      <p class="mb-0">工作年資</p>
                                  </div>
                                  <div class="col-sm-9">
                                      <p class="text-muted mb-0">{{ caregiver.expYears }} 年</p>
                                  </div>
                              </div>
                              <hr>
                              <div class="row">
                                  <div class="col-sm-3">
                                      <p class="mb-0">時薪</p>
                                  </div>
                                  <div class="col-sm-9">
                                      <p class="text-muted mb-0">{{ caregiver.hourlyRate }} 元/小時</p>
                                  </div>
                              </div>
                              <hr>
                              <div class="row">
                                  <div class="col-sm-3">
                                      <p class="mb-0">教育經歷</p>
                                  </div>
                                  <div class="col-sm-9">
                                      <p class="text-muted mb-0">{{ caregiver.eduExperience }}</p>
                                  </div>
                              </div>
                          </template>
                      </div>

                      <!-- 會員等級內容 -->
                      <div v-if="activeTab === 'role'" class="tab-content">
                          <div class="current-role mb-4">
                              <h6 class="mb-3">目前身份</h6>
                              <div class="role-badge" :class="roleClass">
                                  {{ getRoleName(user.role) }}
                              </div>
                          </div>
                          <div class="role-description">
                              <h6 class="mb-3">身份說明</h6>
                              <ul class="list-unstyled">
                                  <li class="mb-2">✦ 一般會員 (ROLE_USER): 基本會員權限</li>
                                  <li class="mb-2">✦ 看護 (ROLE_CAREGIVER): 提供照護服務的專業人員</li>
                                  <li class="mb-2">✦ 管理員 (ROLE_ADMIN): 系統管理員</li>
                              </ul>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from '@/plugins/axios';

// 定義資料
const user = ref({
  id: '',
  name: '',
  email: '',
  phone: '',
  avatar: null,
  city: '',
  district: '',
  address: '',
  role: ''
});

const caregiver = ref(null);
const activeTab = ref('basic');

// 頁籤設定
const tabs = [
  { id: 'basic', label: '基本資料', icon: 'mdi mdi-account' },
  { id: 'role', label: '會員等級', icon: 'mdi mdi-shield-account' }
];

// 切換頁籤
const setActiveTab = (tabId) => {
  activeTab.value = tabId;
};

// 取得角色名稱
const getRoleName = (role) => {
  const roleNames = {
      'ROLE_USER': '一般會員',
      'ROLE_CAREGIVER': '看護',
      'ROLE_ADMIN': '管理員'
  };
  return roleNames[role] || '一般會員';
};

// 計算角色樣式
const roleClass = computed(() => {
  const roleClasses = {
      'ROLE_USER': 'role-user',
      'ROLE_CAREGIVER': 'role-caregiver',
      'ROLE_ADMIN': 'role-admin'
  };
  return roleClasses[user.value.role] || 'role-user';
});

// 獲取用戶資料
const fetchUserProfile = async () => {
  try {
      const response = await axios.get('/user/profile');
      if (response.status === 200) {
          user.value = response.data;
          // 如果是護理人員，獲取護理人員資料
          if (user.value.role === 'ROLE_CAREGIVER') {
              fetchCaregiverData();
          }
      }
  } catch (error) {
      console.error('Error fetching user profile:', error);
  }
};

// 獲取護理人員資料
const fetchCaregiverData = async () => {
  try {
      const response = await axios.get(`/caregiver/FindCaregiver?caregiverNO=${user.value.id}`);
      if (response.status === 200) {
          caregiver.value = response.data;
      }
  } catch (error) {
      console.error('Error fetching caregiver data:', error);
  }
};

// 組件掛載時獲取資料
onMounted(() => {
  fetchUserProfile();
});
</script>

<style scoped>
.mt-12 {
  margin-top: 200px;
}

.mb-12 {
  margin-bottom: 200px;
}

.card {
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-tabs .nav-link {
  color: #495057;
  border: none;
  border-bottom: 2px solid transparent;
}

.nav-tabs .nav-link.active {
  color: #495057;
  background-color: transparent;
  border-color: #495057;
}

.role-badge {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  text-align: center;
}

.role-user {
  background-color: #f8f9fa;
  color: #495057;
}

.role-caregiver {
  background-color: #e9ecef;
  color: #495057;
}

.role-admin {
  background-color: #dee2e6;
  color: #495057;
}

.bg-light {
  background-color: #f8f9fa !important;
}

.text-muted {
  color: #6c757d !important;
}

.list-unstyled li {
  padding: 8px 0;
}

.rounded-circle {
  object-fit: cover;
}

hr {
  margin: 1.5rem 0;
  color: #e0e0e0;
}

.tab-content {
  padding: 20px 0;
}
</style>