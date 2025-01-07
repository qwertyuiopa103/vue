<!-- 修改 Header.vue -->
<template>
    <header id="header" class="header d-flex align-items-center sticky-top">
        <div class="container-fluid container-xl position-relative d-flex align-items-center justify-content-between">
            <a href="/" class="logo d-flex align-items-center">
                <img src="/Home/img/logo.png" alt="Logo">
                <h1 class="sitename">心護家</h1>
            </a>

            <nav id="navmenu" class="navmenu">
                <ul>
                    <li><router-link to="/" class="active" @click="closeMobileNav">Home</router-link></li>
                    <li><router-link to="/about" @click="closeMobileNav">看護功能</router-link></li>
                    <li><router-link to="/services" @click="closeMobileNav">預約功能</router-link></li>
                    <li><router-link to="/portfolio" @click="closeMobileNav">訂單功能</router-link></li>
                    <li><router-link to="/team" @click="closeMobileNav">活動功能</router-link></li>
                    <li class="dropdown" :class="{ 'active': dropdownActive }">
                        <a href="#" @click.prevent="toggleDropdown"><span>Dropdown</span> <i
                                class="bi bi-chevron-down toggle-dropdown"></i></a>
                        <transition name="fade">
                            <ul v-if="dropdownActive" class="dropdown-active">
                                <li><a href="#" @click="closeMobileNav">Dropdown 1</a></li>
                                <li class="dropdown">
                                    <a href="#" @click.prevent="toggleDeepDropdown"><span>Deep Dropdown</span> <i
                                            class="bi bi-chevron-down toggle-dropdown"></i></a>
                                    <transition name="fade">
                                        <ul v-if="deepDropdownActive" class="dropdown-active">
                                            <li><a href="#" @click="closeMobileNav">Deep Dropdown 1</a></li>
                                            <li><a href="#" @click="closeMobileNav">Deep Dropdown 2</a></li>
                                            <li><a href="#" @click="closeMobileNav">Deep Dropdown 3</a></li>
                                            <li><a href="#" @click="closeMobileNav">Deep Dropdown 4</a></li>
                                            <li><a href="#" @click="closeMobileNav">Deep Dropdown 5</a></li>
                                        </ul>
                                    </transition>
                                </li>
                                <li><a href="#" @click="closeMobileNav">Dropdown 2</a></li>
                                <li><a href="#" @click="closeMobileNav">Dropdown 3</a></li>
                                <li><a href="#" @click="closeMobileNav">Dropdown 4</a></li>
                            </ul>
                        </transition>
                    </li>
                </ul>
                <i class="mobile-nav-toggle d-xl-none bi" :class="mobileNavActive ? 'bi-x' : 'bi-list'"
                    @click="toggleMobileNav"></i>


            </nav>
            <div class="text-end">
                <button type="button" class="btn btn-outline-dark me-2">登入</button>
                <button type="button" class="btn btn-outline-warning">註冊</button>
            </div>
        </div>
    </header>
</template>

<script setup>
import { ref } from 'vue';

const mobileNavActive = ref(false);
const dropdownActive = ref(false);
const deepDropdownActive = ref(false);

const toggleMobileNav = () => {
    mobileNavActive.value = !mobileNavActive.value;
    document.body.classList.toggle('mobile-nav-active', mobileNavActive.value);
};

const closeMobileNav = () => {
    if (mobileNavActive.value) {
        toggleMobileNav();
    }
};

const toggleDropdown = () => {
    dropdownActive.value = !dropdownActive.value;
};

const toggleDeepDropdown = () => {
    deepDropdownActive.value = !deepDropdownActive.value;
};
</script>

<style scoped>
/* Header 相關樣式 */
.header {
    /* 添加任何自定義樣式 */
}

.navmenu ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
}

.navmenu li {
    position: relative;
    margin-right: 20px;
}

.navmenu a {
    text-decoration: none;
    color: #000;
}

.dropdown ul {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    background: #fff;
    padding: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dropdown.active ul,
.dropdown .dropdown-active {
    display: block;
}

.mobile-nav-toggle {
    cursor: pointer;
}

/* 過渡動畫 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>