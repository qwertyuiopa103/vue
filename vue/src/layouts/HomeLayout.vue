<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import Footer from '@/components/Footer.vue';
import Header from '@/components/Header.vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination } from 'swiper/modules';
import { useRoute } from 'vue-router'
import Swal from 'sweetalert2'
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import AOS from 'aos';
import 'aos/dist/aos.css';
import PureCounter from '@srexi/purecounterjs';

const route = useRoute()
const showBackToTop = ref(false)

const isLoading = ref(true);

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
    // 初始化 AOS
    AOS.init({
        duration: 600,
        easing: 'ease-in-out',
        once: true,
        mirror: false,
    });

    // 初始化 PureCounter
    new PureCounter();

    // 添加滾動事件監聽器
    window.addEventListener('scroll', handleScroll)

    // 模擬預載器延遲
    setTimeout(() => {
        isLoading.value = false;
    }, 2000);

    // 呼叫一次以設置初始狀態

});

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
})
// 監聽路由的任何變動
watch(
    () => route.fullPath,
    (newPath) => {
        // 如果路由包含 /home/error，彈出錯誤訊息
        if (newPath.includes('/home/error')) {
            Swal.fire({
                icon: 'error',
                title: '錯誤',
                text: '此帳號已被停用，無法登入',
                confirmButtonColor: '#FFC78E',
                confirmButtonText: '確定',
            })
        }
    },
    { immediate: true } // 讓它在首次載入時也執行一次
)
</script>
<template>
    <div class="index-page">
        <div id="preloader" v-if="isLoading">
            <div class="progress-bar"></div>
        </div>
        <Header></Header>
        <main class="main">
            <!--  <Swiper :modules="[Navigation, Pagination]" :loop="true" :pagination="{ clickable: true }"
                :navigation="true" class="mySwiper">
                <SwiperSlide>Slide 1</SwiperSlide>
                <SwiperSlide>Slide 2</SwiperSlide>
                <SwiperSlide>Slide 3</SwiperSlide>
                添加更多 SwiperSlide 根據需要 
            </Swiper>-->
            <RouterView></RouterView>
        </main>
        <Footer></Footer>
        <!-- <a href="#" id="scroll-top" class="scroll-top d-flex align-items-center justify-content-center"
            v-show="showScrollTop" @click.prevent="scrollToTop">
            <i class="bi bi-arrow-up-short"></i>
        </a> -->

        <button class="back-to-top" @click="scrollToTop" :class="{ 'show': showBackToTop }" aria-label="返回頂部">
            <i class="fas fa-arrow-up"></i>
        </button>
    </div>

</template>


<style lang="css" scoped>
/* Google Fonts 已在 main.css 中引入 */

.index-page {
    font-family: 'Roboto', sans-serif;
}

/* Preloader 樣式 */
#preloader {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    background-color: #fff;
    /* 根據需要調整 */
    /* 添加任何預載器動畫或載入指示器 */
}

/* 返回頂部按鈕 */
.back-to-top {
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: rgba(255, 199, 143, 0.9);
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
    background-color: rgba(255, 161, 66, 1);
}



.progress-bar {
    width: 0%;
    height: 5px;
    background: #FFA042;
    animation: progress 3s linear;
}

@keyframes progress {
    0% {
        width: 0%;
    }

    100% {
        width: 100%;
    }
}
</style>