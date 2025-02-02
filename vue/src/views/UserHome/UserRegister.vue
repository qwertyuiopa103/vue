<template>
    <v-container class="d-flex align-center justify-center">
        <form @submit.prevent="submit" style="width: 2500px;">
            <fieldset>
                <legend>註冊會員</legend>
                <v-row no-gutters>
                    <v-col class="pa-2 ma-2">
                        <v-text-field v-model="name" :error="nameMeta.touched && !!nameError"
                            :error-messages="nameMeta.touched ? nameError : []" label="姓名" prepend-icon="mdi-account"
                            variant="outlined" class="custom-label" autofocus @blur="nameBlur"></v-text-field>

                        <v-text-field v-model="email" :error="emailMeta.touched && (!!emailError || !!emailErrorCustom)"
                            :error-messages="emailMeta.touched
                                ? [emailError, emailErrorCustom].filter(Boolean)
                                : []
                                " label="信箱" prepend-icon="mdi-mail" variant="outlined" class="custom-label"
                            :readonly="isOAuth" @blur="emailBlurHandler"></v-text-field>

                        <v-text-field v-model="password" :error="passwordMeta.touched && !!passwordError"
                            :error-messages="passwordMeta.touched ? passwordError : []" label="密碼"
                            prepend-icon="mdi-lock" variant="outlined" class="custom-label"
                            hint="密碼至少6個字，且須包含英文數字特殊字元!@#$%^&*" :append-inner-icon="visible ? 'mdi-eye' : 'mdi-eye-off'"
                            :type="visible ? 'text' : 'password'" @click:append-inner="togglePasswordVisibility"
                            @blur="passwordBlur"></v-text-field>

                        <v-text-field v-model="confirmPassword"
                            :error="confirmPasswordMeta.touched && !!confirmPasswordError"
                            :error-messages="confirmPasswordMeta.touched ? confirmPasswordError : []" label="確認密碼"
                            prepend-icon="mdi-lock-check" variant="outlined" class="custom-label" hint="請再次確認密碼"
                            :append-inner-icon="visible2 ? 'mdi-eye' : 'mdi-eye-off'"
                            :type="visible2 ? 'text' : 'password'" @click:append-inner="togglePasswordVisibility2"
                            @blur="confirmPasswordBlur"></v-text-field>
                    </v-col>
                    <v-col class="pa-2 ma-2">
                        <v-text-field v-model="phone" :counter="10"
                            :error="phoneMeta.touched && (!!phoneError || !!phoneErrorCustom)" :error-messages="phoneMeta.touched
                                ? [phoneError, phoneErrorCustom].filter(Boolean)
                                : []" label=" 手機" prepend-icon="mdi-phone-dial" variant="outlined" class="custom-label"
                            @blur="phoneBlurHandler"></v-text-field>

                        <v-autocomplete v-model="city" :error-messages="cityError" :items="cities" label="縣市"
                            prepend-icon="mdi-city-variant" variant="outlined" class="custom-label"></v-autocomplete>

                        <v-autocomplete v-model="district" :error-messages="districtError" :items="districts"
                            label="鄉鎮區" prepend-icon="mdi-home-city" variant="outlined"
                            class="custom-label"></v-autocomplete>

                        <v-text-field v-model="address" :error="addressMeta.touched && !!addressError"
                            :error-messages="addressMeta.touched ? addressError : []" label="詳細地址"
                            prepend-icon="mdi-home" variant="outlined" class="custom-label"
                            @blur="addressBlur"></v-text-field>
                    </v-col>
                    <v-col class="pa-2 ma-2">
                        <v-img class="mb-8 mx-auto circular-image" :width="180" :height="180" cover
                            :src="imageSrc"></v-img>
                        <v-file-input v-model="avatar" label="個人圖像(非必填)" prepend-icon="mdi-camera" class="custom-label"
                            variant="outlined" accept="image/*" :error-messages="avatarError"
                            @change="handleFileChange"></v-file-input>

                        <v-checkbox v-model="checkbox" :error-messages="checkboxError" label="接受條款" type="checkbox"
                            value="1" class=""></v-checkbox>
                        <div class=" text-end mb-3">
                            <v-btn prepend-icon="mdi-draw-pen" class="mr-5" @click="edit">
                                一鍵輸入
                            </v-btn>
                            <v-btn prepend-icon="mdi-google" @click="google">
                                第三方
                            </v-btn>
                        </div>
                        <div class=" text-end">
                            <v-btn @click="handleReset" class="me-3" prepend-icon="mdi-cached">
                                重置
                            </v-btn>
                            <v-btn type="submit" prepend-icon="mdi-check-circle" :disabled="loading">
                                <span v-if="loading">處理中...</span>
                                <span v-else>註冊</span>
                            </v-btn>

                        </div>
                    </v-col>
                </v-row>
            </fieldset>
        </form>
    </v-container>
</template>
<script setup>
import Swal from 'sweetalert2'
import { ref, watch, onMounted } from 'vue'
import { useForm, useField, } from 'vee-validate'
import * as yup from 'yup'
import locations from '@/data/locations.json'
import axios from '@/plugins/axios'
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';
const isOAuth = ref(false)
const userStore = useUserStore();
const router = useRouter();
const defaultImageUrl = '/user/img/user3.png'
const imageSrc = ref(defaultImageUrl)
const loading = ref(false);
const schema = yup.object({
    name: yup.string().required('姓名為必填項目'),
    email: yup
        .string()
        .required('信箱為必填項目')
        .email('信箱格式不正確'),
    // .test('unique-email', '信箱已被使用', async (value) => {
    //     if (!value) return false;
    //     try {
    //         const response = await axios.get('/UserNoAuth/user/emailCheck', { params: { userEmail: value } });
    //         return !response.data;
    //     } catch (error) {
    //         return false;
    //     }
    // }),
    password: yup
        .string()
        .required('密碼為必填項目')
        .min(6, '密碼至少6個字')
        .matches(
            /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).+$/,
            '密碼須包含英文、數字和特殊字元 !@#$%^&*'
        ),
    confirmPassword: yup
        .string()
        .required('確認密碼為必填項目')
        .oneOf([yup.ref('password')], '確認密碼必須與密碼相同'),
    phone: yup
        .string()
        .required('手機為必填項目')
        .matches(/^\d{10,11}$/, '手機號碼格式不正確'),
    // .test('unique-phone', '手機已被使用', async (value) => {
    //     if (!value) return false;
    //     try {
    //         const response = await axios.get('/UserNoAuth/user/phoneCheck', { params: { userPhone: value } });
    //         return !response.data;
    //     } catch (error) {
    //         return false;
    //     }
    // }),
    city: yup.string().required('縣市為必填項目'),
    district: yup.string().required('鄉鎮區為必填項目'),
    address: yup.string().required('詳細地址為必填項目'),
    avatar: yup
        .mixed()
        .nullable()
        .test('fileType', '只允許圖片檔案', (value) => {
            if (!value) return true
            return ['image/jpeg', 'image/png', 'image/gif'].includes(value.type)
        }),
    checkbox: yup
        .boolean()
        .required('必須接受條款')
        .oneOf([true], '必須接受條款'),
})

// 初始化表單
const { handleSubmit, resetForm, errors, validateField, values } = useForm({
    validationSchema: schema, // 綁定 Yup 模式
    validateOnChange: false,  // 禁用 onChange 驗證
    validateOnBlur: true,     // 啟用 onBlur 驗證
});

// 定義每個表單欄位
const { value: name, errorMessage: nameError, handleBlur: nameBlur, meta: nameMeta } = useField('name')
const { value: email, errorMessage: emailError, handleBlur: emailBlur, meta: emailMeta } = useField('email')
const { value: password, errorMessage: passwordError, handleBlur: passwordBlur, meta: passwordMeta } = useField('password')
const { value: confirmPassword, errorMessage: confirmPasswordError, handleBlur: confirmPasswordBlur, meta: confirmPasswordMeta } = useField('confirmPassword')
const { value: phone, errorMessage: phoneError, handleBlur: phoneBlur, meta: phoneMeta } = useField('phone')
const { value: city, errorMessage: cityError } = useField('city')
const { value: district, errorMessage: districtError } = useField('district')
const { value: address, errorMessage: addressError, handleBlur: addressBlur, meta: addressMeta } = useField('address')
const { value: avatar, errorMessage: avatarError } = useField('avatar')
const { value: checkbox, errorMessage: checkboxError } = useField('checkbox')

const emailErrorCustom = ref('');
// 自訂 email 失焦事件
const emailBlurHandler = async (event) => {
    // 1. 先執行 vee-validate 的失焦驗證（必填、格式）
    emailBlur(event)

    // 2. 驗證本地規則是否通過
    const result = await validateField('email')
    if (!result.valid) {
        // 如果本地驗證不通過，直接 return
        return
    }

    // 3. 若本地通過，再發送後端查詢唯一性
    try {
        const response = await axios.get('/UserNoAuth/user/emailCheck', {
            params: { userEmail: email.value }
        })
        if (response.data === true) {
            emailErrorCustom.value = '信箱已被使用';
        } else {
            emailErrorCustom.value = '';
        }
    } catch (error) {
        console.error('查詢信箱失敗', error);
        emailErrorCustom.value = '伺服器錯誤，請稍後再試';
    }
};

const phoneErrorCustom = ref('');
// 自訂 email 失焦事件
const phoneBlurHandler = async (event) => {
    // 1. 先執行 vee-validate 的失焦驗證（必填、格式）
    phoneBlur(event)

    // 2. 驗證本地規則是否通過
    const result = await validateField('phone')
    if (!result.valid) {
        // 如果本地驗證不通過，直接 return
        return
    }

    // 3. 若本地通過，再發送後端查詢唯一性
    try {
        const response = await axios.get('/UserNoAuth/user/phoneCheck', {
            params: { userPhone: phone.value }
        })
        if (response.data === true) {
            phoneErrorCustom.value = '手機已被使用';
        } else {
            phoneErrorCustom.value = '';
        }
    } catch (error) {
        console.error('查詢手機失敗', error);
        phoneErrorCustom.value = '伺服器錯誤，請稍後再試';
    }
};



const visible = ref(false);

const togglePasswordVisibility = () => {
    visible.value = !visible.value;
};

const visible2 = ref(false);

const togglePasswordVisibility2 = () => {
    visible2.value = !visible2.value;
};
const submit = handleSubmit(async (values) => {
    try {
        loading.value = true;
        // 創建 FormData
        const formData = new FormData()
        formData.append('userName', values.name)
        formData.append('userEmail', values.email)
        formData.append('userPassword', values.password)
        formData.append('userPhone', values.phone)
        formData.append('userCity', values.city)
        formData.append('userDistrict', values.district)
        formData.append('userAddress', values.address)
        formData.append('isOAuth', isOAuth.value)

        if (values.avatar) {
            formData.append('userPhoto', values.avatar)
        }

        // 發送資料到後端
        const response = await axios.post('/UserNoAuth/user/register', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })

        if (response.status === 200) {
            if (isOAuth.value) {
                router.push('/home/userLogin')
            } else {
                router.push({ name: 'userMail_view' });
                userStore.setEmail(values.email);
            }
        } else {
            alert(`提交失敗：${response.data}`)
            loading.value = false;
        }
    } catch (error) {
        if (error.response && error.response.data) {
            alert(`提交失敗：${error.response.data}`)
        } else {
            console.error('提交失敗:', error)
            alert('提交失敗，請稍後再試。')
        }
        loading.value = false;
    }
})

// 重置表單
const handleReset = () => {
    imageSrc.value = defaultImageUrl;
    resetForm()
}

// 城市與鄉鎮區資料
const cities = ref(locations.cities); // 城市列表
const districts = ref([]); // 根據選擇的城市動態更新

// 動態監聽城市選擇，更新鄉鎮區
watch(city, (newCity) => {
    districts.value = locations.districts[newCity] || [];
});


// 上傳或更新頭像時，讀取 File 轉為 Base64 顯示
function handleFileChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    console.log('選擇的檔案：', file);
    const reader = new FileReader()
    reader.onload = (e) => {
        // e.target.result 就是 Base64 (dataURL 格式)
        imageSrc.value = e.target.result
    }
    reader.readAsDataURL(file)
}
const edit = () => {
    name.value = '周杰倫';
    email.value = 'qwertyuiopa106@gmail.com';
    password.value = 'aaa123@';
    confirmPassword.value = 'aaa123@';
    phone.value = '0912345678';
    city.value = '桃園市';
    district.value = '中壢區';
    address.value = '新生路二段421號';
    checkbox.value = "1";
};
const google = () => {
    password.value = 'aaa123@';
    confirmPassword.value = 'aaa123@';
    phone.value = '0987654321';
    city.value = '臺北市';
    district.value = '信義區';
    address.value = '信義路五段7號89樓';
    checkbox.value = "1";
};
onMounted(() => {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const paramName = decodeURIComponent(urlParams.get('name') || '');
    const paramEmail = decodeURIComponent(urlParams.get('email') || '');

    if (paramName) name.value = paramName;
    if (paramEmail) email.value = paramEmail;

    if (paramName || paramEmail) {
        isOAuth.value = true; // 標記是第三方登入流程
    }
});
</script>

<style scoped>
.custom-label ::v-deep .v-label {
    font-size: 18px;
    /*color: #4caf50;
     設定標籤字體顏色為綠色 */
}

.custom-label {
    margin-bottom: 20px;
}

fieldset {
    border: 2px solid #ccc;
    padding: 20px;
    border-radius: 8px;
}

legend {
    width: auto;
    padding: 0 10px;
    font-size: 22px;
    font-weight: bold;
    text-align: center;
    float: none !important;
}

.circular-image {
    border-radius: 50%;
    /* 圓形 */
    overflow: hidden;
    /* 確保超出範圍的內容被裁剪 */
    border: 5px solid #c5ccd6;
}
</style>