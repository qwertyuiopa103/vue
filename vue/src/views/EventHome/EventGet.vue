<template>
  <div class="container">
    <div class="row">
      <!-- 左側資訊區塊 -->
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
        <!-- 聯繫我們 -->
        <div class="project-info-box mt-0 mb-0">
          <h6>聯繫我們</h6>
          <p>如果您對這個活動有任何疑問，請隨時聯繫我們：</p>
          <p><b>電子郵件:</b> <a href="https://www.ispan.com.tw/">ispan@example.com</a></p>
          <p><b>電話:</b> +886 123 456 789</p>
        </div>
      </div>
      <!-- 右側圖片區塊 -->
      <div class="col-md-7">
        <img :src="event.eventPicture" alt="project-image" class="rounded">
        <div class="project-info-box">
          <p><b>適合對象及年齡範圍:</b> 長者（銀髮族）55 歲以上</p>
          <p><b>費用:</b> 全程免費</p>
          <!-- 按鈕區 -->
          <div class="button-group mt-3">
            <router-link :to="{ name: 'eventAll_view' }" class="btn btn-success">返回活動列表</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
        eventPicture: ''
      }
    };
  },
  methods: {
    // 使用 fetch 獲取事件資料
    async fetchEventData(eventID) {
      try {
        const response = await fetch(`http://localhost:8080/api/event/get?eventID=${eventID}`);
        if (!response.ok) {
          throw new Error('獲取事件資料失敗');
        }
        const data = await response.json();
        this.event = data; // 更新 event 資料
      } catch (error) {
        console.error("獲取事件資料時出錯:", error);
      }
    },
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString(); // 轉換為本地時間格式
    }
  },
  mounted() {
    // 當組件掛載時，請求事件資料，這裡假設傳入的 eventID 是 1
    this.fetchEventData(1);
  }
};
</script>

<style scoped>
/* 基本樣式 */
.container {
  background: linear-gradient(to top, #ffefef, #fff);
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
}

.project-info-box {
  background-color: #ffffff;
  padding: 30px 40px;
  border-radius: 5px;
  margin-bottom: 15px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.project-info-box:hover {
  transform: translateY(-5px);
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
}

.project-info-box p {
  line-height: 1.8;
  font-size: 16px;
  color: #555;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #d5dadb;
}

.project-info-box p:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

/* 標題樣式 */
h5,
h6 {
  font-size: 24px;
  font-weight: bold;
  color: #192f59;
  margin-bottom: 20px;
  border-bottom: 2px solid #FF5757;
  display: inline-block;
  padding-bottom: 5px;
}

/* 按鈕樣式 */
.btn {
  display: inline-block;
  padding: 10px 20px;
  border-radius: 5px;
  text-decoration: none;
  font-size: 16px;
  margin-right: 10px;
  transition: background-color 0.3s;
}

.btn-success {
  background-color: #28a745;
  color: #fff;
}

.btn-success:hover {
  background-color: #218838;
}

/* 圖片樣式 */
img {
  width: 100%;
  max-width: 100%;
  height: auto;
  border-radius: 5px;
  margin-bottom: 15px;
}

/* 手機適配 */
@media (max-width: 768px) {
  .project-info-box {
    padding: 20px;
  }

  .container {
    margin-top: 10px;
  }

  img {
    margin-bottom: 15px;
  }
}
</style>
