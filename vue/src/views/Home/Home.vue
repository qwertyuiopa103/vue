<script setup>
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { ref, onMounted, watch, nextTick } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import AOS from 'aos';
import 'aos/dist/aos.css';
import GLightbox from 'glightbox';
import 'glightbox/dist/css/glightbox.min.css';
import PureCounter from '@srexi/purecounterjs';
import axios from '@/plugins/axios'
const swiperOptions = {
    modules: [Navigation, Pagination, Autoplay],
    loop: true,
    pagination: { clickable: true },
    navigation: false,
    autoplay: { delay: 1800 },
    on: {
        init: () => {
            AOS.refresh(); // Swiper 初始化後刷新 AOS
        },
        slideChange: () => {
            AOS.refresh(); // 每次滑動後刷新 AOS
        },
    },
};

// 圖片列表
const slides = ref([
    "/Home/img/home3.jpg",
    "/Home/img/home1.jpg",
    "/Home/img/home4.jpg"
]);

// 監聽 slides 變化，確保 Swiper 能夠正常運行 loop
watch(slides, (newSlides) => {
    swiperOptions.value.loop = newSlides.length > 1; // 當 slides 大於 1 才啟用 loop
});

const memberCount = ref(0);
const OrderCount = ref(0);
const CaregiverCount = ref(0);
onMounted(async () => {
    // 確保 DOM 完全渲染
    await nextTick();

    // 初始化 AOS
    AOS.init({
        duration: 600,
        easing: 'ease-in-out',
        once: true,
        mirror: false,
    });


    // 發送請求獲取會員總數
    try {
        const response = await axios.get('/UserNoAuth/user/userCount');
        memberCount.value = response.data;
    } catch (error) {
        console.error('獲取會員總數失敗:', error);
    }

    try {
        const response = await axios.get('/OrderNoAuth/Count');
        OrderCount.value = response.data;
    } catch (error) {
        console.error('獲取訂單總數失敗:', error);
    }

    try {
        const response = await axios.get('/UserNoAuth/user/caregiverCount');
        CaregiverCount.value = response.data;
    } catch (error) {
        console.error('獲取看護總數失敗:', error);
    }


    // 初始化 PureCounter
    new PureCounter();

    // 如果有其他初始化邏輯，如 GLightbox 或 Isotope，可以在此處添加
});

</script>

<template>
    <div>
        <section id="about" class="about section">
            <div class="container">
                <div class="row align-items-center justify-content-between">
                    <div class="col-lg-7 mb-5 mb-lg-0 order-lg-2" data-aos="fade-up" data-aos-delay="400">
                        <div class="swiper">
                            <div class="swiper-wrapper">
                                <Swiper :modules="[Navigation, Pagination, Autoplay]" :loop="slides.length > 1"
                                    :pagination="{ clickable: true }" :navigation="false" :autoplay="{ delay: 1800 }"
                                    class="mySwiper">
                                    <SwiperSlide v-for="(img, index) in slides" :key="index">
                                        <img :src="img" alt="Image" class="img-fluid" />
                                    </SwiperSlide>
                                </Swiper>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4 order-lg-1">
                        <h1 class="mb-4" data-aos="fade-up" style="font-size: 30px; font-weight: bolder;">
                            心護家 用心守護您的家
                        </h1>
                        <p data-aos="fade-up" style="font-size: 25px; text-align: justify;">
                            用心打造看護挑選平台，嚴選專業貼心看護，匹配每位使用者的需求，以愛與專業守護每個家庭的安心與幸福，讓照護更溫暖、更安心。
                        </p>
                    </div>
                </div>
            </div>
        </section>
        <!-- Stats Section -->
        <section id=" stats" class="stats section light-background">

            <div class="container">

                <div class="row gy-4 justify-content-center">

                    <div class="col-lg-5">
                        <div class="images-overlap">
                            <img src="/Home/img/img_v_1.jpg" alt="student" class="img-fluid img-1" data-aos="fade-up">
                        </div>
                    </div>

                    <div class="col-lg-4 ps-lg-5">
                        <span class="content-subtitle"></span>
                        <!-- <h2 class="content-title">選擇心護家</h2> -->
                        <strong style="font-size: 28px;">專業媒合，安心無憂</strong>
                        <p class="lead mb-5" style="font-size: 23px; text-align: justify;">
                            提供經過審核的專業看護，快速匹配您的需求，輕鬆找到適合的照護服務。
                        </p>
                        <strong style=" font-size: 28px;">靈活預約，隨時支援</strong>
                        <p class="lead mb-5" style="font-size: 23px; text-align: justify;">
                            支援彈性預約與即時服務，滿足各種看護需求，確保您的使用體驗更順暢。
                        </p>

                        <div class="row mb-10 count-numbers">

                            <!-- Start Stats Item -->
                            <div class="col-4 counter" data-aos="fade-up" data-aos-delay="100">
                                <span data-purecounter-separator="true" data-purecounter-start="0"
                                    :data-purecounter-end="memberCount" data-purecounter-duration="1"
                                    class="purecounter number"></span>
                                <span class="d-block">會員人數</span>
                            </div>
                            <!-- End Stats Item -->

                            <!-- Start Stats Item -->
                            <div class="col-4 counter" data-aos="fade-up" data-aos-delay="200">
                                <span data-purecounter-separator="true" data-purecounter-start="0"
                                    :data-purecounter-end="CaregiverCount" data-purecounter-duration="1"
                                    class="purecounter number"></span>
                                <span class="d-block">專業看護</span>
                            </div>
                            <!-- End Stats Item -->

                            <!-- Start Stats Item -->
                            <div class="col-4 counter" data-aos="fade-up" data-aos-delay="300">
                                <span data-purecounter-separator="true" data-purecounter-start="0"
                                    :data-purecounter-end="OrderCount" data-purecounter-duration="1"
                                    class="purecounter number"></span>
                                <span class="d-block">媒合案件</span>
                            </div>
                            <!-- End Stats Item -->

                        </div>
                    </div>

                </div>

            </div>
        </section><!-- /Stats Section -->

    </div>
</template>


<style lang="css" scoped>
h1 {
    color: #FF8000 !important;
}

/* p {
    color: #FF8F59 !important;
} */
</style>