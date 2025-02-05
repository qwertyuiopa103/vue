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


            <!-- 新增編輯按鈕 -->
            <div class="mt-2">
              <v-btn color="amber" @click="dialog = true" small>
                編輯資料
              </v-btn>
              <v-btn color="deep-orange" small class="ml-2" :to="`/home/caregiver/calendar`">
                接單行事曆
              </v-btn>
            </div>
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
                  <v-chip v-for="area in getServiceAreas(caregiver.serviceArea)" :key="area" class="ma-1"
                    color="primary" small>
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
                    <v-col v-for="(photo, index) in getCertifiPhotos(caregiver.certifiPhoto)" :key="index" cols="12"
                      sm="6" md="4">
                      <v-img :src="photo" :alt="`證書照片 ${index + 1}`" class="ma-1 cursor-pointer" max-height="200"
                        contain @click="openPhotoDialog(photo)"></v-img>
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

    <!-- 編輯對話框 -->
    <!-- 編輯對話框 -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>編輯資料</v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <!-- 基本資料編輯表單 -->
              <v-col cols="12">
                <v-select v-model="editedItem.caregiverGender" :items="['男', '女']" label="性別" />
                <v-text-field v-model.number="editedItem.caregiverAge" label="年齡" type="number" />
                <v-text-field v-model.number="editedItem.expYears" label="工作年資" type="number" />
                <v-text-field v-model.number="editedItem.daylyRate" label="日薪" type="number" />
                <v-select v-model="editedItem.services" :items="['初階看護人員', '中階看護人員', '高階看護人員', '專業護理師']" label="服務等級" />
                <v-select v-model="editedItem.education" :items="['小學含以下', '中學含肄業', '高中職含肄業', '大專院校含肄業', '碩博含肄業']"
                  label="學歷" />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialog = false">取消</v-btn>
          <v-btn color="blue darken-1" text @click="save">儲存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
  <v-dialog v-model="photoDialog" max-width="90vw" max-height="90vh">
    <v-card>
      <v-card-title class="d-flex justify-end">
        <v-btn icon @click="photoDialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="text-center">
        <v-img :src="selectedPhoto" max-height="80vh" contain></v-img>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '@/plugins/axios';
const dialog = ref(false);
const editedItem = ref({});
const photoDialog = ref(false);
const selectedPhoto = ref('');

const openPhotoDialog = (photo) => {
  selectedPhoto.value = photo;
  photoDialog.value = true;
};
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
// 修正後的 fetchCaregiverData 方法
const fetchCaregiverData = async () => {
  try {
    if (!user.value.id) {
      throw new Error('用戶未登入');
    }

    const res = await axios.get(`/caregiver/findByUserId/${user.value.id}`);
    if (!res.data) {
      throw new Error('未找到看護資料');
    }

    const data = res.data;
    caregiver.value = {
      caregiverNO: data.caregiverNO,
      CGstatus: data.CGstatus, // 直接使用後端回傳的值
      caregiverGender: data.caregiverGender || '',
      caregiverAge: data.caregiverAge || 0,
      serviceArea: data.serviceArea || null,
      services: data.services || '',
      expYears: data.expYears || 0,
      education: data.education || '',
      daylyRate: data.daylyRate || 0,
      certifiPhoto: data.certifiPhoto || null
    };

    // 設置編輯表單的初始值
    editedItem.value = { ...caregiver.value };

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

  // 直接返回存在的照片數據
  const photos = [];
  if (certifiPhoto.photo1) photos.push(certifiPhoto.photo1);
  if (certifiPhoto.photo2) photos.push(certifiPhoto.photo2);
  if (certifiPhoto.photo3) photos.push(certifiPhoto.photo3);
  if (certifiPhoto.photo4) photos.push(certifiPhoto.photo4);
  if (certifiPhoto.photo5) photos.push(certifiPhoto.photo5);

  // 過濾掉空值並返回
  return photos.filter(photo => photo != null);
};
// 新增 save 方法
const save = async () => {
  try {
    // 先驗證年齡
    if (editedItem.value.caregiverAge < 18 || editedItem.value.caregiverAge > 65) {
      await Swal.fire('錯誤', '護工年齡必須在18-65歲之間', 'error');
      return;
    }

    const response = await axios.put(
      '/caregiver/update',
      {
        caregiverNO: editedItem.value.caregiverNO,
        caregiverGender: editedItem.value.caregiverGender,
        caregiverAge: editedItem.value.caregiverAge,
        expYears: editedItem.value.expYears,
        services: editedItem.value.services,
        education: editedItem.value.education,
        daylyRate: editedItem.value.daylyRate,
        CGstatus: editedItem.value.CGstatus,
        serviceArea: editedItem.value.serviceArea,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      }
    );

    await Swal.fire('成功', '更新成功', 'success');
    dialog.value = false;
    await fetchCaregiverData();
  } catch (error) {
    console.error('更新失敗:', error);
    await Swal.fire('錯誤', error.response?.data || '更新失敗', 'error');
  }
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

.cursor-pointer {
  cursor: pointer;
  transition: transform 0.2s;
}

.cursor-pointer:hover {
  transform: scale(1.05);
}
</style>