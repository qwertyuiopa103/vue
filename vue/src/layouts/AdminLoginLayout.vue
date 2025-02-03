<script setup>
import { ref } from 'vue';
import axios from '@/plugins/axios'; // 假設 Axios 插件已配置
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
const account = ref('');
const password = ref('');
const router = useRouter();

const authStore = useAuthStore();
const handleLogin = async () => {
    try {
        authStore.logout();
        const response = await axios.post('/LoginController/adminlogin', {
            useraccount: account.value,
            userpassword: password.value,
        });
        if (response.status === 200) {
            const { id, token, role } = response.data;
            authStore.login(id, token, role);
            router.push('/admin/user');
        }

    } catch (error) {
        if (error.response && error.response.status === 401) {
            // 登入失敗的處理
            alert('帳號或密碼錯誤');
        } else {
            alert('伺服器錯誤，請稍後再試');
        }
    }
};
const edit = () => {
    password.value = 'aaa123@';
    account.value = 'monique4434@gmail.com'
};
</script>

<template>
    <div class="mx-auto my-15">
        <v-card class="mx-auto pa-12 pb-8" elevation="8" max-width="448" rounded="lg">
            <div class="title"><v-icon icon="mdi-hammer-wrench" class="mr-2 mb-1"></v-icon>後台系統</div>
            <div class="text-subtitle-1 text-medium-emphasis">帳號</div>

            <v-text-field density="compact" placeholder="請輸入帳號" prepend-inner-icon="mdi-account-hard-hat-outline"
                variant="outlined" v-model="account"></v-text-field>

            <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
                密碼


            </div>

            <v-text-field type="password" density="compact" placeholder="請輸入密碼" prepend-inner-icon="mdi-lock-outline"
                variant="outlined" v-model="password"></v-text-field>


            <v-btn class="mb-3" color="teal" size="large" variant="tonal" block @click="handleLogin">
                登入
            </v-btn>
            <v-btn class="mb-8" color="blue-grey" size="large" variant="tonal" block @click="edit">
                一鍵輸入
            </v-btn>

            <!-- <v-card-text class="text-center">
                <a class="text-blue text-decoration-none" href="#" rel="noopener noreferrer" target="_blank">
                    Sign up now <v-icon icon="mdi-chevron-right"></v-icon>
                </a>
            </v-card-text> -->
        </v-card>
    </div>
</template>


<style lang="css" scoped>
.title {
    text-align: center;
    font-weight: bolder;
    font-size: large;
}
</style>