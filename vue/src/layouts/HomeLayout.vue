<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Footer from '@/components/Footer.vue';
import Header from '@/components/Header.vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import AOS from 'aos';
import 'aos/dist/aos.css';
import PureCounter from '@srexi/purecounterjs';




const isLoading = ref(true);
const showScrollTop = ref(false);

const handleScroll = () => {
    // if (window.scrollY > 1000) {
    //     showScrollTop.value = true;
    // } else {
    //     showScrollTop.value = false;
    // }
    showScrollTop.value = window.scrollY > 200;
};

const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

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
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    // 模擬預載器延遲
    setTimeout(() => {
        isLoading.value = false;
    }, 2000);

    // 呼叫一次以設置初始狀態
    handleScroll();
});

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
});

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
        <a href="#" id="scroll-top" class="scroll-top d-flex align-items-center justify-content-center"
            v-show="showScrollTop" @click.prevent="scrollToTop">
            <i class="bi bi-arrow-up-short"></i>
        </a>
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

/* Scroll Top 按鈕樣式 */
.scroll-top {
    border-radius: 50%;
}



.progress-bar {
    width: 0%;
    height: 5px;
    background: #3498db;
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