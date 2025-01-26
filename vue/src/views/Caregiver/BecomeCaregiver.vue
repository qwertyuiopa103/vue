<template>
  <v-container>
    <v-card class="mx-auto" max-width="800">
      <v-card-title>申請成為看護</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.userID"
                label="會員編號"
                readonly
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.caregiverGender"
                :items="['男', '女']"
                label="性別"
                required
              ></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="formData.caregiverAge"
                label="年齡"
                type="number"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="formData.expYears"
                label="工作年資"
                type="number"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.education"
                :items="educationOptions"
                label="學歷"
                required
              ></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="formData.daylyRate"
                label="日薪"
                type="number"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.services"
                :items="serviceOptions"
                label="服務等級"
                required
              ></v-select>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-file-input
                v-model="certifiPhotos"
                label="上傳證照 (最多5張)"
                multiple
                accept="image/*"
                :rules="photoRules"
                show-size
                counter
                max="5"
              ></v-file-input>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-card-subtitle>服務區域</v-card-subtitle>
              <v-checkbox
                v-for="area in areaOptions"
                :key="area.value"
                v-model="selectedAreas[area.value]"
                :label="area.text"
              ></v-checkbox>
            </v-col>
          </v-row>
          
          <v-btn
            color="primary"
            @click="submitForm"
            :loading="loading"
            :disabled="!valid"
            block
          >
            提交申請
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const router = useRouter()
const valid = ref(false)
const loading = ref(false)

const formData = reactive({
  userID: '',
  caregiverGender: '',
  caregiverAge: null,
  expYears: null,
  education: '',
  daylyRate: null,
  services: '',
  status: 'PENDING'
})

const certifiPhotos = ref([])
const selectedAreas = reactive({})

const educationOptions = [
  '小學含以下',
  '中學含肄業',
  '高中職含肄業',
  '大專院校含肄業',
  '碩博含肄業'
]

const serviceOptions = [
  '初階看護人員',
  '中階看護人員',
  '高階看護人員',
  '專業護理師'
]

const areaOptions = [
  { text: '台北市', value: 'taipei_city' },
  { text: '新北市', value: 'new_taipei_city' },
  // ... other areas
]

const photoRules = [
  v => !v || v.length <= 5 || '最多只能上傳5張照片',
  v => !v || v.every(file => file.size < 5000000) || '每張照片需小於5MB'
]

async function submitForm() {
  try {
    loading.value = true

    // 上傳證照
    const photoFormData = new FormData()
    certifiPhotos.value.forEach(file => {
      photoFormData.append('files', file)
    })
    const photoResponse = await axios.post('/api/certifiPhoto/upload', photoFormData)
    
    // 準備區域資料
    const serviceArea = new ServiceAreaBean()
    Object.entries(selectedAreas).forEach(([key, value]) => {
      if (value) serviceArea[key] = true
    })
    
    // 提交申請
    const caregiverData = {
      ...formData,
      certifiPhotoID: photoResponse.data.certifiPhotoID,
      serviceArea
    }
    
    await axios.post('/api/caregiver/apply', caregiverData)
    
    Swal.fire('成功', '申請已提交，請等待審核', 'success')
    router.push('/profile')
  } catch (error) {
    console.error(error)
    Swal.fire('錯誤', error.response?.data?.message || '提交失敗', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const response = await axios.get('/api/user/profile')
    formData.userID = response.data.id
  } catch (error) {
    console.error('無法獲取用戶資料:', error)
  }
})
</script>