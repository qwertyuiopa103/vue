<script setup>
import { ref } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router'; // 使用 Vue Router 進行頁面跳轉
const email = ref('')
const loading = ref(false);
const isSubmissionSuccessful = ref(false);
const router = useRouter(); // 獲取路由實例
const edit = () => {
    email.value = 'eeit190@gmail.com';
};
const sendPasswordRequest = async () => {
    if (!email.value) {
        Swal.fire({
            title: '錯誤',
            text: '請輸入您的信箱',
            icon: 'error',
            confirmButtonText: '確定',
        });
        return;
    }

    try {

        loading.value = true;
        const response = await axios.patch(
            '/UserNoAuth/user/sendPassword',
            null,
            {
                params: { email: email.value },
            }
        );

        if (response.status === 200) {
            // 使用 SweetAlert2 彈出成功提示
            isSubmissionSuccessful.value = true;
            Swal.fire({
                title: '發送成功！',
                text: '即將導向登入畫面',
                icon: 'success',
                confirmButtonColor: '#E0E0E0',
                confirmButtonText: '確定',
            }).then(() => {
                // 按下確定後跳轉至登入頁面
                isSubmissionSuccessful.value = false;
                router.push('/home/userLogin'); // 假設登入頁路由為 "/login"
            });
        } else {
            Swal.fire({
                title: '錯誤',
                text: response.statusText,
                icon: 'error',
                confirmButtonText: '確定',
            });
            loading.value = false;
        }
    } catch (error) {
        Swal.fire({
            title: '錯誤',
            text: error.response ? error.response.data : '發送失敗，請稍後再試',
            icon: 'error',
            confirmButtonText: '確定',
        });
        loading.value = false;
    }
};
</script>

<template>
    <div class="container padding-bottom-3x mb-5 mt-2">
        <div class="row justify-content-center">
            <div class="col-lg-8 col-md-10">
                <h2>忘記您的密碼 ? </h2>
                <p>更改密碼只需三個簡單步驟，幫助您確保新密碼的安全性。</p>
                <ol class="list-unstyled">
                    <li><span class="text-primary text-medium">1. </span>在下方填寫您的電子郵件地址。</li>
                    <li><span class="text-primary text-medium">2. </span>我們將向您發送一個連結網站。</li>
                    <li><span class="text-primary text-medium">3. </span>點擊信件中的連結網站，即可在安全的網站上更改您的密碼。</li>
                </ol>
                <form class="card mt-4" @submit.prevent="sendPasswordRequest">
                    <div class="card-body">
                        <div class="form-group">
                            <label for="email-for-pass" style="font-size: small;">請輸入您的信箱</label>
                            <input class="form-control" style="font-size: small;" type="text" id="email-for-pass"
                                v-model="email"><small
                                class="form-text text-muted">請輸入您註冊時使用的電子郵件，我們會將更改密碼的連結網站發送到該信箱。</small>
                        </div>
                    </div>
                    <div class="card-footer text-end">
                        <button class="btn btn-outline-secondary mr-3" @click="edit" type="button">一鍵輸入</button>
                        <button class="btn btn-outline-primary" type="submit" :disabled="loading"> <span
                                v-if="loading">處理中...</span>
                            <span v-else>送出</span></button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<style lang="css" scoped>
body {
    margin-top: 20px;
}

.form-control:not(textarea) {
    height: 44px;
}

.form-control {
    padding: 0 18px 3px;
    border: 1px solid #dbe2e8;
    border-radius: 22px;
    background-color: #fff;
    color: #606975;
    font-family: "Maven Pro", Helvetica, Arial, sans-serif;
    font-size: 14px;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
}

.form-group label {
    margin-bottom: 8px;
    padding-left: 18px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
}


.form-text {
    padding-left: 18px;
}

.text-muted {
    color: #9da9b9 !important;
}
</style>