<template>
  <v-container>
    <v-card>
      <v-card-title class="text-h5 d-flex justify-space-between align-center">
        事件資料表
        <v-btn color="primary" @click="openDialog()">新增事件</v-btn>
      </v-card-title>

      <v-card-text>
        <!-- 搜尋欄位 -->
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="搜尋事件"
          single-line
          variant="outlined"
          hide-details
          class="mb-4"
        ></v-text-field>

        <!-- 資料表格 -->
        <v-data-table
          :headers="headers"
          :items="events"
          :search="search"
          :items-per-page="5"
          item-value="eventID"
          class="elevation-1 custom-table"
        >
          <!-- 操作按鈕欄位 -->
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon
              class="mr-2"
              color="primary"
              @click="openDialog(item, true)"
            >
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
                <v-text-field
                  v-model="editedItem.eventName"
                  label="事件名稱"
                  :rules="[v => !!v || '請輸入事件名稱']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.eventType"
                  label="事件類型"
                  :rules="[v => !!v || '請輸入事件類型']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.eventStart"
                  label="開始時間"
                  type="datetime-local"
                  :rules="[v => !!v || '請選擇開始時間']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.eventEnd"
                  label="結束時間"
                  type="datetime-local"
                  :rules="[v => !!v || '請選擇結束時間']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.eventLocation"
                  label="事件地點"
                  :rules="[v => !!v || '請輸入事件地點']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editedItem.eventDescription"
                  label="事件描述"
                  :rules="[v => !!v || '請輸入事件描述']"
                  required
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-file-input
                  v-model="editedItem.eventImage"
                  label="事件圖片"
                  accept="image/*"
                  prepend-icon="mdi-camera"
                  @change="handleImageUpload"
                ></v-file-input>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
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
import { ref, onMounted } from "vue";
import Swal from "sweetalert2";

export default {
  name: "EventTable",
  setup() {
    const headers = [
      { title: "事件ID", key: "eventID", width: "100px" },
      { title: "事件名稱", key: "eventName", width: "150px" },
      { title: "事件類型", key: "eventType", width: "120px" },
      { title: "開始時間", key: "eventStart", width: "150px" },
      { title: "結束時間", key: "eventEnd", width: "150px" },
      { title: "事件地點", key: "eventLocation", width: "200px" },
      { title: "事件描述", key: "eventDescription", width: "300px" },
      { title: "事件圖片", key: "eventPicture", width: "120px" },
      { title: "操作", key: "actions", width: "100px", sortable: false },
    ];

    const events = ref([]);
    const search = ref("");
    const dialog = ref(false);
    const editMode = ref(false);
    const valid = ref(false);
    const loading = ref(false);
    const form = ref(null);

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

   const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

    const editedItem = ref({ ...defaultItem });
    const eventImage = ref(null);

    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/event/all");
        events.value = response.data;
      } catch (error) {
        console.error("無法加載事件數據：", error);
      }
    };

    const openDialog = (item = null, isEditMode = false) => {
      editMode.value = isEditMode;
      editedItem.value = item ? { ...item } : { ...defaultItem };
      dialog.value = true;
    };

    const closeDialog = () => {
      dialog.value = false;
      editedItem.value = { ...defaultItem };
      eventImage.value = null;
      if (form.value) form.value.reset();
    };

    const handleImageUpload = (file) => {
  if (!file) return;

  // 將圖片設置為 Base64 預覽
  const reader = new FileReader();
  reader.onload = () => {
    editedItem.value.eventPicture = reader.result; // 預覽圖片
  };
  reader.readAsDataURL(file);

  // 保存文件本身以供提交
  eventImage.value = file;
};

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
    formData.append("eventPictureFile", editedItem.value.eventImage); // 注意字段名需與後端一致
  console.log(editedItem.value.eventStart);

    if (editMode.value) {
      // 編輯事件
      await axios.put(
        `http://localhost:8080/api/event/${editedItem.value.eventID}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
    } else {
      // 新增事件
      await axios.post("http://localhost:8080/api/event/insert", formData, {
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

    const confirmDelete = async (item) => {
      const result = await Swal.fire({
        title: "確定要刪除這個事件嗎？",
        text: "此操作無法復原！",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "確認刪除",
        cancelButtonText: "取消",
      });

      if (result.isConfirmed) {
        loading.value = true;
        try {
          await axios.delete(`http://localhost:8080/api/event/delete/${item.eventID}`);
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

    onMounted(fetchEvents);

    return {
      headers,
      events,
      search,
      dialog,
      editMode,
      editedItem,
      valid,
      form,
      loading,
      fetchEvents,
      openDialog,
      closeDialog,
      saveEvent,
      confirmDelete,
      handleImageUpload,
    };
  },
};
</script>

<style scoped>
.custom-table .v-data-table__wrapper {
  overflow-x: auto;
}
</style>
