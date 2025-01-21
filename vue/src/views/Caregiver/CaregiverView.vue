<template>
  <div>
    <v-data-table
    :loading="loading"
    :headers="headers"
    :items="caregivers"
    :search="search"
    class="elevation-1"
  >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>護工資料管理</v-toolbar-title>
          <v-divider
            class="mx-4"
            inset
            vertical
          ></v-divider>
          <v-spacer></v-spacer>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="搜尋"
            single-line
            hide-details
          ></v-text-field>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            dark
            class="mb-2"
            @click="addItem"
          >
            新增護工
          </v-btn>
        </v-toolbar>
      </template>

      <template v-slot:item.user.userPhoto="{ item }">
  <v-avatar size="40">
    <img
      v-if="item.user && item.user.userPhoto"
      :src="item.user.userPhoto"
      alt="使用者照片"
    >
    <v-icon v-else>mdi-account</v-icon>
  </v-avatar>
</template>

      <template v-slot:item.actions="{ item }">
        <v-icon
          small
          class="mr-2"
          @click="editItem(item)"
        >
          mdi-pencil
        </v-icon>
        <v-icon
          small
          @click="deleteItem(item)"
        >
          mdi-delete
        </v-icon>
      </template>
    </v-data-table>

    <v-dialog v-model="dialog" max-width="500px">
  <v-card>
    <v-card-title>
      <span class="text-h5">編輯護工資料</span>
    </v-card-title>

    <v-card-text>
      <v-container>
        <v-row>
          <!-- 顯示但不可編輯的欄位 -->
          <v-col cols="6">
            <v-text-field
              :value="editedItem.caregiverNO"
              label="護工編號"
              disabled
            ></v-text-field>
          </v-col>

          <!-- 可編輯的欄位 -->
          <v-col cols="6">
            <v-select
              v-model="editedItem.caregiverGender"
              :items="['男', '女']"
              label="性別"
              required
            ></v-select>
          </v-col>

          <v-col cols="6">
            <v-text-field
              v-model.number="editedItem.caregiverAge"
              label="年齡"
              type="number"
              required
            ></v-text-field>
          </v-col>

          <v-col cols="6">
            <v-text-field
              v-model.number="editedItem.expYears"
              label="工作經驗(年)"
              type="number"
              required
            ></v-text-field>
          </v-col>

          <v-col cols="6">
            <v-text-field
              v-model.number="editedItem.hourlyRate"
              label="時薪"
              type="number"
              prefix="$"
              required
            ></v-text-field>
          </v-col>

          <v-col cols="12">
            <v-textarea
              v-model="editedItem.eduExperience"
              label="學歷與經驗"
              rows="3"
            ></v-textarea>
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
  </div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';

// 設定全域 axios 請求攔截器
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token'); // 或從 Vuex 取得
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
// CaregiverManagement.vue
export default {
  name: 'CaregiverManagement',
  data: () => ({
    dialog: false,
    search: '',
    // 表格欄位定義
    headers: [
      { text: '護工編號', value: 'caregiverNO' },
      { text: '會員編號', value: 'user.userID' },
      { text: '姓名', value: 'user.userName' },
      { text: '照片', value: 'user.userPhoto' },
      { text: '性別', value: 'caregiverGender' },
      { text: '年齡', value: 'caregiverAge' },
      { text: '經驗(年)', value: 'expYears' },
      { text: '學歷', value: 'eduExperience' },
      { text: '時薪', value: 'hourlyRate' },
      { text: '電話', value: 'user.userPhone' },
      { text: '電子郵件', value: 'user.userEmail' },
      { text: '都市', value: 'user.userCity' },
      { text: '城鎮', value: 'user.userDistrict' },
      { text: '地區', value: 'user.userAddress' },
      { text: '操作', value: 'actions', sortable: false }
    ],
    caregivers: [],
    loading: false, // 新增載入狀態
    editedIndex: -1,
    userPhotoFile: null,
    // 編輯項目的預設結構
    editedItem: {
      caregiverNO: null,
      caregiverGender: '',
      caregiverAge: 0,
      expYears: 0,
      eduExperience: '',
      hourlyRate: 0,
      user: {
        userID: '',
        userName: '',
        userEmail: '',
        userPhone: '',
        userCity: '',
        userDistrict: '',
        userAddress: '',
        userPhoto: null
      }
    },
    // 用於重置的預設值
    defaultItem: {
      caregiverNO: null,
      caregiverGender: '',
      caregiverAge: 0,
      expYears: 0,
      eduExperience: '',
      hourlyRate: 0,
      user: {
        userID: '',
        userName: '',
        userEmail: '',
        userPhone: '',
        userCity: '',
        userDistrict: '',
        userAddress: '',
        userPhoto: null
      }
    }
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? '新增護工' : '編輯護工資料';
    }
  },

  watch: {
    dialog(val) {
      val || this.close();
    }
  },

  created() {
    this.initialize();
  },

  methods: {
    addItem() {
    this.$router.push('/caregiver/insert');
  },
  close() {
    this.dialog = false;
    this.$nextTick(() => {
      this.editedItem = Object.assign({}, this.defaultItem);
      this.editedIndex = -1;
    });
  },

  // 編輯對話框顯示
editItem(item) {
  this.editedIndex = this.caregivers.indexOf(item);
  this.editedItem = {
    caregiverNO: item.caregiverNO,
    caregiverGender: item.caregiverGender,
    caregiverAge: item.caregiverAge,
    expYears: item.expYears,
    eduExperience: item.eduExperience,
    hourlyRate: item.hourlyRate,
    user: {
      userID: item.user.userID
    }
  };
  this.dialog = true;
},

async save() {
  console.log('ABC:'+localStorage.getItem('token'));
  
  try {
    const response = await axios.put('http://localhost:8080/api/caregiver/UpdateCaregiver', 
      this.editedItem,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (response.data && response.data.message === "更新成功") {
      await Swal.fire({
        icon: 'success',
        title: '更新成功',
        text: '護工資料已更新'
      });
      this.close(); // 确保调用 close 方法
      await this.initialize(); // 重新载入数据
    }
  } catch (error) {
    console.error('更新失敗:', error);
    Swal.fire({
      icon: 'error',
      title: '更新失敗',
      text: error.response?.data?.error || '更新資料時發生錯誤'
    });
  }
},
  // 刪除按鈕處理
  async deleteItem(item) {
    const result = await Swal.fire({
      title: '確定要刪除嗎？',
      text: "此操作無法復原！",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '確定刪除',
      cancelButtonText: '取消'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:8080/api/caregiver/DeleteCaregiver?caregiverNO=${item.caregiverNO}`);
        await Swal.fire('成功', '刪除成功', 'success');
        this.initialize();
      } catch (error) {
        console.error('刪除失敗:', error);
        Swal.fire('錯誤', '刪除失敗', 'error');
      }
    }
  },

    // 初始化資料載入
    async initialize() {
  this.loading = true;
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:8080/api/caregiver/FindAllCaregiver', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // 處理回傳的資料
    this.caregivers = response.data.map(caregiver => {
      const user = caregiver.user || {};
      return {
        ...caregiver,
        caregiverNO: caregiver.caregiverNO || null,
        caregiverGender: caregiver.caregiverGender || '',
        caregiverAge: caregiver.caregiverAge || 0,
        expYears: caregiver.expYears || 0,
        eduExperience: caregiver.eduExperience || '',
        hourlyRate: caregiver.hourlyRate || 0,
        user: {
          userID: user.userID || '',
          userName: user.userName || '',
          userEmail: user.userEmail || '',
          userPhone: user.userPhone || '',
          userCity: user.userCity || '',
          userDistrict: user.userDistrict || '',
          userAddress: user.userAddress || '',
          userPhoto: user.userPhoto || null,
          userPhotoBase64: user.userPhoto ? `data:image/jpeg;base64,${user.userPhoto}` : null
        }
      };
    });
    console.log('處理後的護工資料:', this.caregivers);
  } catch (error) {
    console.error('資料載入錯誤:', error);
    let errorMessage = '無法載入資料';
    if (error.response?.status === 403) {
      errorMessage = '沒有權限存取此資源，請先登入';
    }
    Swal.fire('錯誤', errorMessage, 'error');
  } finally {
    this.loading = false;
  }
}
}};
</script>

<style scoped>
.v-data-table {
  margin: 20px;
}
</style>




