<template>
  <v-container class="mt-10 mb-10">
    <v-row>
      <!-- 左側個人資料卡 -->
      <v-col cols="12" md="4">
        <v-card class="mb-4">
          <v-card-text class="text-center bg-grey-lighten-4">
            <v-avatar size="150" class="mb-2">
              <v-img :src="user.avatar || '/user/img/user3.png'" alt="avatar"></v-img>
            </v-avatar>
            <h3 class="mb-1">{{ user.name }}</h3>
            <v-chip :color="getStatusColor(caregiver.CGstatus)" text-color="white" class="mb-4">
              {{ getStatusText(caregiver.CGstatus) }}
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 右側詳細資訊 -->
      <v-col cols="12" md="8">
        <v-card>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-title>性別</v-list-item-title>
                <v-list-item-subtitle>{{ caregiver.caregiverGender }}</v-list-item-subtitle>
              </v-list-item>
              <v-divider inset></v-divider>

              <v-list-item>
                <v-list-item-title>年齡</v-list-item-title>
                <v-list-item-subtitle>{{ caregiver.caregiverAge }} 歲</v-list-item-subtitle>
              </v-list-item>
              <v-divider inset></v-divider>

              <v-list-item>
                <v-list-item-title>服務地區</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip v-for="area in getServiceAreas(caregiver.serviceArea)" :key="area"
                    class="ma-1" color="primary" small>
                    {{ area }}
                  </v-chip>
                </v-list-item-subtitle>
              </v-list-item>
              <v-divider inset></v-divider>

              <v-list-item>
                <v-list-item-title>服務等級</v-list-item-title>
                <v-list-item-subtitle>{{ caregiver.services }}</v-list-item-subtitle>
              </v-list-item>
              <v-divider inset></v-divider>

              <v-list-item>
                <v-list-item-title>從業年限</v-list-item-title>
                <v-list-item-subtitle>{{ caregiver.expYears }} 年</v-list-item-subtitle>
              </v-list-item>
              <v-divider inset></v-divider>

              <v-list-item>
                <v-list-item-title>學歷</v-list-item-title>
                <v-list-item-subtitle>{{ caregiver.education }}</v-list-item-subtitle>
              </v-list-item>
              <v-divider inset></v-divider>

              <v-list-item>
                <v-list-item-title>日薪</v-list-item-title>
                <v-list-item-subtitle>{{ caregiver.daylyRate }} 元</v-list-item-subtitle>
              </v-list-item>
              <v-divider inset></v-divider>

              <!-- 證書照片 -->
              <v-list-item>
                <v-list-item-title>證書照片</v-list-item-title>
                <v-list-item-subtitle>
                  <v-row v-if="getCertifiPhotos(caregiver.certifiPhoto).length > 0">
                    <v-col 
                      v-for="(photo, index) in getCertifiPhotos(caregiver.certifiPhoto)" 
                      :key="index" 
                      cols="12" 
                      sm="6" 
                      md="4"
                    >
                      <v-img 
                        :src="photo" 
                        :alt="`證書照片 ${index + 1}`" 
                        class="ma-1"
                        max-height="200"
                        contain
                      ></v-img>
                    </v-col>
                  </v-row>
                  <p v-else class="text-center text-grey">無證書資料</p>
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '@/plugins/axios';

// 新增 id 屬性，確保後續能正確根據用戶 id 取得看護資料
const user = ref({
  id: null,
  name: '',
  avatar: null
});

// 設定看護基本資料的預設值
const caregiver = ref({
  CGstatus: '',
  caregiverGender: '',
  caregiverAge: 0,
  serviceArea: null,
  services: '',
  expYears: 0,
  education: '',
  daylyRate: 0,
  certifiPhoto: null
});

// 取得用戶資料（請確認後端 API 有返回 id 屬性）
const fetchUserProfile = async () => {
  try {
    const res = await axios.get('/user/profile');
    user.value = res.data; // 預期返回 { id, name, avatar, ... }
  } catch (err) {
    console.error('獲取用戶資料失敗:', err);
  }
};

// 取得看護資料，並對返回欄位做對應處理（依據後端實際返回格式調整）
const fetchCaregiverData = async () => {
  try {
    // 1. 首先確保用戶已登入且有權限
    if (!user.value.id) {
      throw new Error('用戶未登入');
    }

    // 2. 先用 userID 查詢對應的 caregiverNO
    const caregiverInfoRes = await axios.get(`/api/caregiver/findByUserId/${user.value.id}`);
    
    if (!caregiverInfoRes.data) {
      throw new Error('未找到看護資料');
    }

    // 3. 獲取詳細資料
    const caregiverNO = caregiverInfoRes.data.caregiverNO;
    const res = await axios.get(`/api/caregiver/${caregiverNO}`);

    // 4. 調試輸出
    console.log('API Response:', res.data);

    // 5. 更新 caregiver ref，注意屬性名稱匹配
    caregiver.value = {
      caregiverNO: res.data.caregiverNO,
      CGstatus: res.data.CGstatus || 'PENDING',
      caregiverGender: res.data.caregiverGender || '',
      caregiverAge: res.data.caregiverAge || 0,
      serviceArea: res.data.serviceArea || null,
      services: res.data.services || '',
      expYears: res.data.expYears || 0,
      education: res.data.education || '',
      daylyRate: res.data.daylyRate || 0,
      certifiPhoto: res.data.certifiPhoto || null
    };

    console.log('Caregiver data loaded:', caregiver.value);
  } catch (err) {
    console.error('獲取看護資料失敗:', err);
  }
};
onMounted(async () => {
try {
  await fetchUserProfile();
  if (user.value.id) {
    await fetchCaregiverData();
  } else {
    console.error('無法獲取用戶ID');
  }
} catch (error) {
  console.error('初始化失敗:', error);
}
});

const getStatusColor = (status) => {
  const colors = {
    PENDING: '#F44336',  // 紅色
    APPROVED: '#4CAF50', // 綠色
    REJECTED: '#9E9E9E'  // 灰色
  };
  return colors[status] || '#9E9E9E';
};

const getStatusText = (status) => {
  const texts = {
    PENDING: '待審核',
    APPROVED: '已通過', 
    REJECTED: '已退回'
  };
  return texts[status] || '待審核';
};

const getServiceAreas = (serviceArea) => {
  if (!serviceArea) return [];
  
  const areas = {
    taipei_city: '台北市',
    new_taipei_city: '新北市',
    taoyuan_city: '桃園市',
    taichung_city: '台中市',
    tainan_city: '台南市',
    kaohsiung_city: '高雄市',
    hsinchu_city: '新竹市',
    hsinchu_county: '新竹縣',
    keelung_city: '基隆市',
    yilan_county: '宜蘭縣',
    miaoli_county: '苗栗縣',
    changhua_county: '彰化縣',
    nantou_county: '南投縣',
    yunlin_county: '雲林縣',
    chiayi_city: '嘉義市',
    chiayi_county: '嘉義縣',
    pingtung_county: '屏東縣',
    taitung_county: '台東縣',
    hualien_county: '花蓮縣',
    penghu_county: '澎湖縣',
    kinmen_county: '金門縣',
    lienchiang_county: '連江縣'
  };

  return Object.entries(serviceArea)
    .filter(([key, value]) => value === true && key !== 'areaID')
    .map(([key]) => areas[key])
    .filter(Boolean);
};

const hexToBase64 = (hexString) => {
  if (!hexString) return '';
  
  hexString = hexString.replace(/^0x/, '');
  return btoa(hexString.match(/\w{2}/g)
    .map(char => String.fromCharCode(parseInt(char, 16)))
    .join(''));
};

const getCertifiPhotos = (certifiPhoto) => {
  if (!certifiPhoto) return [];
  return [
    certifiPhoto.photo1 ? `data:image/jpeg;base64,${hexToBase64(certifiPhoto.photo1)}` : null,
    certifiPhoto.photo2 ? `data:image/jpeg;base64,${hexToBase64(certifiPhoto.photo2)}` : null,
    certifiPhoto.photo3 ? `data:image/jpeg;base64,${hexToBase64(certifiPhoto.photo3)}` : null,
    certifiPhoto.photo4 ? `data:image/jpeg;base64,${hexToBase64(certifiPhoto.photo4)}` : null,
    certifiPhoto.photo5 ? `data:image/jpeg;base64,${hexToBase64(certifiPhoto.photo5)}` : null
  ].filter(Boolean);
};
</script>

<style scoped>
.v-list-item-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: #424242;
}

.v-list-item-subtitle {
  font-size: 1rem;
  color: #616161;
}
</style>
