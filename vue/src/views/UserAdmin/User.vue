<script setup>
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from '@/plugins/axios';
// 1. 取得路由參數
const route = useRoute()
const userId = route.params.id

// 定義一個變數來追蹤當前的標籤頁
const currentTab = ref('about-me');

// 切換標籤的函數
const changeTab = (tab) => {
    currentTab.value = tab;
};

const user = ref({
    userID: '',
    userName: '',
    userEmail: '',
    userPhone: '',
    userCity: '',
    userDistrict: '',
    userAddress: '',
    userCreat: '',
    userLogin: null, // 初始化為 null
    userUpdated: null,
    userLockoutEnd: '',
    userFailedLoginAttempts: 0,
    userVerified: false,
    userActive: false,
    userPasswordChanged: null,
})
// 格式化使用者資料的 computed
const formattedUser = computed(() => ({
    ...user.value,
    userLogin: user.value.userLogin || '尚未登入',
    userUpdated: user.value.userUpdated || '尚未更新',
    userLockoutEnd: user.value.userLockoutEnd || '未被鎖定',
    userPasswordChanged: user.value.userPasswordChanged || '未被更改密碼',
    userVerified: user.value.userVerified ? '已驗證' : '未驗證',
    userActive: user.value.userActive ? '啟用' : '禁用',
}));

// 3. 在組件掛載時，去呼叫後端 API 取得資料
onMounted(async () => {
    try {
        const response = await axios.get(`/UserAdmin/users/${userId}`);
        if (response.status === 200) {
            // 假設後端返回的數據格式符合 JSON，直接賦值
            user.value = response.data;
        }
    } catch (error) {
        console.error('取得使用者資料失敗', error)
    }
})


</script>

<template>
    <div class="container">
        <div class="row">
            <div class="col-lg-4 col-xl-4">
                <div class="card-box text-center">
                    <img :src="formattedUser.userPhoto || '/user/img/user3.png'"
                        class="rounded-circle avatar-xl img-thumbnail mb-3 " alt="profile-image">
                    <input class="mb-2 text-center" style="font-size: larger;font-weight: bold;"
                        v-model="formattedUser.userID" readonly>
                    <input class="text-muted text-center" style="font-size: large;font-weight: bold;"
                        v-model="formattedUser.userName" readonly>
                </div> <!-- end card-box -->
            </div> <!-- end col-->

            <div class="col-lg-8 col-xl-8">
                <div class="card-box">
                    <ul class="nav nav-pills navtab-bg">
                        <li class="nav-item">
                            <a href="#" class="nav-link ml-0" :class="{ active: currentTab === 'about-me' }"
                                @click.prevent="changeTab('about-me')">
                                <i class="mdi mdi-face-man-profile mr-2 "></i>會員資料
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="#" class="nav-link" :class="{ active: currentTab === 'settings' }"
                                @click.prevent="changeTab('settings')">
                                <i class="mdi mdi-cog mr-2 "></i>系統資料
                            </a>
                        </li>
                    </ul>

                    <div class="tab-content">

                        <div v-if="currentTab === 'about-me'" class="tab-pane"
                            :class="{ active: currentTab === 'about-me' }">

                            <form>
                                <div class="row mb-2 mt-2">
                                    <div class="form-group">
                                        <label class="mb-1"><i class="mdi mdi-email mr-2"></i>信箱</label>
                                        <input class="form-control" readonly v-model="formattedUser.userEmail">
                                    </div>
                                </div> <!-- end row -->
                                <div class="row mb-2">
                                    <div class="form-group">
                                        <label class="mb-1"><i class="mdi mdi-cellphone mr-2"></i>手機</label>
                                        <input class="form-control" readonly v-model="formattedUser.userPhone">
                                    </div>
                                </div> <!-- end row -->
                                <div class="row mb-2">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label class="mb-1"><i class="mdi mdi-city-variant mr-2"></i>縣市</label>
                                            <input class="form-control" readonly v-model="formattedUser.userCity">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label class="mb-1"><i class="mdi mdi-home-city mr-2"></i>鄉鎮區</label>
                                            <input class="form-control" readonly v-model="formattedUser.userDistrict">
                                        </div>
                                    </div> <!-- end col -->
                                </div> <!-- end row -->
                                <div class="row">
                                    <div class="form-group">
                                        <label class="mb-1"><i class="mdi mdi-home mr-2"></i>詳細地址</label>
                                        <input type="text" class="form-control" readonly
                                            v-model="formattedUser.userAddress">
                                    </div>
                                </div> <!-- end row -->
                            </form>


                        </div>
                        <!-- end timeline content-->


                        <div v-if="currentTab === 'settings'" class="tab-pane"
                            :class="{ active: currentTab === 'settings' }">
                            <form>
                                <h5 class="mb-3 bg-light p-2" style="font-weight:bold;"><i
                                        class=" mdi mdi-clock-time-eight mr-1"></i>
                                    時間紀錄</h5>

                                <div class="row mb-2">
                                    <div class="form-group">
                                        <label class="mb-1">創建時間</label>
                                        <input class="form-control" readonly v-model="formattedUser.userCreat">
                                    </div> <!-- end row -->
                                </div>
                                <div class="row mb-2">
                                    <div class="form-group">
                                        <label class="mb-1">登入時間</label>
                                        <input class="form-control" readonly v-model="formattedUser.userLogin">
                                    </div> <!-- end row -->
                                </div>
                                <div class="row mb-2">
                                    <div class="form-group">
                                        <label class="mb-1">更新時間</label>
                                        <input class="form-control" readonly v-model="formattedUser.userUpdated">
                                    </div> <!-- end row -->
                                </div>
                                <div class="row mb-3">
                                    <div class="form-group">
                                        <label class="mb-1">密碼更改時間</label>
                                        <input class="form-control" readonly
                                            v-model="formattedUser.userPasswordChanged">
                                    </div> <!-- end row -->
                                </div>

                                <h5 class="mb-3 bg-light p-2" style="font-weight:bold;"> <i
                                        class="mdi mdi-shield-lock mr-1"></i>安全控制</h5>
                                <div class="row mb-3">
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label class="mb-1">鎖定次數</label>
                                            <input class="form-control" readonly
                                                v-model="formattedUser.userFailedLoginAttempts">
                                        </div>
                                    </div>
                                    <div class="col-md-9">
                                        <div class="form-group">
                                            <label class="mb-1">鎖定時間</label>
                                            <input class="form-control" readonly v-model="formattedUser.userLockoutEnd">
                                        </div>
                                    </div> <!-- end col -->
                                </div> <!-- end row -->

                                <h5 class="mb-3  bg-light p-2" style="font-weight:bold;"><i class="mdi 
                                    mdi-account-cog mr-1"></i>
                                    帳號狀態
                                </h5>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label class="mb-1">驗證狀態</label>
                                            <input class="form-control" readonly v-model="formattedUser.userVerified">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label class="mb-1">啟用狀態</label>
                                            <input class="form-control" readonly v-model="formattedUser.userActive">
                                        </div>
                                    </div> <!-- end col -->
                                </div> <!-- end row -->


                            </form>
                        </div>
                        <!-- end settings content-->

                    </div> <!-- end tab-content -->
                </div> <!-- end card-box-->

            </div> <!-- end col -->
        </div>
    </div>
</template>

<style lang="css" scoped>
body {
    color: #6c757d;
    background-color: #f5f6f8;
    margin-top: 20px;
}

.card-box {
    background-color: #fff;
    background-clip: border-box;
    border: 2px solid #e7eaed;
    padding: 1.5rem;
    margin-bottom: 24px;
    border-radius: .25rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.avatar-xl {
    height: 10rem;
    width: 10rem;
}

.rounded-circle {
    border-radius: 50% !important;
}

.nav-pills .nav-link.active,
.nav-pills .show>.nav-link {
    color: #fff;
    background-color: #8E8E8E;
    /* background-color: #1abc9c; */
}

.nav-pills .nav-link {
    border-radius: .25rem;
}

.navtab-bg li>a {
    background-color: #f7f7f7;
    margin: 0 5px;
}

.nav-pills>li>a,
.nav-tabs>li>a {
    color: #6c757d;
    font-weight: 600;
}

.mb-4,
.my-4 {
    margin-bottom: 2.25rem !important;
}

.tab-content {
    padding: 20px 0 0 0;
}

.progress-sm {
    height: 5px;
}

.m-0 {
    margin: 0 !important;
}

.bg-light {
    background-color: #E0E0E0 !important;
    border-radius: .25rem;
}
</style>