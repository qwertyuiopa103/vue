<!-- 修改 Header.vue -->
<template>
    <header id="header" class="header d-flex align-items-center sticky-top">
        <div class="container-fluid container-xl position-relative d-flex align-items-center  justify-content-between">
            <router-link to="/home" class="logo d-flex align-items-center mr-10">
                <img src="/Home/img/logo.png" alt="Logo">
                <h1 class="sitename mt-1" style="font-size: 35px; font-weight: bolder;">心護家</h1>
            </router-link>

            <nav id="navmenu" class="navmenu" v-if="isAuthenticated">
                <ul>
                    <!-- <li><router-link to="/" class="active" @click="closeMobileNav">Home</router-link></li> -->
                    <!-- 新增看護選項 -->
                    <li v-if="userCaregiver"><router-link class="dropdown-item" to="home/caregiver/Management">尋找看護</router-link></li>
                    <li><router-link to="/home/reserve/calendar" @click="closeMobileNav">預約查詢</router-link></li>
                    <li><router-link to="/home/UserOrderView" @click="closeMobileNav">訂單查詢</router-link></li>
                    <li><router-link to="/home/events" @click="closeMobileNav">活動總覽</router-link></li>
                    <!-- <li class="dropdown" :class="{ 'active': dropdownActive }">
                        <a href="#" @click.prevent="toggleDropdown"><span>Dropdown</span> <i
                                class="bi bi-chevron-down toggle-dropdown"></i></a>
                        <transition name="fade">
                            <ul v-if="dropdownActive" class="dropdown-active">
                                <li><a href="#" @click="closeMobileNav">Dropdown 1</a></li>
                                <li><a href="#" @click="closeMobileNav">Dropdown 2</a></li>
                                <li><a href="#" @click="closeMobileNav">Dropdown 3</a></li>
                                <li><a href="#" @click="closeMobileNav">Dropdown 4</a></li>
                            </ul>
                        </transition>
                    </li> -->

                    <div class="mr-2" style="font-size: small;">歡迎，<strong>{{ username }}</strong></div>
                    <li class="dropdown" :class="{ 'active': userDropdownActive }">
                        <a href="#" @click.prevent="toggleUserDropdown">
                            <img :src="avatarUrl || '/user/img/user3.png'" alt="mdo" width="40" height="40"
                                class="rounded-circle"><i class="bi bi-caret-down-fill"></i>
                        </a>
                        <transition name="fade">
                            <ul v-if="userDropdownActive" class="text-small dropdown-active">
                                <li><router-link class="dropdown-item" to="/home/userProfile">個人資料</router-link></li>
                                <li v-if="userAdmin"><router-link class="dropdown-item"
                                        to="/admin/user">後台系統</router-link>
                                </li>
                                <li>
                                    <hr>
                                </li>
                                <li><a class="dropdown-item" href="#" @click.prevent="logout"><v-icon
                                            icon="mdi-logout"></v-icon>登出</a></li>
                            </ul>
                        </transition>
                    </li>
                </ul>
            </nav>
            <div class="text-end" v-else>
                <router-link to="/home/userLogin" class="btn btn-outline-dark me-2">登入</router-link>
                <router-link to="/home/userRegister" class="btn btn-outline-warning">註冊</router-link>
            </div>
        </div>
    </header>
</template>

<script setup>
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { computed, ref, watch, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
import axios from 'axios';
const router = useRouter();
const mobileNavActive = ref(false);
const dropdownActive = ref(false);
const userDropdownActive = ref(false);
const authStore = useAuthStore();
// 初始化 Pinia store
authStore.initialize();
// 從 localStorage 獲取 id 和 token
const userId = ref(localStorage.getItem('userId'));
const token = ref(localStorage.getItem('token'));
const role = ref(localStorage.getItem('userRole'));
// 用戶頭像的 URL
const username = computed(() => authStore.name);
const avatarUrl = computed(() => authStore.avatar);
// 檢查用戶是否已登錄
const isAuthenticated = computed(() => authStore.isAuthenticated);
const userAdmin = ref(false);
const userCaregiver = ref(false); // 新增看護身分參考
const checkAdminRole = () => {
    // userAdmin.value = role.value === 'ROLE_ADMIN';
    console.log('Current role:', role.value);
    userAdmin.value = role.value === 'ROLE_ADMIN';
    console.log('Is admin:', userAdmin.value);
};
const checkCaregiverRole = () => {
    // userAdmin.value = role.value === 'ROLE_ADMIN';
    console.log('Current role:', role.value);
    userCaregiver.value = role.value === 'ROLE_CAREGIVER'; // 新增看護身分檢查
    console.log('Is caregiver:', userCaregiver.value);
};

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

const toggleUserDropdown = () => {
    userDropdownActive.value = !userDropdownActive.value;

};
const logout = () => {
    authStore.logout();
    // 如果需要重定向到登錄頁面，可以在此處添加：
    router.push("/home")
};

// 獲取用戶詳細資訊
const fetchUserProfile = async () => {
    if (!token.value) return;
    try {
        const response = await axios.get('/user/profile', {
            headers: {
                'Authorization': `Bearer ${token.value}`
            }
        });
        if (response.status === 200) {
            // 後端回傳資料: { id, role, name, avatar, ... }
            const { id: userIdFromApi, role: roleFromApi, name, avatar } = response.data;

            // 顯示: 頭像 & 用戶名
            username.value = name || '用戶';
            avatarUrl.value = avatar || null;

            // 同步 Pinia => login(後端拿到 id, 目前 token, 後端拿到的 role)
            authStore.login(userIdFromApi, authStore.token, roleFromApi);
            authStore.name = name || '用戶';
            authStore.avatar = avatar || '/user/img/user3.png';

            // 更新本地 token / id / role
            token.value = authStore.token;
            userId.value = authStore.id;
            role.value = authStore.role;

            // 檢查管理員
            checkAdminRole();
        }
    } catch (error) {
        console.error('獲取用戶頭像失敗:', error);
    }
};

// 當用戶登錄狀態改變時，獲取用戶詳細資訊
watch(
    () => isAuthenticated.value,
    (newVal) => {
        if (newVal) {
            fetchUserProfile();
        } else {
            avatarUrl.value = null;
        }
    }
);


// onMounted: 手動解析 "#/home?token=xxx&id=xxx&role=xxx"
onMounted(async () => {
    const hash = window.location.hash // e.g. "#/home?token=xxx"
    const splitted = hash.split('?')
    if (splitted.length > 1) {
        const queryPart = splitted[1] // "token=xxx"
        const params = new URLSearchParams(queryPart)
        const tokenFromUrl = params.get('token')
        if (tokenFromUrl) {
            // 1) 先用 Pinia login => (id=null, token=..., role=null)
            authStore.login(null, tokenFromUrl, null)
            token.value = tokenFromUrl
            isAuthenticated.value = true

            // 2) 清理 URL => router.replace("/home")
            router.replace("/home").then(() => {
                // 3) 呼叫 fetchUserProfile => 後端回傳 id, role, name, avatar
                fetchUserProfile()
            })
            return
        }
    }

    // 如果已經登入，嘗試從 `authStore` 或本地儲存初始化
    const tokenFromStorage = localStorage.getItem('token');
    const idFromStorage = localStorage.getItem('userId');
    const roleFromStorage = localStorage.getItem('userRole');

    if (tokenFromStorage && idFromStorage && roleFromStorage) {
        // 初始化 Pinia 狀態
        authStore.login(idFromStorage, tokenFromStorage, roleFromStorage);

        // 確保加載用戶詳細資料
        await fetchUserProfile();
        checkAdminRole();
    } else {
        // 未登入狀態，清空資料
        authStore.logout();
    }
});

// 在 onMounted 中執行角色檢查
onMounted(() => {
    if (isAuthenticated.value) {
        fetchUserProfile();
        checkCaregiverRole();
    }
});

</script>

<style scoped>
h1 {
    color: #FF5757 !important;
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
    color: #FF7575;
    font-size: 20px !important;
    font-weight: bold;
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

.dropdown li {
    min-width: 100px !important;

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

a {
    text-decoration: none !important;
}

.navmenu li:hover>a {
    color: #EA0000 !important;
    text-decoration: underline !important;
}

hr {
    margin: 0;
}

.header .logo img {
    max-height: 60px !important;

}
</style>