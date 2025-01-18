<template>
    <div>

        <v-card class="mx-auto pa-4 pb-8 my-6" elevation="8" max-width="448" rounded="lg">
            <!-- <v-img class="mx-auto my-2" max-width="100" src="/Home/img/logo.png"></v-img> -->
            <div class="text-center  mt-3">
                <h3>歡迎回來</h3>
            </div>
            <div class="text-subtitle-1 text-medium-emphasis">帳號</div>

            <v-text-field v-model="userAccount" density="compact" placeholder="請輸入信箱或手機"
                prepend-inner-icon="mdi-account-circle-outline" variant="outlined"></v-text-field>

            <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
                密碼

                <router-link to="/home/userPassword" class="text-caption text-decoration-none text-blue">
                    忘記密碼?</router-link>
            </div>

            <v-text-field v-model="userPassword" :append-inner-icon="visible ? 'mdi-eye' : 'mdi-eye-off'"
                :type="visible ? 'text' : 'password'" density="compact" placeholder="請輸入密碼"
                prepend-inner-icon="mdi-lock-outline" variant="outlined"
                @click:append-inner="togglePasswordVisibility"></v-text-field>

            <v-card class="mb-3" color="surface-variant" variant="tonal">
                <v-card-text v-if="errorMessage" class="text-medium-emphasis text-caption">
                    {{ errorMessage }}
                </v-card-text>
            </v-card>
            <v-row class="">
                <v-col>
                    <v-btn prepend-icon="mdi-account" @click="nomal" color="secondary" size="large" variant="tonal"
                        block rounded="xl">
                        正常帳號
                    </v-btn>
                </v-col>
                <v-col>
                    <v-btn prepend-icon="mdi-autorenew" @click="change" color="secondary" size="large" variant="tonal"
                        block rounded="xl">
                        修改密碼
                    </v-btn>
                </v-col>
            </v-row>
            <v-row class="mb-2">
                <v-col>
                    <v-btn prepend-icon="mdi-account-hard-hat" @click="admin" color="secondary" size="large"
                        variant="tonal" block rounded="xl">
                        管理員
                    </v-btn>
                </v-col>
                <v-col>
                    <v-btn prepend-icon="mdi-account-heart" @click="care" color="secondary" size="large" variant="tonal"
                        block rounded="xl">
                        看護員
                    </v-btn>
                </v-col>
            </v-row>
            <v-btn class="mb-2" color="blue" size="large" variant="tonal" block rounded="xl"
                prepend-icon='mdi-login-variant' @click="handleLogin">
                登入會員
            </v-btn>
            <v-card-text class="text-center">
                <div class="container">
                    <div class="line"></div>
                    <span class="text">第三方登入 </span>
                    <div class="line"></div>
                </div>
            </v-card-text>
            <v-btn class="mb-2" color="red-lighten-1" size="large" variant="tonal" block rounded="xl"
                prepend-icon='mdi-google'>Google</v-btn>
            <v-card-text class="text-center">
                <span class="mr-2">還不是會員 ?</span>
                <router-link to="/home/userRegister" class="text-blue text-decoration-none">
                    註冊會員<v-icon class="mb-1" icon="mdi-chevron-right"></v-icon>
                </router-link>
            </v-card-text>
        </v-card>
    </div>
</template>
<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
import axios from 'axios';

const authStore = useAuthStore();
const router = useRouter();

const userAccount = ref('');
const userPassword = ref('');
const visible = ref(false);
const errorMessage = ref('');
const togglePasswordVisibility = () => {
    visible.value = !visible.value;
};

const handleLogin = async () => {
    errorMessage.value = '';
    try {
        const response = await axios.post('/LoginController/login', {
            useraccount: userAccount.value,
            userpassword: userPassword.value,
        });

        if (response.status === 200) {
            const { id, token, role } = response.data;
            authStore.login(id, token, role);
            router.push("/home").then(() => {
                window.location.reload();
            });
        }

    } catch (error) {
        console.error('登錄失敗:', error);
        if (error.response && error.response.data) {
            // 從後端響應中獲取錯誤訊息
            errorMessage.value = error.response.data;
        } else {
            errorMessage.value = '發生未知錯誤';
        }
    }
};
const nomal = () => {
    userAccount.value = 'qwertyuiopa106@gmail.com';
    userPassword.value = 'aaa123@';
};

const change = () => {
    userAccount.value = 'qwertyuiopa106@gmail.com';
    userPassword.value = 'aa123@';
};

</script>
<style scoped>
.container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    /* 控制文字與線條的間距 */
}

.line {
    flex-grow: 1;
    /* 讓線條自動延展 */
    height: 2px;
    background-color: #ccc;
    /* 自行調整顏色 */
}

.text {
    font-size: 20px;
    /* 控制字型大小 */
    color: #555;
    /* 自行調整文字顏色 */
}
</style>