<template>
  <div class="pa-6">
    <v-card class="mx-auto" max-width="800">
      <v-card-title class="text-center">註冊成為看護</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-container>
            <v-row>
              <!-- 顯示 UserID (唯讀) -->
              <v-col cols="12" md="6">
                <v-text-field v-model="formData.userID" label="會員編號" readonly outlined
                  :rules="[v => !!v || '會員編號不能為空']"></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-select v-model="formData.caregiverGender" :items="['男', '女']" label="性別" required
                  :rules="[v => !!v || '請選擇性別']"></v-select>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model.number="formData.caregiverAge" label="年齡" type="number" required :rules="[
                  v => !!v || '請輸入年齡',
                  v => v >= 18 || '年齡必須大於18歲'
                ]"></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model.number="formData.expYears" label="工作經驗(年)" type="number" required :rules="[
                  v => !!v || '請輸入工作經驗年數',
                  v => v >= 0 || '工作經驗不能為負數'
                ]"></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model.number="formData.hourlyRate" label="時薪" type="number" prefix="$" required :rules="[
                  v => !!v || '請輸入時薪',
                  v => v > 0 || '時薪必須大於0'
                ]"></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-textarea v-model="formData.eduExperience" label="學歷與經驗" required :rules="[v => !!v || '請輸入學歷與經驗']"
                  rows="3"></v-textarea>
              </v-col>
            </v-row>
          </v-container>

          <v-card-actions class="justify-center">
            <v-btn color="primary" @click="submitForm" :loading="loading" :disabled="!valid">
              確認新增
            </v-btn>
            <v-btn color="error" @click="cancel">取消</v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';
import jwt_decode from 'jwt-decode';

export default {
  name: 'CaregiverManualInsert',

  data() {
    return {
      valid: false,
      loading: false,
      formData: {
        userID: '',
        caregiverGender: '',
        caregiverAge: null,
        expYears: null,
        eduExperience: '',
        hourlyRate: null
      }
    };
  },

  created() {
    this.getUserIDFromToken();
  },

  methods: {
    getUserIDFromToken() {
      const token = sessionStorage.getItem('token');
      if (token) {
        try {
          // JWT token 解碼後會包含用戶ID
          const decoded = jwt_decode(token);
          this.formData.userID = decoded.sub; // 'sub' 是儲存用戶ID的標準claim
        } catch (error) {
          console.error('Token解析失敗:', error);
          Swal.fire({
            icon: 'error',
            title: '錯誤',
            text: '無法獲取用戶信息，請重新登入'
          }).then(() => {
            this.$router.push('/login');
          });
        }
      } else {
        // 如果沒有token，重定向到登入頁面
        this.$router.push('/login');
      }
    },

    async submitForm() {
      if (!this.$refs.form.validate()) return;

      this.loading = true;
      try {
        const response = await axios.post(
          'http://localhost:8080/api/caregiver/InsertCaregiver',
          {
            user: {
              userID: this.formData.userID
            },
            caregiverGender: this.formData.caregiverGender,
            caregiverAge: this.formData.caregiverAge,
            expYears: this.formData.expYears,
            eduExperience: this.formData.eduExperience,
            hourlyRate: this.formData.hourlyRate
          },
          {
            headers: {
              'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
          }
        );

        if (response.data && response.data.message === "新增成功") {
          await Swal.fire({
            icon: 'success',
            title: '成功',
            text: '護工資料新增成功'
          });
          this.$router.push('/home/caregiver/setting');
        }
      } catch (error) {
        console.error('新增失敗:', error);
        let errorMessage = '護工資料新增失敗';
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        }
        Swal.fire({
          icon: 'error',
          title: '新增失敗',
          text: errorMessage
        });
      } finally {
        this.loading = false;
      }
    },

    cancel() {
      this.$router.push('/admin/caregiver');
    }
  }
};
</script>

<style scoped>
.v-card {
  margin-top: 20px;
}

.v-text-field {
  width: 100%;
}
</style>