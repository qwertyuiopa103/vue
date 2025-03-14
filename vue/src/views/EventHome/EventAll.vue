<template>
  <div class="container py-5">
    <!-- 活動列表 -->
    <div v-for="event in events" :key="event.eventID"
      class="row align-items-center event-block no-gutters margin-40px-bottom">
      <!-- 左側圖片區塊 -->
      <div :class="{ 'col-lg-5 col-sm-12': true, 'order-1 order-lg-2': event.eventID % 2 === 0 }">
        <div class="position-relative">
          <div class="event-image-container">
            <img :src="event.eventPicture || '/api/placeholder/450/280'" alt="活動圖片" class="event-image">
          </div>
          <div class="events-date">
            <div class="font-size14">{{ formatDate(event.eventStart, 'MMM') }}</div>
            <div class="font-size28">{{ formatDate(event.eventStart, 'DD') }}</div>

          </div>
        </div>
      </div>

      <!-- 右側內容區塊 -->
      <div :class="{ 'col-lg-7 col-sm-12': true, 'order-2 order-lg-1': event.eventID % 2 === 0 }">
        <div class="padding-60px-lr md-padding-50px-lr sm-padding-30px-all xs-padding-25px-all">
          <h5
            class="margin-15px-bottom md-margin-10px-bottom font-size22 md-font-size20 xs-font-size18 font-weight-500">
            <a href="#" class="text-theme-color" @click.prevent="showEventDetails(event)">{{ event.eventName }}</a>
          </h5>
          <ul class="event-time margin-10px-bottom md-margin-5px-bottom">
            <li>
              <i class="far fa-clock margin-10px-right"></i>
              {{ formatDate(event.eventStart, 'HH:mm') }} - {{ formatDate(event.eventEnd, 'HH:mm') }}
            </li>
            <li>
              <i class="fas fa-map-marker-alt margin-5px-right"></i>
              {{ event.eventLocation }}
            </li>
            <li>
              <i class="fas fa-tag margin-5px-right"></i>
              {{ event.eventType }}
            </li>
          </ul>
          <p class="event-description">{{ event.eventDescription }}</p>
        </div>
      </div>
    </div>

    <!-- 返回頂部按鈕 -->
    <!-- <button class="back-to-top" @click="scrollToTop" :class="{ 'show': showBackToTop }" aria-label="返回頂部">
      <i class="fas fa-arrow-up"></i>
    </button> -->
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router';

export default {
  name: 'EventList',
  setup() {
    const events = ref([])
    const showBackToTop = ref(false)
    const router = useRouter();  // 在 setup 中獲取路由實例
    // 格式化日期
    const formatDate = (date, format) => {
      const d = new Date(date)
      const formatOptions = {
        'DD': { day: '2-digit' },
        'MMM': { month: 'short' },
        'HH:mm': { hour: '2-digit', minute: '2-digit', hour12: false }
      }
      return new Intl.DateTimeFormat('zh-TW', formatOptions[format] || {}).format(d)
    }

    // 獲取所有活動
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/event/all')
        events.value = response.data
      } catch (error) {
        console.error('獲取活動失敗:', error)
      }
    }

    // 顯示活動詳情
    const showEventDetails = (event) => {
      router.push({
        path: `/home/event/${event.eventID}`, // 使用動態路徑
      });
    }

    // 處理滾動事件
    const handleScroll = () => {
      showBackToTop.value = window.scrollY > 300
    }

    // 返回頂部
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }

    onMounted(() => {
      fetchEvents()
      window.addEventListener('scroll', handleScroll)
    })

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
    })

    return {
      events,
      formatDate,
      showEventDetails,
      scrollToTop,
      showBackToTop
    }
  }
}
</script>

<style scoped>
body {
  background: #f5f5f5;
  margin-top: 20px;
}

/* 活動圖片容器 */
.event-image-container {
  width: 100%;
  height: 280px;
  overflow: hidden;
  position: relative;
}

.event-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* 返回頂部按鈕 */
.back-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: rgba(25, 47, 89, 0.9);
  color: white;
  border: none;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.back-to-top.show {
  opacity: 1;
}

.back-to-top:hover {
  background-color: rgba(25, 47, 89, 1);
}

.events-date {
  text-align: center;
  position: absolute;
  right: 30px;
  top: 30px;
  background-color: white;
  color: #FF8040;
  padding: 12px 20px 8px 20px;
  text-transform: uppercase;
  font-weight: bold;
}

.event-time {
  display: flex;
  /* 使用 flexbox 將列表項目排成一行 */
  justify-content: flex-start;
  /* 靠左對齊 */
  align-items: center;
  /* 垂直置中 */
  gap: 20px;
  /* 每個項目間距 */
  padding: 0;
  /* 移除多餘內邊距 */
  list-style: none;
  /* 移除列表符號 */
}

.event-time li {
  display: flex;
  /* 保持單項目的內容為水平排列 */
  align-items: center;
  /* 垂直置中圖標與文字 */
  margin: 0;
  /* 移除 margin */
}

.event-time li i {
  margin-right: 8px;
  /* 調整圖標和文字之間的間距 */
}


.event-time li i {
  color: #FF9D6F;
}

.event-block {
  box-shadow: 0px 0px 16px 0px rgba(187, 187, 187, 0.48);
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.event-block:hover {
  transform: translateY(-5px);
}

.event-description {
  line-height: 1.6;
  color: #666;
  margin-top: 15px;
}

@media screen and (max-width: 1199px) {
  .event-date {
    padding: 10px 18px 6px 18px;
  }
}

@media screen and (max-width: 575px) {
  .event-date {
    padding: 8px 15px 4px 15px;
  }

  .events-date {
    padding: 10px 15px 6px 15px;
  }

  .padding-60px-lr {
    padding-left: 30px;
    padding-right: 5px;
  }

  .back-to-top {
    bottom: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
  }
}

.position-relative {
  position: relative !important;
}

.margin-40px-bottom {
  margin-bottom: 40px;
}

.padding-60px-lr {
  padding-left: 30px;
  padding-right: 5px;
}

.margin-15px-bottom {
  margin-bottom: 15px;
}

.font-weight-500 {
  font-weight: 500;
}

.font-size22 {
  font-size: 22px;
}

.text-theme-color {
  color: #F75000;
  text-decoration: none;
  font-weight: bold;
}

.text-theme-color:hover {
  color: #FF9D6F;
}

.margin-10px-bottom {
  margin-bottom: 10px;
}

.margin-10px-right {
  margin-right: 10px;
}
</style>