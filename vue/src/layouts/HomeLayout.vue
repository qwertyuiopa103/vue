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
import GLightbox from 'glightbox';
import 'glightbox/dist/css/glightbox.min.css';
import PureCounter from '@srexi/purecounterjs';
import Isotope from 'isotope-layout';


const isLoading = ref(true);
const showScrollTop = ref(false);

const handleScroll = () => {
    if (window.scrollY > 300) {
        showScrollTop.value = true;
    } else {
        showScrollTop.value = false;
    }
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

    // 初始化 GLightbox
    const lightbox = GLightbox({
        selector: '.glightbox',
    });

    // 初始化 PureCounter
    new PureCounter();

    // 初始化 Isotope
    initIsotope();

    // 添加滾動事件監聽器
    window.addEventListener('scroll', handleScroll);

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

// 初始化 Isotope
function initIsotope() {
    document.querySelectorAll('.isotope-layout').forEach(isotopeItem => {
        const layout = isotopeItem.getAttribute('data-layout') || 'masonry';
        const filter = isotopeItem.getAttribute('data-default-filter') || '*';
        const sort = isotopeItem.getAttribute('data-sort') || 'original-order';

        const container = isotopeItem.querySelector('.isotope-container');
        if (!container) return;

        const iso = new Isotope(container, {
            itemSelector: '.isotope-item',
            layoutMode: layout,
            filter: filter,
            sortBy: sort,
        });

        // 監聽過濾器點擊事件
        const filters = isotopeItem.querySelectorAll('.isotope-filters li');
        filters.forEach(filterElem => {
            filterElem.addEventListener('click', function () {
                isotopeItem.querySelector('.filter-active').classList.remove('filter-active');
                this.classList.add('filter-active');
                iso.arrange({ filter: this.getAttribute('data-filter') });

                // 重新初始化 AOS
                AOS.refresh();
            });
        });
    });
}

</script>
<template>
    <div class="index-page">
        <div id="preloader" v-if="isLoading">
            <div class="progress-bar"></div>
        </div>
        <Header></Header>
        <main>
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
    position: fixed;
    right: 20px;
    bottom: 20px;
    width: 40px;
    height: 40px;
    background-color: #000;
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: opacity 0.3s;
    opacity: 0.7;
}

.scroll-top:hover {
    opacity: 1;
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