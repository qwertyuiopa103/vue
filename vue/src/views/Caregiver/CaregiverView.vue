<template>
  <div>
    <v-data-table
      :items="caregivers"
      :headers="headers"
      :search="search"
      :loading="loading"
      class="elevation-1"
    >
      <!-- 頂部工具欄 -->  
      <template #top>
        <v-toolbar flat>
          <v-toolbar-title>護工資料管理</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          
          <!-- 審核狀態下拉選單 -->
          <v-select
            v-model="selectedStatus"
            :items="statusOptions"
            label="審核狀態"
            class="mx-4"
            style="max-width: 200px"
            @update:model-value="filterByStatus"
          ></v-select>

          <!-- 加入看護按鈕 -->
          <v-btn
            color="primary"
            @click="$router.push('/admin/caregiver/insert')"
            class="mx-4"
          >
            加入看護
          </v-btn>
          
          <v-spacer></v-spacer>
          
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="搜尋"
            single-line
            hide-details
          />
        </v-toolbar>
      </template>

      <!-- 自訂欄位：照片 -->
      <template #item.userPhoto="{ item }">
        <v-avatar size="40">
          <img
            v-if="item.user && item.user.userPhotoBase64"
            :src="item.user.userPhotoBase64"
            :alt="item.user?.userName"
          />
          <v-icon v-else>mdi-account</v-icon>
        </v-avatar>
      </template>

      <!-- 狀態欄位 -->
      <template #item.CGstatus="{ item }">
        <v-chip
          :color="getStatusColor(item.CGstatus)"
          text-color="white"
          class="status-chip"
          :class="{
            'cursor-pointer': item.CGstatus === 'PENDING',
            'elevation-2': true
          }"
          @click="handleStatusClick(item)"
          size="small"
          label
        >
          {{ getStatusText(item.CGstatus) }}
        </v-chip>
      </template>

      <!-- 操作欄位 -->
      <template #item.actions="{ item }">
        <!-- 詳細資料按鈕 -->
        <v-btn 
          small 
          color="info" 
          class="mr-2"
          @click="showDetails(item)"
          :disabled="item.CGstatus !== 'PENDING'"
        >
          詳細資料
        </v-btn>
        
        <!-- 編輯按鈕 -->
        <v-btn 
          small 
          color="warning" 
          class="mr-2"
          @click="editItem(item)"
        >
          編輯
        </v-btn>
        
        <!-- 刪除按鈕 -->
        <v-btn 
          small 
          color="error"
          @click="deleteItem(item)"
        >
          刪除
        </v-btn>
      </template>

    </v-data-table>

    <!-- 編輯對話框 -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>編輯護工資料</v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="editedItem.caregiverNO"
                  label="護工編號"
                  disabled
                />
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="editedItem.caregiverGender"
                  :items="['男', '女']"
                  label="性別"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="editedItem.caregiverAge"
                  label="年齡"
                  type="number"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="editedItem.expYears"
                  label="工作年資"
                  type="number"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="editedItem.daylyRate"
                  label="日薪"
                  type="number"
                />
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="editedItem.services"
                  :items="['初階看護人員', '中階看護人員', '高階看護人員', '專業護理師']"
                  label="服務等級"
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="editedItem.education"
                  :items="['小學含以下', '中學含肄業', '高中職含肄業', '大專院校含肄業', '碩博含肄業']"
                  label="學歷"
                />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="close">取消</v-btn>
          <v-btn color="blue darken-1" text @click="save">儲存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 詳細資料對話框 -->
    <v-dialog v-model="detailDialog" max-width="800px">
      <v-card v-if="selectedItem">
        <v-card-title>護工申請審核</v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <!-- 基本資料 -->
              <v-col cols="12" md="6">
                <v-avatar size="150" class="mb-4">
                  <img
                    v-if="selectedItem.user?.userPhotoBase64"
                    :src="selectedItem.user.userPhotoBase64"
                  />
                  <v-icon v-else size="150">mdi-account</v-icon>
                </v-avatar>
                <p><strong>護工編號:</strong> {{ selectedItem.caregiverNO }}</p>
                <p><strong>會員編號:</strong> {{ selectedItem.user?.userID }}</p>
                <p><strong>姓名:</strong> {{ selectedItem.user?.userName }}</p>
                <p><strong>性別:</strong> {{ selectedItem.caregiverGender }}</p>
                <p><strong>年齡:</strong> {{ selectedItem.caregiverAge }}</p>
                <p><strong>工作年資:</strong> {{ selectedItem.expYears }}年</p>
                <p><strong>教育程度:</strong> {{ selectedItem.education }}</p>
                <p><strong>日薪:</strong> {{ selectedItem.daylyRate }}元</p>
                <p><strong>服務等級:</strong> {{ selectedItem.services }}</p>
              </v-col>

              <!-- 證書與服務區域 -->
              <v-col cols="12" md="6">
                <h3>證照資料</h3>
                <v-carousel v-if="selectedItem.certifiPhoto" height="300">
                  <v-carousel-item
                    v-for="(photo, i) in getCertifiPhotos(selectedItem.certifiPhoto)"
                    :key="i"
                    v-show="photo"
                  >
                    <img :src="photo" alt="Certificate" class="certificate-photo" />
                  </v-carousel-item>
                </v-carousel>

                <h3 class="mt-4">服務區域</h3>
                <v-chip-group>
                  <v-chip
                    v-for="area in getServiceAreas(selectedItem.serviceArea)"
                    :key="area"
                    color="primary"
                    small
                  >
                    {{ area }}
                  </v-chip>
                </v-chip-group>
              </v-col>
            </v-row>

            <!-- 審核按鈕 -->
            <v-row v-if="selectedItem.CGstatus === 'PENDING'">
              <v-col cols="12" class="text-center">
                <v-text-field
                  v-model="rejectionReason"
                  label="退件原因"
                  v-if="showRejectionReason"
                ></v-text-field>
                <v-btn
                  color="success"
                  class="mr-4"
                  @click="approveApplication"
                  :disabled="showRejectionReason"
                >
                  審核通過
                </v-btn>
                <v-btn
                  color="error"
                  @click="showRejectionReason ? rejectApplication() : showRejectionReason = true"
                >
                  {{ showRejectionReason ? '確認退件' : '審核退件' }}
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="closeDetailDialog">關閉</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const search = ref('')
const loading = ref(false)
const dialog = ref(false)
const detailDialog = ref(false)
const selectedItem = ref(null)
const caregivers = ref([])
const selectedStatus = ref('ALL')
const showRejectionReason = ref(false)
const rejectionReason = ref('')

const editedIndex = ref(-1)
const editedItem = ref({
  caregiverNO: null,
  caregiverGender: '',
  caregiverAge: 0,
  expYears: 0,
  education: '',
  daylyRate: 0,
  services: '',
  CGstatus: '',
  user: {
    userID: '',
    userName: '',
    userPhotoBase64: ''
  }
})

const defaultItem = {
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
  }
}

const statusOptions = [
  { title: '全部', value: 'ALL' },
  { title: '待審核', value: 'PENDING' },
  { title: '已審核', value: 'APPROVED' },
  { title: '已退件', value: 'REJECTED' }
]

const headers = [
  { title: '護工編號', key: 'caregiverNO', align: 'start' },
  { title: '會員編號', key: 'user.userID' },
  { title: '照片', key: 'userPhoto' },
  { title: '姓名', key: 'user.userName' },
  { title: '性別', key: 'caregiverGender' },
  { title: '年齡', key: 'caregiverAge' },
  { title: '工作年資', key: 'expYears' },
  { title: '日薪', key: 'daylyRate' },
  { 
    title: '狀態', 
    key: 'CGstatus',
    align: 'center',
    sortable: true 
  },
  { title: '操作', key: 'actions' }
]

const getStatusColor = (status) => {
  const colors = {
    PENDING: 'error',      // 紅色
    APPROVED: 'success',   // 綠色
    REJECTED: 'grey-darken-3'  // 深灰色
  }
  return colors[status] || 'grey'
}

const getStatusText = (status) => {
  // 確保狀態值統一為大寫
  const upperStatus = status?.toUpperCase();
  const texts = {
    'PENDING': '待審核',
    'APPROVED': '已審核', 
    'REJECTED': '已退件'
  }
  return texts[upperStatus] || '待審核'
}

const handleStatusClick = (item) => {
  if (item.CGstatus === 'PENDING') {
    showDetails(item)
  }
}

const fetchCaregivers = async () => {
  loading.value = true;
  try {
    const endpoint = selectedStatus.value === 'ALL' 
      ? 'http://localhost:8080/api/caregiver/findAllCaregiver'
      : `http://localhost:8080/api/caregiver/CGstatus/${selectedStatus.value}`;
    
    const response = await axios.get(endpoint, {
      headers: { 
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    caregivers.value = response.data.map(caregiver => ({
      ...caregiver,
      CGstatus: caregiver.cgstatus || caregiver.CGstatus || 'PENDING' // 增加 cgstatus 的判斷
}));
    
  } catch (error) {
    console.error('數據獲取失敗:', error);
    Swal.fire('錯誤', `載入失敗: ${error.response?.data || '未知錯誤'}`, 'error');
  } finally {
    loading.value = false;
  }
}

const filterByStatus = () => {
  fetchCaregivers()
}

const showDetails = (item) => {
  selectedItem.value = item
  detailDialog.value = true
  showRejectionReason.value = false
  rejectionReason.value = ''
}

const closeDetailDialog = () => {
  detailDialog.value = false
  selectedItem.value = null
  showRejectionReason.value = false
  rejectionReason.value = ''
}

const editItem = (item) => {
  editedIndex.value = caregivers.value.indexOf(item)
  editedItem.value = Object.assign({}, item)
  dialog.value = true
}

const close = () => {
  dialog.value = false
  editedItem.value = Object.assign({}, defaultItem)
  editedIndex.value = -1
}

const save = async () => {
  try {
    const response = await axios.put(
      'http://localhost:8080/api/caregiver/update',
      editedItem.value,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    )
    await Swal.fire('成功', '更新成功', 'success')
    close()
    await fetchCaregivers()
  } catch (error) {
    console.error('更新失敗:', error)
    Swal.fire('錯誤', '更新失敗', 'error')
  }
}

const approveApplication = async () => {
  try {
    const response = await axios.post(
      `http://localhost:8080/api/caregiver/approve/${selectedItem.value.caregiverNO}`,
      {},
      {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data) {
      await Swal.fire('成功', '審核通過', 'success');
      closeDetailDialog();
      fetchCaregivers();
    }
  } catch (error) {
    console.error('審核失敗:', error);
    Swal.fire('錯誤', `審核失敗: ${error.response?.data || '未知錯誤'}`, 'error');
  }
}
const rejectApplication = async () => {
  if (!rejectionReason.value) {
    Swal.fire('警告', '請輸入退件原因', 'warning')
    return
  }
  
  try {
    await axios.post(
      `http://localhost:8080/api/caregiver/reject/${selectedItem.value.caregiverNO}`,
      { reason: rejectionReason.value },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }
    )
    Swal.fire('成功', '已退件', 'success')
    closeDetailDialog()
    fetchCaregivers()
  } catch (error) {
    console.error('API Error:', error)
    Swal.fire('錯誤', '退件失敗', 'error')
  }
}

const deleteItem = async (item) => {
  const result = await Swal.fire({
    title: '確定要刪除嗎？',
    text: '此操作不會刪除會員資料',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '確定',
    cancelButtonText: '取消'
  })

  if (result.isConfirmed) {
    try {
      await axios.delete(
        `http://localhost:8080/api/caregiver/${item.caregiverNO}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      )
      Swal.fire('成功', '刪除成功', 'success')
      fetchCaregivers()
    } catch (error) {
      console.error('刪除失敗:', error)
      Swal.fire('錯誤', '刪除失敗', 'error')
    }
  }
}

const getServiceAreas = (serviceArea) => {
  if (!serviceArea) return []
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
  }
  return Object.entries(serviceArea)
    .filter(([key, value]) => value === true && key !== 'areaID')
    .map(([key]) => areas[key])
    .filter(Boolean)
}

const getCertifiPhotos = (certifiPhoto) => {
  if (!certifiPhoto) return []
  return [
    certifiPhoto.photo1,
    certifiPhoto.photo2,
    certifiPhoto.photo3,
    certifiPhoto.photo4,
    certifiPhoto.photo5
  ].filter(Boolean)
}

onMounted(() => {
  fetchCaregivers()
})
</script>

<style scoped>
.v-data-table {
  margin: 20px;
}

.cursor-pointer {
  cursor: pointer;
}

.v-chip {
  justify-content: center;
}

.status-chip {
  min-width: 90px !important;
  font-weight: 500 !important;
  padding: 0 12px !important;
}

.certificate-photo {
  max-width: 100%;
  height: 300px;
  object-fit: contain;
}
</style>