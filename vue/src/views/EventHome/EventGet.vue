<template>
  <div class="container mb-5">
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

        <!-- 返回按鈕 -->
        <div class="project-info-box mt-3 text-center">
          <router-link :to="{ name: 'eventAll_view' }" class="btn btn-primary">
            返回所有活動
          </router-link>
        </div>
      </div>

      <div class="col-md-7">
        <!-- 事件圖片 -->
        <img :src="event.eventPicture" alt="project-image" class="rounded img-fluid mb-3">
        <div class="project-info-box">
          <p><b>費用:</b> {{ event.isFree ? '免費' : '需付費' }}</p>
          <p><b>適合年齡:</b> {{ event.ageGroup }}</p>
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
        ageGroup: '銀髮族（55歲以上）',
        isFree: true
      },
      contact: {
        email: 'info@example.com',
        phone: '+886 123 456 789'
      }
    };
  },
  methods: {
    async fetchEventData(eventID) {
      try {
        const response = await axios.get(`http://localhost:8080/api/event/get?eventID=${eventID}`);
        console.log("Event data fetched:", response.data);
        this.event = { ...this.event, ...response.data }; // 更新 event 資料
      } catch (error) {
        console.error("獲取事件資料時出錯:", error);
      }
    },
    // formatDate(dateString) {
    //   if (!dateString) return '未提供';
    //   const date = new Date(dateString);
    //   return date.toLocaleString(); // 轉換為本地時間格式
    // },
    formatDate(dateString) {
      if (!dateString) return '未提供';
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
    goBack() {
      this.$router.push('/events'); // 返回所有活動的頁面
    }
  },
  created() {
    const eventID = this.$route.params.id;
    this.fetchEventData(eventID);
  }
};
</script>

<style scoped>
.container {
  background-color: rgba(255, 204, 153, 0.5);
  margin-top: 20px;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.2);
}

.project-info-box {
  background-color: #fff;
  padding: 25px 30px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.project-info-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}

.project-info-box p {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #FFB6B6;
}

.project-info-box p:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

img {
  width: 100%;
  height: auto;
  border-radius: 10px;
  object-fit: cover;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15);
}

h5,
h6 {
  font-weight: bold;
  color: #F75000;
  margin-bottom: 15px;
}

a {
  color: #F75000;
  text-decoration: none;
  transition: color 0.3s ease;
}

a:hover {
  color: #FF9D6F;
  text-decoration: underline;
}

.btn-primary {
  background: #FF5809;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 16px;
  color: #fff;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #FF8F59;
  color: #fff;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15);
}

@media (max-width: 767px) {
  .container {
    padding: 15px;
  }

  .row {
    flex-direction: column;
  }

  .col-md-5,
  .col-md-7 {
    width: 100%;
    margin-bottom: 20px;
  }
}
</style>
