<template>
  <div class="container">
    <div class="row">
      <div class="col-md-5">
        <!-- 事件詳情 -->
        <div class="project-info-box mt-0">
          <h5>項目詳情</h5>
          <p class="mb-0">{{ event.eventDescription }}</p>
        </div>

        <div class="project-info-box">
          <p><b>事件名稱:</b> {{ event.eventName }}</p>
          <p><b>事件類型:</b> {{ event.eventType }}</p>
          <p><b>地點:</b> {{ event.eventLocation }}</p>
          <p><b>開始日期:</b> {{ formatDate(event.eventStart) }}</p>
          <p><b>結束日期:</b> {{ formatDate(event.eventEnd) }}</p>
        </div>

        <!-- 新增的「聯繫我們」區塊 -->
        <div class="project-info-box mt-0 mb-0">
          <h6>聯繫我們</h6>
          <p>
            如果您對這個活動有任何疑問，請隨時聯繫我們：
          </p>
          <p><b>電子郵件:</b> <a :href="'mailto:' + contact.email">{{ contact.email }}</a></p>
          <p><b>電話:</b> {{ contact.phone }}</p>
        </div>
      </div>

      <div class="col-md-7">
        <!-- 事件圖片 -->
        <img :src="event.eventPicture" alt="project-image" class="rounded img-fluid">
        <div class="project-info-box">
          <p><b>類別:</b> {{ event.category }}</p>
          <p><b>工具:</b> {{ event.tools }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  data() {
    return {
      event: {
        eventID: 0,
        eventName: '',
        eventType: '',
        eventStart: '',
        eventEnd: '',
        eventLocation: '',
        eventDescription: '',
        eventPicture: '',
        category: '設計, 插圖',
        tools: 'Illustrator'
      },
      contact: {
        email: 'info@example.com',
        phone: '+886 123 456 789'
      }
    };
  },
  methods: {
    // 使用 fetch 獲取事件資料
    // async fetchEventData(eventID) {
    //   try {
    //     const response = await fetch(`http://localhost:8080/api/eventAdmin/get?eventID=${eventID}`);
        
    //     if (!response.ok) {
    //       throw new Error('獲取事件資料失敗!!!');
    //     }
    //     console.log("AAA");
    //     console.log(response);
        
    //     const data = await response.json();
        
    //     console.log(data);
        
    //     this.event = { ...this.event, ...data }; // 更新 event 資料
    //   } catch (error) {
    //     console.error("獲取事件資料時出錯:", error);
    //   }
    // },
    async fetchEventData(eventID) {
      try {
        const response = await axios.get(`http://localhost:8080/api/eventAdmin/get?eventID=${eventID}`);
        console.log("Event data fetched:", response.data);
        this.event = { ...this.event, ...response.data }; // 更新 event 資料
      } catch (error) {
        console.error("獲取事件資料時出錯:", error);
      }
    },
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return '未提供';
      const date = new Date(dateString);
      return date.toLocaleString(); // 轉換為本地時間格式
    }
  },
  created(){
    const eventID = this.$route.params.id;
    this.fetchEventData(eventID);
  },
  // mounted() {
  //   // 當組件掛載時，請求事件資料，這裡假設傳入的 eventID 是 1
  //   // const eventID = this.$route.params.id;
  //   // this.fetchEventData(eventID);
  // }
};
</script>

<style scoped>
.container {
  background: #f8f9fa;
  margin-top: 20px;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}
.project-info-box {
  background-color: #fff;
  padding: 30px 40px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}
.project-info-box:hover {
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
}
.project-info-box p {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #dcdfe1;
}
.project-info-box p:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}
img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  object-fit: cover;
}
h5, h6 {
  font-weight: bold;
  color: #343a40;
  margin-bottom: 15px;
}
a {
  color: #007bff;
  text-decoration: none;
  transition: color 0.3s ease;
}
a:hover {
  color: #0056b3;
  text-decoration: underline;
}
@media (max-width: 767px) {
  .container {
    padding: 15px;
  }
  .row {
    flex-direction: column;
  }
  .col-md-5, .col-md-7 {
    width: 100%;
    margin-bottom: 20px;
  }
}
</style>