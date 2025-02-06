<template>
  <v-container>
    <v-card>
      <v-card-title class="text-h5 d-flex justify-space-between align-center">
        事件資料表
        <v-btn color="blue-grey" @click="openDialog()">新增事件</v-btn>
      </v-card-title>

      <v-card-text>
        <!-- 搜尋欄位 -->
        <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="搜尋事件" single-line variant="outlined"
          hide-details class="mb-4"></v-text-field>

        <!-- 可展開的資料表格 -->
        <v-data-table v-model:expanded="expanded" :headers="headers" :items="events" :search="search"
          :items-per-page="10" item-value="eventID" show-expand class="elevation-1 fixed-table">
          <!-- 操作按鈕欄位 -->
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon class="mr-2" color="warning" @click="openDialog(item, true)">
              mdi-pencil
            </v-icon>
            <v-icon color="error" @click="confirmDelete(item)">
              mdi-delete
            </v-icon>
          </template>

          <!-- 圖片欄位 -->
          <template v-slot:[`item.eventPicture`]="{ item }">
            <v-img :src="item.eventPicture" max-height="100" max-width="100"></v-img>
          </template>

          <!-- 展開列內容 -->
          <template v-slot:expanded-row="{ columns, item }">
            <tr>
              <td :colspan="columns.length" class="pa-4">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-card outlined>
                      <v-card-title><strong>開始時間</strong></v-card-title>
                      <v-card-text>{{ item.eventStart }}</v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-card outlined>
                      <v-card-title><strong>結束時間</strong></v-card-title>
                      <v-card-text>{{ item.eventEnd }}</v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-card outlined>
                      <v-card-title><strong>事件地點</strong></v-card-title>
                      <v-card-text>{{ item.eventLocation }}</v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-card outlined>
                      <v-card-title><strong>事件描述</strong></v-card-title>
                      <v-card-text>{{ item.eventDescription }}</v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- 新增/編輯對話框 -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span>{{ editMode ? "編輯事件" : "新增事件" }}</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field v-model="editedItem.eventName" label="事件名稱" :rules="[v => !!v || '請輸入事件名稱']"
                  required></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="editedItem.eventType" label="事件類型" :rules="[v => !!v || '請輸入事件類型']"
                  required></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="editedItem.eventStart" label="開始時間" type="datetime-local"
                  :rules="[v => !!v || '請選擇開始時間']" required></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="editedItem.eventEnd" label="結束時間" type="datetime-local"
                  :rules="[v => !!v || '請選擇結束時間']" required></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="editedItem.eventLocation" label="事件地點" :rules="[v => !!v || '請輸入事件地點']"
                  required></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="editedItem.eventDescription" label="事件描述" :rules="[v => !!v || '請輸入事件描述']"
                  required></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-file-input v-model="editedItem.eventImage" label="事件圖片" accept="image/*" prepend-icon="mdi-camera"
                  @change="handleImageUpload"></v-file-input>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="success" @click="edit">
            一鍵新增
          </v-btn>
          <v-btn color="error" text @click="closeDialog">取消</v-btn>
          <v-btn color="primary" @click="saveEvent" :loading="loading">
            確認
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from "axios";
import { ref, onMounted, computed } from "vue";
import Swal from "sweetalert2";

export default {
  name: "EventTable",
  setup() {
    // 定義表頭，移除地點和描述欄位
    const headers = [
      { title: "編號", key: "eventID", width: "65px" },
      { title: "事件名稱", key: "eventName", width: "90px" },
      { title: "事件類型", key: "eventType", width: "90px" },
      // { title: "開始時間", key: "eventStart", width: "100px" },
      // { title: "結束時間", key: "eventEnd", width: "100px" },
      { title: "事件圖片", key: "eventPicture", width: "90px" },
      { title: "操作", key: "actions", width: "65px", sortable: false },
      { title: "", key: "data-table-expand", width: "50px" }
    ];

    // 響應式狀態
    const events = ref([]);
    const search = ref("");
    const dialog = ref(false);
    const editMode = ref(false);
    const valid = ref(false);
    const loading = ref(false);
    const form = ref(null);
    const expanded = ref([]);
    const eventImage = ref(null);

    // 預設表單項目
    const defaultItem = {
      eventID: null,
      eventName: "",
      eventType: "",
      eventStart: "",
      eventEnd: "",
      eventLocation: "",
      eventDescription: "",
      eventPicture: "",
    };

    const editedItem = ref({ ...defaultItem });

    // 日期格式化函數
    const formatDate = (date) => {
      if (!date) return null;
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      // const seconds = String(d.getSeconds()).padStart(2, "0");

      return `${year}-${month}-${day} ${hours}:${minutes}`;
    };
    const formattedEvents = computed(() => {
      return events.value.map(item => ({
        ...item,
        eventStart: formatDate(item.eventStart),
        eventEnd: formatDate(item.eventEnd)
      }));
    });
    // 一鍵新增預設值
    const edit = () => {
      editedItem.value = {
        ...defaultItem,
        eventName: "老人健走",
        eventType: "健康活動",
        eventStart: new Date().toISOString().substring(0, 16),
        eventEnd: new Date(new Date().getTime() + 3600000).toISOString().substring(0, 16),
        eventLocation: "台北市大安森林公園",
        eventDescription: "適合老人家的健康步行活動。",
      };
      dialog.value = true;
    };

    // 載入事件列表
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/eventAdmin/all");
        events.value = response.data;
      } catch (error) {
        console.error("無法加載事件數據：", error);
      }
    };

    // 開啟對話框
    const openDialog = (item = null, isEditMode = false) => {
      editMode.value = isEditMode;
      editedItem.value = item ? { ...item } : { ...defaultItem };
      dialog.value = true;
    };

    // 關閉對話框
    const closeDialog = () => {
      dialog.value = false;
      editedItem.value = { ...defaultItem };
      eventImage.value = null;
      if (form.value) form.value.reset();
    };

    // 圖片上傳處理
    const handleImageUpload = (file) => {
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        editedItem.value.eventPicture = reader.result;
      };
      reader.readAsDataURL(file);

      eventImage.value = file;
    };

    // 儲存事件
    const saveEvent = async () => {
      if (!form.value.validate()) return;

      loading.value = true;
      try {
        const formData = new FormData();
        formData.append("eventID", editedItem.value.eventID || "");
        formData.append("eventName", editedItem.value.eventName || "");
        formData.append("eventType", editedItem.value.eventType || "");
        formData.append("eventStart", formatDate(editedItem.value.eventStart) || "");
        formData.append("eventEnd", formatDate(editedItem.value.eventEnd) || "");
        formData.append("eventLocation", editedItem.value.eventLocation || "");
        formData.append("eventDescription", editedItem.value.eventDescription || "");
        formData.append("eventPictureFile", editedItem.value.eventImage);

        if (editMode.value) {
          // 編輯事件
          await axios.put(
            `http://localhost:8080/api/eventAdmin/${editedItem.value.eventID}`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
        } else {
          // 新增事件
          await axios.post("http://localhost:8080/api/eventAdmin/insert", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }

        await fetchEvents();
        closeDialog();
      } catch (error) {
        console.error("保存失敗：", error);
        Swal.fire({
          title: "保存失敗！",
          text: error.response?.data || "請稍後再試。",
          icon: "error",
        });
      } finally {
        loading.value = false;
      }
    };

    // 確認刪除
    const confirmDelete = async (item) => {
      const result = await Swal.fire({
        title: "確定要刪除這個事件嗎？",
        text: "此操作無法復原！",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: '#FFB5B5',
        cancelButtonColor: '#95CACA',
        confirmButtonText: "確認刪除",
        cancelButtonText: "取消",
      });

      if (result.isConfirmed) {
        loading.value = true;
        try {
          await axios.delete(`http://localhost:8080/api/eventAdmin/delete/${item.eventID}`);
          await fetchEvents();
          Swal.fire({
            title: "刪除成功！",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        } catch (error) {
          console.error("刪除失敗：", error);
          Swal.fire({
            title: "刪除失敗！",
            text: "請稍後再試。",
            icon: "error",
          });
        } finally {
          loading.value = false;
        }
      }
    };

    // 初始化時載入事件
    onMounted(fetchEvents);

    return {
      headers,
      events: formattedEvents,
      search,
      dialog,
      editMode,
      editedItem,
      valid,
      form,
      loading,
      expanded,
      fetchEvents,
      openDialog,
      closeDialog,
      saveEvent,
      confirmDelete,
      handleImageUpload,
      edit,
    };
  },
};
</script>

<style scoped>
.v-data-table__wrapper {
  overflow-x: auto;
}

.fixed-table ::v-deep table {
  table-layout: fixed !important;
  width: 100% !important;
  /* 確保表格寬度佔滿 */
}

.v-container {
  padding: 0px !important;
}


::v-deep .v-data-table-header__content {
  font-weight: bold;
}
</style>