<script setup>
import { ref, nextTick } from "vue";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import Swal from 'sweetalert2';
const isSubmissionSuccessful = ref(false);
const route = useRoute(); // 獲取當前路由
const router = useRouter(); // 獲取路由實例
const token = route.params.token; // 提取 URL 中的 token

const isPasswordVisible = ref(false);
const password = ref("");
const passwordInputRef = ref(null); // 取得 input 的 ref
const togglePasswordVisibility = () => {
    isPasswordVisible.value = !isPasswordVisible.value;
};

const isPasswordVisibleCheck = ref(false);
const passwordCheck = ref("");
const passwordCheckInputRef = ref(null); // 取得 input 的 ref
const togglePasswordVisibilityCheck = () => {
    isPasswordVisibleCheck.value = !isPasswordVisibleCheck.value;
};

const errorMessages = ref({
    password: "",
    passwordCheck: "",
});

const validatePassword = () => {
    const passwordValue = password.value;
    errorMessages.value.password = "";

    // 檢查密碼長度
    if (passwordValue.length < 6) {
        errorMessages.value.password = "密碼至少需要 6 個字元";
        return;
    }
    // 檢查是否包含英文、數字和特殊字元
    if (
        !/[A-Za-z]/.test(passwordValue) ||
        !/[0-9]/.test(passwordValue) ||
        !/[!@#$%^&*]/.test(passwordValue)
    ) {
        errorMessages.value.password = "密碼須包含英文、數字和特殊字元 (!@#$%^&*)";
        return;
    }
};

const validatePasswordCheck = () => {
    errorMessages.value.passwordCheck = "";
    if (!passwordCheck.value) {
        errorMessages.value.passwordCheck = "確認密碼為必填項目";
        return;
    }
    if (password.value !== passwordCheck.value) {
        errorMessages.value.passwordCheck = "密碼與確認密碼不一致";
    }
};


const handleSubmit = async (e) => {
    e.preventDefault();
    // 直接呼叫驗證函式，使用最新的 v-model 值進行檢查
    validatePassword();
    validatePasswordCheck();

    // 等待下一個 DOM 更新循環，確保反應式狀態更新完成
    await nextTick();

    if (errorMessages.value.password || errorMessages.value.passwordCheck) {
        return;
    }
    try {
        const response = await axios.patch(`/UserNoAuth/user/verificationPassword/${token}`, null, {
            params: {
                password: password.value, // 發送新密碼
            },
        });

        if (response.status === 200) {
            isSubmissionSuccessful.value = true;
            Swal.fire({
                title: '修改成功！',
                text: '即將導向登入畫面',
                icon: 'success',
                timer: 1500, // 自動關閉時間，單位毫秒
                timerProgressBar: true, // 顯示進度條
                showConfirmButton: false, // 隱藏確認按鈕
            }).then(() => {
                // 按下確定後跳轉至登入頁面
                isSubmissionSuccessful.value = false;
                router.push('/home/userLogin'); // 假設登入頁路由為 "/login"
            });
        }
    } catch (error) {
        const errorMessage = error.response?.data || '更新失敗，請稍後再試。';
        Swal.fire('失敗', errorMessage, 'error');
        router.push('/home/userLogin');
    }

};
const edit = () => {
    password.value = 'aaa123@0';
    passwordCheck.value = 'aaa123@'
};
</script>

<template>
    <div class="container padding-bottom-3x mb-2 mt-2">
        <div class="row justify-content-center">
            <div class="col-lg-6 col-md-8">
                <form class="card mt-4 mb-4" @submit="handleSubmit">
                    <div class="card-header" style="">更改密碼</div>
                    <div class="card-body">
                        <div class="form-group">
                            <div class="input-group mt-3 mb-2">
                                <span class="input-group-text" id="inputGroup-sizing-default"><i
                                        class="mdi mdi-lock-reset mr-2"></i>更改密碼</span>
                                <input :type="isPasswordVisible ? 'text' : 'password'" class="form-control"
                                    v-model="password" @blur="validatePassword" ref="passwordInputRef"><span
                                    class="input-group-text" @click="togglePasswordVisibility" style="cursor: pointer">
                                    <i :class="isPasswordVisible ? 'mdi mdi-eye' : 'mdi mdi-eye-off'"></i></span>
                            </div>
                            <p v-if="errorMessages.password" class="text-danger error-placeholder mb-2">{{
                                errorMessages.password }}</p>
                            <div class="input-group mb-1">
                                <span class="input-group-text" id="inputGroup-sizing-default"><i
                                        class="mdi mdi-lock-check mr-2"></i>確認密碼
                                </span>
                                <input :type="isPasswordVisibleCheck ? 'text' : 'password'" class="form-control"
                                    v-model="passwordCheck" @blur="validatePasswordCheck" ref="passwordCheckInputRef">
                                <span class="input-group-text" @click="togglePasswordVisibilityCheck"
                                    style="cursor: pointer">
                                    <i :class="isPasswordVisibleCheck ? 'mdi mdi-eye' : 'mdi mdi-eye-off'"></i>
                                </span>
                            </div>
                            <p v-if="errorMessages.passwordCheck" class="text-danger error-placeholder mb-1">{{
                                errorMessages.passwordCheck }}
                            </p>
                        </div>
                    </div>
                    <div class="card-footer text-end">
                        <button class="btn btn-outline-secondary mr-3" @click="edit" type="button">一鍵輸入</button>
                        <button class="btn btn-outline-primary" type="submit">送出</button>
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
    /* border-radius: 22px; */
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

.card-header {
    text-align: center;
    font-weight: bold;
    font-size: large;
}

.input-group-text {
    padding: 0px 15px !important;
}

input {
    font-size: medium !important;
}

.error-placeholder {
    min-height: 20px;
    /* 為錯誤訊息區域設定固定高度 */
    margin: 0;
    font-size: 14px;
    line-height: 20px;
    /* 確保排版一致 */
}
</style>