<template>
  <div style="background-color: #f0f0f0; min-height: 100vh; padding: 20px;">
    <div align="center">
      <h2 style="color: #333;">新增預約資料</h2>
      <v-form ref="reserveForm" lazy-validation>
        <v-container>
          <v-row dense>
            <v-col cols="12" md="6">
              <v-text-field v-model="formData.reserveId" label="輸入服務編號" type="number" outlined dense
                required></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="formData.userId" label="輸入用戶編號" type="text" outlined dense required></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="formData.caregiverId" label="輸入看護編號" type="number" outlined dense
                required></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="formData.startTime" label="輸入開始日期" type="date" outlined dense
                required></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="formData.endTime" label="輸入結束日期" type="date" outlined dense
                required></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="formData.orderDate" label="輸入預購日期" type="date" outlined dense
                required></v-text-field>
            </v-col>
          </v-row>
          <v-row justify="center" dense>
            <v-btn color="black" dark @click="submitForm" class="mx-2">
              新增
            </v-btn>
            <v-btn color="grey darken-1" dark @click="setDefaultValues" class="mx-2">
              新增預設資料
            </v-btn>
          </v-row>
        </v-container>
      </v-form>
    </div>
  </div>
</template>

<script>
import Swal from "sweetalert2";

export default {
  data() {
    return {
      formData: {
        reserveId: "",
        userId: "",
        caregiverId: "",
        startTime: "",
        endTime: "",
        orderDate: "",
      },
    };
  },
  methods: {
    validateForm() {
      if (
        !this.formData.reserveId ||
        !this.formData.userId ||
        !this.formData.caregiverId ||
        !this.formData.startTime ||
        !this.formData.endTime ||
        !this.formData.orderDate
      ) {
        this.showAlert("錯誤!", "請填寫所有必填欄位！", "error");
        return false;
      }
      return true;
    },
    setDefaultValues() {
      this.formData = {
        reserveId: 100,
        userId: "USR0001",
        caregiverId: 1,
        startTime: "2025-01-01",
        endTime: "2025-01-01",
        orderDate: "2025-01-01",
      };
    },
    submitForm() {
      if (!this.validateForm()) return;

      const reserve = {
        ...this.formData,
        userBean: { userID: this.formData.userId },
        caregiverBean: { caregiverNO: this.formData.caregiverId },
      };
      delete reserve.userId;
      delete reserve.caregiverId;

      fetch("http://localhost:8080/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reserve),
      })
        .then((response) => {
          if (response.ok) {
            return response.text();
          } else {
            throw new Error("新增失敗");
          }
        })
        .then((message) => {
          this.showAlert("成功!", message, "success").then(() => {
            this.redirectToSearch(reserve.userBean.userID, reserve.caregiverBean.caregiverNO);
          });
        })
        .catch((error) => {
          console.error("Error:", error);
          this.showAlert("錯誤!", "請求失敗，請稍後再試。", "error");
        });
    },
    showAlert(title, text, icon) {
      return Swal.fire({ title, text, icon, confirmButtonColor: '#FFC78E', confirmButtonText: "確定" });
    },
    redirectToSearch(userId, caregiverId) {
      // 構建查詢 URL 並重定向
      const queryParams = `?userId=${encodeURIComponent(userId)}&caregiverId=${encodeURIComponent(caregiverId)}`;
      const fullUrl = `#/admin/reserve/search${queryParams}`;
      window.location.href = fullUrl;
    },
  },
};
</script>

<style scoped>
h2 {
  font-size: 24px;
  margin-bottom: 20px;
}

.v-btn {
  font-weight: bold;
}

.v-container {
  max-width: 600px;
}
</style>