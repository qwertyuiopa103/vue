<template>
  <div>
    <v-data-table :items="caregivers" :headers="headers" :search="search" :loading="loading"
      class="elevation-1 fixed-table">
      <!-- 頂部工具欄 -->
      <template #top>
        <v-toolbar flat>
          <v-toolbar-title><strong>看護資料</strong></v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>

          <!-- 審核狀態下拉選單 -->
          <v-select v-model="selectedStatus" :items="statusOptions" label="審核狀態" class="mx-4"
            style="max-width: 200px ;margin-top: 25px !important;" @update:model-value="filterByStatus"></v-select>
          <v-text-field v-model="search" append-icon="mdi-magnify" label="搜尋" single-line hide-details />
        </v-toolbar>
      </template>



      <!-- 狀態欄位 -->
      <template #item.CGstatus="{ item }">
        <v-chip :color="getStatusColor(item.CGstatus)" text-color="white" class="status-chip" :class="{
          'cursor-pointer': item.CGstatus === 'PENDING',
          'elevation-2': true
        }" @click="handleStatusClick(item)" size="small" label>
          {{ getStatusText(item.CGstatus) }}
        </v-chip>
      </template>

      <!-- 操作欄位 -->
      <template #item.actions="{ item }">
        <!-- 詳細資料按鈕 -->
        <v-btn small color="teal" class="mr-2" @click="showDetails(item)">
          <v-icon>mdi-magnify</v-icon>
        </v-btn>

        <!-- 編輯按鈕 -->
        <v-btn small color="warning" class="mr-2" @click="editItem(item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>

        <!-- 刪除按鈕 -->
        <v-btn small color="error" @click="deleteItem(item)">
          <v-icon>mdi-trash-can</v-icon>
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
                <v-text-field v-model="editedItem.caregiverNO" label="護工編號" disabled />
              </v-col>
              <v-col cols="6">
                <v-select v-model="editedItem.caregiverGender" :items="['男', '女']" label="性別" />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model.number="editedItem.caregiverAge" label="年齡" type="number" />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model.number="editedItem.expYears" label="工作年資" type="number" />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model.number="editedItem.daylyRate" label="日薪" type="number" />
              </v-col>
              <v-col cols="6">
                <v-select v-model="editedItem.services" :items="['初階看護人員', '中階看護人員', '高階看護人員', '專業護理師']" label="服務等級" />
              </v-col>
              <v-col cols="12">
                <v-select v-model="editedItem.education" :items="['小學含以下', '中學含肄業', '高中職含肄業', '大專院校含肄業', '碩博含肄業']"
                  label="學歷" />
              </v-col>
            </v-row>

            <!-- 新增照片上傳區域 -->
            <v-row>
              <v-col cols="12">
                <h3>現有證照照片</h3>
                <v-row>
                  <v-col v-for="(photo, i) in getCertifiPhotos(editedItem.certifiPhoto)" :key="i" cols="12" sm="6"
                    md="4">
                    <v-img :src="photo" height="150" cover class="mb-2" />
                  </v-col>
                </v-row>

                <v-file-input v-model="newPhotos" :label="`可上傳 ${getMaxNewPhotos()} 張新照片`" multiple accept="image/*"
                  :rules="[
                    v => !v || v.length <= getMaxNewPhotos() || `最多只能上傳 ${getMaxNewPhotos()} 張新照片`
                  ]" @change="handlePhotoSelection"></v-file-input>
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
                <v-avatar size="200" class="mb-4" style="width: 60%; height: auto; display: block; margin: 0 auto;">
                  <v-img v-if="selectedItem.user?.userPhoto" :src="selectedItem.user.userPhoto"
                    style="width: 100%; height: 100%; object-fit: cover;" />
                  <v-icon v-else size="120">mdi-account</v-icon>
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
                <v-carousel v-if="selectedItem.certifiPhoto" height="300" hide-delimiter-background show-arrows="hover">
                  <v-carousel-item v-for="(photo, i) in getCertifiPhotos(selectedItem.certifiPhoto)" :key="i"
                    @click="showLargeImage(photo)">
                    <v-img :src="photo" alt="Certificate" height="300" cover class="certificate-photo"
                      style="cursor: pointer" />
                  </v-carousel-item>
                </v-carousel>

              </v-col>
            </v-row>

            <!-- 審核按鈕 -->
            <v-row v-if="selectedItem.CGstatus === 'PENDING'">
              <v-col cols="12" class="text-center">
                <v-text-field v-model="rejectionReason" label="退件原因" v-if="showRejectionReason"></v-text-field>
                <v-btn color="success" class="mr-4" @click="approveApplication" :disabled="showRejectionReason">
                  審核通過
                </v-btn>
                <v-btn color="error" @click="showRejectionReason ? rejectApplication() : showRejectionReason = true">
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
    <!-- 新增大圖顯示的對話框 -->
    <v-dialog v-model="largeImageDialog" max-width="90vw">
      <v-card>
        <v-img :src="selectedImage" max-height="90vh" contain>
          <template v-slot:placeholder>
            <v-row class="fill-height ma-0" align="center" justify="center">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </v-row>
          </template>
        </v-img>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" @click="largeImageDialog = false"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- 審核對話框 -->
    <v-dialog v-model="approvalDialog" max-width="800px">
      <v-card v-if="selectedItem">
        <v-card-title>護工審核</v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <!-- 基本資料 -->
              <v-col cols="12" md="6">
                <v-avatar size="200" class="mb-4" style="width: 60%; height: auto; display: block; margin: 0 auto;">
                  <v-img v-if="selectedItem.user?.userPhoto" :src="selectedItem.user.userPhoto"
                    style="width: 100%; height: 100%; object-fit: cover;" />
                  <v-icon v-else size="120">mdi-account</v-icon>
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
                <v-carousel v-if="selectedItem.certifiPhoto" height="300" hide-delimiter-background show-arrows="hover">
                  <v-carousel-item v-for="(photo, i) in getCertifiPhotos(selectedItem.certifiPhoto)" :key="i"
                    @click="showLargeImage(photo)">
                    <v-img :src="photo" alt="Certificate" height="300" cover class="certificate-photo"
                      style="cursor: pointer" />
                  </v-carousel-item>
                </v-carousel>
              </v-col>
            </v-row>

            <!-- 審核按鈕 -->
            <v-row>
              <v-col cols="12" class="text-center">
                <v-text-field v-model="rejectionReason" label="退件原因" v-if="showRejectionReason"></v-text-field>
                <v-btn color="success" class="mr-4" @click="approveApplication" :disabled="showRejectionReason">
                  審核通過
                </v-btn>
                <v-btn color="error" @click="showRejectionReason ? rejectApplication() : showRejectionReason = true">
                  {{ showRejectionReason ? '確認退件' : '審核退件' }}
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="closeApprovalDialog">關閉</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
const largeImageDialog = ref(false);
const selectedImage = ref(null);
const search = ref('')
const loading = ref(false)
const dialog = ref(false)
const detailDialog = ref(false)
const selectedItem = ref(null)
const caregivers = ref([])
const approvalDialog = ref(false)
const selectedStatus = ref('ALL')
const showRejectionReason = ref(false)
const rejectionReason = ref('')
const newPhotos = ref(null)
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
  { title: '護工編號', key: 'caregiverNO', align: 'start', width: '60px ' },
  { title: '會員編號', key: 'user.userID', width: '60px ' },
  { title: '姓名', key: 'user.userName', width: '60px ' },
  { title: '性別', key: 'caregiverGender', width: '60px ' },
  { title: '年齡', key: 'caregiverAge', width: '60px ' },
  { title: '工作年資', key: 'expYears', width: '60px ' },
  { title: '日薪', key: 'daylyRate', width: '60px ' },
  {
    title: '狀態',
    key: 'CGstatus',
    align: 'center',
    sortable: true, width: '60px '
  },
  { title: '操作', key: 'actions', width: '170px ' }
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
    openApprovalDialog(item)
  }
}
const openApprovalDialog = (item) => {
  selectedItem.value = item
  approvalDialog.value = true
  showRejectionReason.value = false
  rejectionReason.value = ''
}

const closeApprovalDialog = () => {
  approvalDialog.value = false
  showRejectionReason.value = false
  rejectionReason.value = ''
}

const fetchCaregivers = async () => {
  loading.value = true;
  try {
    const endpoint = selectedStatus.value === 'ALL'
      ? 'http://localhost:8080/api/caregiver/findAllCaregiver'
      : `http://localhost:8080/api/caregiver/CGstatus/${selectedStatus.value}`;

    const response = await axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
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

const showDetails = async (item) => {
  try {
    // 重新呼叫 detail 端點，確保拿到完整的證照資料
    const response = await axios.get(
      `http://localhost:8080/api/caregiver/findCaregiver/${item.caregiverNO}`,
      {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      }
    );
    selectedItem.value = response.data;
    detailDialog.value = true;
    showRejectionReason.value = false;
    rejectionReason.value = '';

    console.log('Fetched detailed item:', response.data);
  } catch (error) {
    console.error('Error fetching caregiver detail:', error);
    Swal.fire('錯誤', '無法取得詳細資料', 'error');
  }
};


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

// 修改關閉方法
const close = () => {
  dialog.value = false;
  editedItem.value = Object.assign({}, defaultItem);
  editedIndex.value = -1;
  newPhotos.value = null;  // 清除照片選擇
};

// 修改保存方法
const save = async () => {
  try {
    // 深拷貝編輯物件
    const sendData = { ...editedItem.value };

    // 如果有照片資料，需要清理 base64 字串前綴
    if (sendData.certifiPhoto) {
      const photos = sendData.certifiPhoto;
      for (const key in photos) {
        if (photos[key] && typeof photos[key] === 'string' && photos[key].includes('base64,')) {
          // 只保留 base64 字串部分
          photos[key] = photos[key].split('base64,')[1];
        }
      }
    }

    const response = await axios.put(
      'http://localhost:8080/api/caregiver/update',
      sendData,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      }
    );

    await Swal.fire('成功', '更新成功', 'success');
    dialog.value = false;
    // await fetchCaregiverData();
  } catch (error) {
    console.error('更新失敗:', error);
    Swal.fire('錯誤', '更新失敗: ' + (error.response?.data || error.message), 'error');
  }
};


const approveApplication = async () => {
  try {
    const response = await axios.post(
      `http://localhost:8080/api/caregiver/approve/${selectedItem.value.caregiverNO}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
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
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
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
          headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
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

// 將 HEX 轉為 Base64
function hexToBase64(hexString) {
  if (!hexString) return ''; // 如果 hexString 為 null 或空字符串，直接返回空字符串

  // 去除開頭的 '0x'
  hexString = hexString.replace(/^0x/, '');
  return btoa(hexString.match(/\w{2}/g).map(function (a) {
    return String.fromCharCode(parseInt(a, 16));
  }).join(""));
}

// 在 getCertifiPhotos 中應用轉換
const getCertifiPhotos = (certifiPhoto) => {
  if (!certifiPhoto) return [];

  // 優先使用 photo1，如果不存在則嘗試 photo1Base64（其他依此類推）
  const photos = [
    certifiPhoto.photo1 || certifiPhoto.photo1Base64,
    certifiPhoto.photo2 || certifiPhoto.photo2Base64,
    certifiPhoto.photo3 || certifiPhoto.photo3Base64,
    certifiPhoto.photo4 || certifiPhoto.photo4Base64,
    certifiPhoto.photo5 || certifiPhoto.photo5Base64
  ]
    // 如果照片存在且以 "data:" 開頭，則視為有效 Base64 圖片
    .filter(photo => photo && photo.startsWith('data:'));

  console.log('Processed photos:', photos);
  return photos;
};
// 計算可上傳的最大照片數
const getMaxNewPhotos = () => {
  if (!editedItem.value.certifiPhoto) return 5;
  const existingPhotos = getCertifiPhotos(editedItem.value.certifiPhoto).length;
  return Math.max(0, 5 - existingPhotos);
};

// 處理照片選擇
const handlePhotoSelection = (files) => {
  if (!files) return;

  const maxAllowed = getMaxNewPhotos();
  if (files.length > maxAllowed) {
    Swal.fire('警告', `最多只能上傳 ${maxAllowed} 張新照片`, 'warning');
    newPhotos.value = files.slice(0, maxAllowed);
  }
};



const showLargeImage = (photo) => {
  selectedImage.value = photo;
  largeImageDialog.value = true;
};

onMounted(() => {
  fetchCaregivers()
})
</script>

<style scoped>
.fixed-table ::v-deep table {
  table-layout: fixed !important;
  width: 100% !important;
  /* 確保表格寬度佔滿 */
}



.cursor-pointer {
  cursor: pointer;
}

.v-chip {
  justify-content: center;
}


.status-chip {
  min-width: 70px !important;
  font-weight: 500 !important;
  padding: 0 12px !important;
}

.certificate-photo {
  max-width: 100%;
  height: 300px;
  object-fit: contain;
  transition: opacity 0.2s;
}

.certificate-photo:hover {
  opacity: 0.8;
}

.user-photo-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.v-avatar {
  max-width: 80%;
  height: auto !important;
}
</style>