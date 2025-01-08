<template>
    <form @submit.prevent="submit" class="ma-10">
        <v-text-field v-model="name" :error-messages="nameError" label="姓名" prepend-icon="mdi-account"
            variant="outlined" class="custom-label" autofocus></v-text-field>

        <v-text-field v-model="email" :error-messages="emailError" label="信箱" prepend-icon="mdi-mail" variant="outlined"
            class="custom-label"></v-text-field>

        <v-text-field v-model="password" :counter="6" :error-messages="passwordError" label="密碼" prepend-icon="mdi-lock"
            variant="outlined" class="custom-label" hint="密碼至少6個字，且須包含英文數字特殊字元!@#$%^&*"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" :type="showPassword ? 'text' : 'password'"
            @click:append="togglePasswordVisibility"></v-text-field>

        <v-text-field v-model="confirmPassword" :counter="6" :error-messages="confirmPasswordError" label="確認密碼"
            prepend-icon="mdi-lock-check" variant="outlined" class="custom-label" hint="請再次確認密碼"
            :append-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :type="showConfirmPassword ? 'text' : 'password'"
            @click:append="toggleConfirmPasswordVisibility"></v-text-field>

        <v-text-field v-model="phone" :counter="7" :error-messages="phoneError" label="手機" prepend-icon="mdi-phone-dial"
            variant="outlined" class="custom-label"></v-text-field>

        <v-autocomplete v-model="city" :error-messages="cityError" :items="cities" label="縣市"
            prepend-icon="mdi-city-variant" variant="outlined" class="custom-label"></v-autocomplete>

        <v-autocomplete v-model="district" :error-messages="districtError" :items="districts" label="鄉鎮區"
            prepend-icon="mdi-home-city" variant="outlined" class="custom-label"></v-autocomplete>

        <v-text-field v-model="address" :error-messages="addressError" label="詳細地址" prepend-icon="mdi-home"
            variant="outlined" class="custom-label"></v-text-field>

        <v-file-input v-model="avatar" label="個人圖像(非必填)" prepend-icon="mdi-camera" class="custom-label"
            variant="outlined" accept="image/*" :error-messages="avatarError"></v-file-input>

        <v-checkbox v-model="checkbox" :error-messages="checkboxError" label="接受條款" type="checkbox"
            value="1"></v-checkbox>

        <v-btn class="me-4" type="submit">
            submit
        </v-btn>

        <v-btn @click="handleReset">
            clear
        </v-btn>
    </form>
</template>
<script setup>
import { ref, watch } from 'vue'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import locations from '@/data/locations.json'
import axios from '@/plugins/axios'

const schema = yup.object({
    name: yup.string().required('姓名為必填項目'),
    email: yup
        .string()
        .required('信箱為必填項目')
        .email('信箱格式不正確')
        .test('unique-email', '信箱已被使用', async (value) => {
            if (!value) return false;
            try {
                const response = await axios.get('/userCheck/emailCheck', { params: { userEmail: value } });
                return !response.data;
            } catch (error) {
                return false;
            }
        }),
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
        .matches(/^\d{10,11}$/, '手機號碼格式不正確')
        .test('unique-phone', '手機已被使用', async (value) => {
            if (!value) return false;
            try {
                const response = await axios.get('/userCheck/phoneCheck', { params: { userPhone: value } });
                return !response.data;
            } catch (error) {
                return false;
            }
        }),
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
        .oneOf([true], '必須接受條款'),
})

// 初始化表單
const { handleSubmit, resetForm, errors, validateField, values } = useForm({
    validationSchema: schema, // 綁定 Yup 模式
    validateOnChange: false,  // 禁用 onChange 驗證
    validateOnBlur: true,     // 啟用 onBlur 驗證
});

// 定義每個表單欄位
const { value: name, errorMessage: nameError } = useField('name')
const { value: email, errorMessage: emailError } = useField('email')
const { value: password, errorMessage: passwordError } = useField('password')
const { value: confirmPassword, errorMessage: confirmPasswordError } = useField('confirmPassword')
const { value: phone, errorMessage: phoneError } = useField('phone')
const { value: city, errorMessage: cityError } = useField('city')
const { value: district, errorMessage: districtError } = useField('district')
const { value: address, errorMessage: addressError } = useField('address')
const { value: avatar, errorMessage: avatarError } = useField('avatar')
const { value: checkbox, errorMessage: checkboxError } = useField('checkbox')

// 控制密碼顯示/隱藏
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value
}

const toggleConfirmPasswordVisibility = () => {
    showConfirmPassword.value = !showConfirmPassword.value
}
const submit = handleSubmit(async (values) => {
    try {
        // 創建 FormData
        const formData = new FormData()
        formData.append('userName', values.name)
        formData.append('userEmail', values.email)
        formData.append('userPassword', values.password)
        formData.append('userPhone', values.phone)
        formData.append('userCity', values.city)
        formData.append('userDistrict', values.district)
        formData.append('userAddress', values.address)


        if (values.avatar) {
            formData.append('userPhoto', values.avatar)
        }

        // 發送資料到後端
        const response = await axios.post('http://localhost:8080/api/user/register', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })

        if (response.status === 200) {
            alert('提交成功！')
            resetForm()
        } else {
            alert(`提交失敗：${response.data}`)
        }
    } catch (error) {
        if (error.response && error.response.data) {
            alert(`提交失敗：${error.response.data}`)
        } else {
            console.error('提交失敗:', error)
            alert('提交失敗，請稍後再試。')
        }
    }
})

// 重置表單
const handleReset = () => {
    resetForm()
}

// 城市與鄉鎮區資料
const cities = ref(locations.cities); // 城市列表
const districts = ref([]); // 根據選擇的城市動態更新

// 動態監聽城市選擇，更新鄉鎮區
watch(city, (newCity) => {
    districts.value = locations.districts[newCity] || [];
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
</style>