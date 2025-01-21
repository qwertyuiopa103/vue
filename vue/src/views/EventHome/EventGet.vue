<template>
    <div class="container">
      <div class="row">
        <div class="col-md-5">
          <!-- 事件詳情 -->
          <div class="project-info-box mt-0">
            <h5>項目詳情</h5>
            <p class="mb-0">{{ event.eventDescription }}</p>
          </div><!-- / project-info-box -->
  
          <div class="project-info-box">
            <p><b>事件名稱:</b> {{ event.eventName }}</p>
            <p><b>事件類型:</b> {{ event.eventType }}</p>
            <p><b>地點:</b> {{ event.eventLocation }}</p>
            <p><b>開始日期:</b> {{ formatDate(event.eventStart) }}</p>
            <p><b>結束日期:</b> {{ formatDate(event.eventEnd) }}</p>
          </div><!-- / project-info-box -->
  
          <!-- 新增的「聯繫我們」區塊 -->
          <div class="project-info-box mt-0 mb-0">
            <h6>聯繫我們</h6>
            <p>
              如果您對這個活動有任何疑問或需要更多資訊，請隨時聯繫我們：
            </p>
            <p><b>電子郵件:</b> <a href="mailto:info@example.com">info@example.com</a></p>
            <p><b>電話:</b> +886 123 456 789</p>
          </div><!-- / project-info-box -->
        </div><!-- / column -->
  
        <div class="col-md-7">
          <!-- 事件圖片 -->
          <img :src="event.eventPicture" alt="project-image" class="rounded">
          <div class="project-info-box">
            <p><b>類別:</b> 設計, 插圖</p>
            <p><b>工具:</b> Illustrator</p>
          </div><!-- / project-info-box -->
        </div><!-- / column -->
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
  .container {
    background: #f5f5f5;
    margin-top: 20px;
  }
  .project-info-box {
    background-color: #fff;
    padding: 30px 40px;
    border-radius: 5px;
    margin-bottom: 15px;
  }
  .project-info-box p {
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid #d5dadb;
  }
  .project-info-box p:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
  img {
    width: 100%;
    max-width: 100%;
    height: auto;
    border-radius: 5px;
  }
  </style>
  