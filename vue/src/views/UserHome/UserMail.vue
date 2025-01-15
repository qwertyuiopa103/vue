<template>
    <v-sheet class="pt-8 pb-12 px-6 ma-4 mx-auto" max-width="350" width="100%" border>
        <h3 class="text-h6 mb-1">信箱驗證</h3>

        <div class="text-body-2 font-weight-light">
            已將驗證碼寄至您的信箱 <br><span class="font-weight-black text-primary">{{ email }}</span>
        </div>

        <v-otp-input v-model="otp" class="mt-3 ms-n2" length="4" variant="underlined"></v-otp-input>
        <div class=" text-end">
            <v-btn color="success" size="small" text="驗證" variant="tonal" @click="handleverify"></v-btn>
        </div>
        <v-divider class="mt-3 mb-6"></v-divider>

        <div class="mb-3 text-body-2">
            未收到 <strong>驗證信</strong> ?
        </div>
        <v-btn :disabled="isResendDisabled" color="primary" size="small" variant="tonal" @click="handleResend">
            重新發送{{ isResendDisabled ? ` (${timer}秒)` : '' }}</v-btn>
    </v-sheet>
</template>
<script setup>
import Swal from 'sweetalert2'
import axios from '@/plugins/axios'
import { useUserStore } from '@/stores/userStore';
const userStore = useUserStore();
const email = userStore.email;
import { useRouter } from 'vue-router';
const router = useRouter();
import { ref } from 'vue';
const otp = ref('');
const isResendDisabled = ref(false); // 控制按鈕是否禁用
const timer = ref(10); // 倒數計時器
const handleverify = async () => {
    try {
        const response = await axios.get('/UserNoAuth/user/verify', {
            params: { // 正確使用 params 傳遞查詢參數
                email: email,
                token: otp.value,
            },
        });

        if (response.status === 200) {
            Swal.fire({
                icon: 'success',
                title: '驗證成功',
                text: '您已成功驗證信箱！',
                timer: 1500, // 自動關閉時間，單位毫秒
                timerProgressBar: true, // 顯示進度條
                showConfirmButton: false, // 隱藏確認按鈕
            }).then(() => {
                router.push('/home/userLogin');
            });
        }
    } catch (error) {
        otp.value = '';
        Swal.fire({
            icon: 'error',
            title: '驗證碼錯誤',
        });
    }
};
const startCountdown = () => {
    isResendDisabled.value = true;
    timer.value = 10;

    const interval = setInterval(() => {
        timer.value--;
        if (timer.value <= 0) {
            clearInterval(interval);
            isResendDisabled.value = false;
        }
    }, 1000);
};

const handleResend = async () => {
    otp.value = '';
    startCountdown();

    try {
        const response = await axios.patch('/UserNoAuth/user/resend', null, {
            params: { // 正確使用 params 傳遞查詢參數
                email: email,
            },
        });

        if (response.status === 200) {
            Swal.fire({
                icon: 'success',
                title: '已重新發送驗證信',
                timer: 1500,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: '重新發送失敗',
        });
    }
};
startCountdown();
</script>