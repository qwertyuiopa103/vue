<template>
  <v-container>
    <v-card class="mx-auto" max-width="800">
      <v-card-title class="d-flex align-center justify-space-between">
        <span>申請成為看護</span>
        <v-btn color="orange" variant="outlined" size="small" @click="quickFill" class="ml-2">
          一鍵輸入範例
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="userName" label="會員姓名" readonly></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-select v-model="formData.caregiverGender" :items="['男', '女']" label="性別" required></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model.number="formData.caregiverAge" label="年齡" type="number" :rules="[
                v => !!v || '年齡為必填',
                v => (v >= 18 && v <= 65) || '年齡必須在18-65歲之間'
              ]" min="18" max="65" required></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model.number="formData.expYears" label="工作年資" type="number" required></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-select v-model="formData.education" :items="educationOptions" label="學歷" required></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model.number="formData.daylyRate" label="日薪" type="number" required></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-select v-model="formData.services" :items="serviceOptions" label="服務等級" required></v-select>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-card-subtitle>服務區域</v-card-subtitle>
              <div class="d-flex flex-wrap">
                <div v-for="area in areaOptions" :key="area.value" style="width: 20%;">
                  <v-checkbox v-model="selectedAreas[area.value]" :label="area.text" density="compact"
                    hide-details></v-checkbox>
                </div>
              </div>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-file-input v-model="certifiPhotos" :rules="photoRules" accept="image/*" multiple show-size counter
                max="5" @change="previewFiles" label="上傳證照 (最多5張)"></v-file-input>
            </v-col>
          </v-row>

          <v-row v-if="imagePreviewUrls.length > 0">
            <v-col cols="12">
              <v-card-subtitle>已上傳的照片預覽</v-card-subtitle>
              <v-row>
                <v-col v-for="(url, index) in imagePreviewUrls" :key="index" cols="6" md="4">
                  <v-img :src="url" aspect-ratio="1" cover class="bg-grey-lighten-2">
                    <template v-slot:placeholder>
                      <v-row class="fill-height ma-0" align="center" justify="center">
                        <v-progress-circular indeterminate color="grey-lighten-5"></v-progress-circular>
                      </v-row>
                    </template>
                  </v-img>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <v-btn color="amber" @click="submitForm" :loading="loading" :disabled="!valid" block class="mt-4">
            提交申請
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>



// 在最上方 import 部分加入
import { nextTick } from 'vue';
const form = ref(null);
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import jwt_decode from 'jwt-decode';


const router = useRouter();
const valid = ref(false);
const loading = ref(false);
const userName = ref('');
const imagePreviewUrls = ref([]);

const formData = reactive({
  caregiverNO: null,
  caregiverGender: '',
  caregiverAge: 0,
  expYears: 0,
  education: '',
  daylyRate: 0,
  services: '',
  CGstatus: 'PENDING',
  user: {
    userID: '',
    userName: '',
    userPhotoBase64: ''
  },
  serviceArea: {
    taipei_city: false,
    new_taipei_city: false,
    taoyuan_city: false,
    taichung_city: false,
    tainan_city: false,
    kaohsiung_city: false,
    hsinchu_city: false,
    hsinchu_county: false,
    keelung_city: false,
    yilan_county: false,
    miaoli_county: false,
    changhua_county: false,
    nantou_county: false,
    yunlin_county: false,
    chiayi_city: false,
    chiayi_county: false,
    pingtung_county: false,
    taitung_county: false,
    hualien_county: false,
    penghu_county: false,
    kinmen_county: false,
    lienchiang_county: false
  },
  certifiPhoto: {
    certifiPhotoID: 0,
    photo1: null,
    photo2: null,
    photo3: null,
    photo4: null,
    photo5: null
  }

});

const certifiPhotos = ref([]);
const selectedAreas = reactive({});

const educationOptions = [
  '小學含以下',
  '中學含肄業',
  '高中職含肄業',
  '大專院校含肄業',
  '碩博含肄業'
];

const serviceOptions = [
  '初階看護人員',
  '中階看護人員',
  '高階看護人員',
  '專業護理師'
];

const areaOptions = [
  { text: '台北市', value: 'taipei_city' },
  { text: '新北市', value: 'new_taipei_city' },
  { text: '桃園市', value: 'taoyuan_city' },
  { text: '台中市', value: 'taichung_city' },
  { text: '台南市', value: 'tainan_city' },
  { text: '高雄市', value: 'kaohsiung_city' },
  { text: '新竹市', value: 'hsinchu_city' },
  { text: '新竹縣', value: 'hsinchu_county' },
  { text: '基隆市', value: 'keelung_city' },
  { text: '宜蘭縣', value: 'yilan_county' },
  { text: '苗栗縣', value: 'miaoli_county' },
  { text: '彰化縣', value: 'changhua_county' },
  { text: '南投縣', value: 'nantou_county' },
  { text: '雲林縣', value: 'yunlin_county' },
  { text: '嘉義市', value: 'chiayi_city' },
  { text: '嘉義縣', value: 'chiayi_county' },
  { text: '屏東縣', value: 'pingtung_county' },
  { text: '台東縣', value: 'taitung_county' },
  { text: '花蓮縣', value: 'hualien_county' },
  { text: '澎湖縣', value: 'penghu_county' },
  { text: '金門縣', value: 'kinmen_county' },
  { text: '連江縣', value: 'lienchiang_county' }
];

const photoRules = [
  v => !v || v.length <= 5 || '最多只能上傳5張照片',
  v => !v || v.every(file => file.size < 5000000) || '每張照片需小於5MB'
];

function previewFiles(files) {
  imagePreviewUrls.value = [];
  if (!files) return;

  const fileArray = Array.isArray(files) ? files : [files].filter(Boolean);

  fileArray.forEach(file => {
    if (file instanceof Blob) {
      const reader = new FileReader();
      reader.onload = e => {
        imagePreviewUrls.value.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  });
}

async function submitForm() {
  try {
    loading.value = true;

    const token = sessionStorage.getItem('token');
    const decoded = jwt_decode(token);

    formData.user.userID = decoded.sub;
    formData.user.userName = userName.value;

    Object.entries(selectedAreas).forEach(([key, value]) => {
      formData.serviceArea[key] = value;
    });
    // const areaResponse = await axios.post('/area/upload',formdata.selectedArea);

    const photoFormData = new FormData();
    certifiPhotos.value.forEach(file => {
      photoFormData.append('files', file);
    });

    const photoResponse = await axios.post('/certifiPhoto/upload', photoFormData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    // formData.user.userPhotoBase64 = photoResponse.data.photoBase64;
    formData.certifiPhoto = {
      certifiPhotoID: photoResponse.data.certifiPhotoID,
      photo1: removeDataUrlPrefix(photoResponse.data.photo1),
      photo2: removeDataUrlPrefix(photoResponse.data.photo2),
      photo3: removeDataUrlPrefix(photoResponse.data.photo3),
      photo4: removeDataUrlPrefix(photoResponse.data.photo4),
      photo5: removeDataUrlPrefix(photoResponse.data.photo5)
    };
    const response = await axios.post('/caregiver/insert', formData);
    // 修改這裡的 Swal.fire 顯示
    await Swal.fire({
      title: '申請已送出',
      text: '您的申請我們已收到，將在三個工作日內進行審查，將與您電子郵件通知，謝謝您的申請!',
      icon: 'success',
      confirmButtonColor: '#FFC78E',
      confirmButtonText: '確定'
    });

    // 確定按鈕被點擊後導向首頁
    router.push('/home');

  } catch (error) {
    Swal.fire('錯誤', error.response?.data?.message || '提交失敗', 'error');
  } finally {
    loading.value = false;
  }
}
const validateAge = (age) => {
  // 假設護工年齡限制為 18-65 歲
  return age >= 18 && age <= 65;
};

// 在 save 函數中加入驗證
const save = async () => {
  if (!validateAge(editedItem.value.caregiverAge)) {
    Swal.fire('錯誤', '護工年齡必須在18-65歲之間', 'error');
    return;
  }

  try {
    const response = await axios.put(
      'http://localhost:8080/api/caregiver/update',
      editedItem.value,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      }
    );
    await Swal.fire('成功', '更新成功', 'success');
    close();
    await fetchCaregivers();
  } catch (error) {
    console.error('更新失敗:', error);
    Swal.fire('錯誤', error.response?.data || '更新失敗', 'error');
  }
};
const userID = ref(''); // <-- 加上這一行
onMounted(async () => {
  try {
    const token = sessionStorage.getItem('token');
    if (token) {
      const decoded = jwt_decode(token);
      const response = await axios.get('/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      userName.value = response.data.name;
      userID.value = response.data.id;
    }
  } catch (error) {
    console.error('無法獲取用戶資料:', error);
  }
});

const quickFill = async () => {
  const result = await Swal.fire({
    title: '確定要一鍵填入範例資料？',
    text: '這將會覆蓋目前已填寫的資料',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: '確定',
    confirmButtonColor: '#FFB5B5',
    cancelButtonColor: '#95CACA',
    cancelButtonText: '取消'
  });

  if (result.isConfirmed) {
    formData.caregiverGender = '女';
    formData.caregiverAge = 28;
    formData.expYears = 6;
    formData.education = '大專院校含肄業';
    formData.daylyRate = 3000;
    formData.services = '中階看護人員';

    // 重置所有區域為 false
    Object.keys(selectedAreas).forEach(key => {
      selectedAreas[key] = false;
    });

    // 只設置台北市和新北市為 true
    selectedAreas['taipei_city'] = true;
    selectedAreas['new_taipei_city'] = true;

    // 更新表單驗證狀態
    nextTick(() => {
      if (form.value) {
        form.value.validate();
      }
    });

    Swal.fire({
      title: '填入成功！',
      text: '範例資料已填入表單',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  }
};
function removeDataUrlPrefix(dataUrl) {
  return dataUrl.replace(/^data:image\/\w+;base64,/, '');
}
</script>

<style scoped>
/* 可加入你的樣式 */
</style>
