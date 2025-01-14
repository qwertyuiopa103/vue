<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
// 匯入縣市、鄉鎮區資料
import locationsData from '@/data/locations.json'

// ----- 1. 定義「原始資料」和「表單資料」 -----
const originalUser = ref({
    id: '',
    name: '',
    email: '',
    phone: '',
    city: '',
    district: '',
    address: '',
    userPhoto: null
})

// 這個是前端用來綁定表單 v-model
const formData = ref({
    id: '',
    name: '',
    email: '',
    phone: '',
    city: '',
    district: '',
    address: '',
    userPhoto: null// base64 or null
})

const errors = ref({
    city: '',
    district: '',
    address: '',
});

const fileInput = ref(null);

// 從 JSON 取出城市陣列以及 districts 物件
const cities = locationsData.cities            // ["基隆市","臺北市","新北市",...]
const allDistricts = locationsData.districts   // { "基隆市":[...], "臺北市":[...], ... }

// 根據選擇的 city 動態產生鄉鎮區清單
const districtOptions = computed(() => {
    if (!formData.value.city) {
        return []
    }
    return allDistricts[formData.value.city] || []
})

watch(
    () => formData.value.city,
    (newCity, oldCity) => {
        if (newCity !== oldCity && !allDistricts[newCity]?.includes(formData.value.district)) {
            formData.value.district = ''; // 如果 district 不屬於新的 city 才清空
        }
    }
)

// 預設頭像（若後端沒回來或使用者尚未上傳，就顯示此圖）
const defaultImageUrl = '/user/img/user3.png'
const imageSrc = ref(defaultImageUrl)

// Token (假設在 localStorage)
const token = localStorage.getItem('token')

// 1. 進入頁面後，向後端取得使用者資料（含頭像）
async function fetchUserProfile() {
    try {
        const response = await axios.get('/user/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        if (response.status === 200) {
            const data = response.data
            // 將後端回傳資料存到 originalUser
            originalUser.value = { ...data }  // 複製一份

            // 再把它複製到 formData
            formData.value = { ...data }

            imageSrc.value = data.avatar
                ? data.avatar
                : defaultImageUrl
        }
    } catch (error) {
        console.error('取得使用者資訊失敗：', error)
    }
}

// 2. 上傳或更新頭像時，讀取 File 轉為 Base64 顯示
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

function resetForm() {
    // 將 originalUser 覆蓋回 formData
    formData.value = { ...originalUser.value }

    // 同時把頭像也改回原本
    if (originalUser.value.avatar) {
        imageSrc.value = originalUser.value.avatar
    } else {
        imageSrc.value = defaultImageUrl
    }
    if (fileInput.value) {
        fileInput.value.value = '';
    }
}

async function confirmAndUpdate() {
    // 先清空 errors
    errors.value = { city: '', district: '', address: '' };

    if (!formData.value.city) {
        errors.value.city = '請選擇縣市';
    }
    if (!formData.value.district) {
        errors.value.district = '請選擇鄉鎮區';
    }
    if (!formData.value.address.trim()) {
        errors.value.address = '請輸入詳細地址';
    }

    // 若有任何一欄有錯，就 return
    if (errors.value.city || errors.value.district || errors.value.address) {
        return;
    }

    const result = await Swal.fire({
        title: '確定要修改嗎？',
        text: '修改後無法恢復',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: '確定',
        cancelButtonText: '取消'
    })

    if (result.isConfirmed) {
        // user pressed OK, then run updateProfile
        updateProfile()
    }
}

// 3. 送出「修改」表單，呼叫後端更新使用者資料
async function updateProfile() {
    try {

        // 準備 FormData
        const formDataObj = new FormData();

        formDataObj.append('id', formData.value.id);
        formDataObj.append('name', formData.value.name);
        formDataObj.append('email', formData.value.email);
        formDataObj.append('phone', formData.value.phone);
        formDataObj.append('city', formData.value.city);
        formDataObj.append('district', formData.value.district);
        formDataObj.append('address', formData.value.address);

        // 處理檔案上傳
        const file = fileInput.value?.files?.[0];
        if (file) {
            formDataObj.append('userPhoto', file); // 確保和後端參數名稱一致
        } else {
            console.log('未選擇圖片');
        }


        const response = await axios.put('/user/update', formDataObj, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            }
        })

        if (response.status === 200) {
            Swal.fire({
                icon: 'success',
                title: '成功',
                text: '資料修改成功！',
                timer: 1500, // 自動關閉時間，單位毫秒
                timerProgressBar: true, // 顯示進度條
                showConfirmButton: false, // 隱藏確認按鈕
            }).then(() => {
                location.reload(); // 3 秒後刷新頁面
            });
        }
    } catch (error) {
        console.error('更新用戶資料失敗：', error)
        Swal.fire('失敗', '更新失敗，請稍後再試。', 'error');
    }
}

// 頁面載入後，嘗試撈取使用者資料 (若已登入)
onMounted(() => {
    if (token) {
        fetchUserProfile()
    }
})
</script>

<template>
    <div class="container-xl px-4 mt-4">
        <div class="row">
            <div class="col-xl-4">
                <!-- Profile picture card-->
                <div class="card mb-4 mb-xl-0">
                    <div class="card-header" style="text-align: center;font-weight: bold;">個人圖像</div>
                    <div class="card-body text-center">
                        <!-- Profile picture image-->
                        <img class="img-account-profile rounded-circle mb-2" :src="imageSrc" alt="">
                        <!-- Profile picture help block-->
                        <!-- <div class="small text-muted mt-4">選擇更新個人圖像</div> -->
                        <!-- Profile picture upload button-->
                        <div class="mb-3 mt-3">
                            <input type="file" class="form-control" aria-label="file example" @change="handleFileChange"
                                ref="fileInput">

                        </div>
                    </div>
                </div>
            </div>
            <div class="col-xl-8">
                <!-- Account details card-->
                <div class="card mb-4">
                    <div class="card-header">個人資料</div>
                    <div class="card-body">
                        <form @submit.prevent="updateProfile">
                            <!-- Form Group (username)-->
                            <div class="mb-3">
                                <label class="small mb-1">姓名</label>
                                <input class="readonly" type="text" v-model="formData.name" readonly>
                            </div>
                            <div class="mb-3">
                                <label class="small mb-1">電子信箱</label>
                                <input class="readonly" type="email" v-model="formData.email" readonly>
                            </div>
                            <div class="mb-3">
                                <label class="small mb-1">手機號碼</label>
                                <input class="readonly" type="text" v-model="formData.phone" readonly>
                            </div>
                            <!-- Form Row-->
                            <div class="row gx-3 mb-3">
                                <!-- Form Group (first name)-->
                                <div class="col-md-6">
                                    <label class="small mb-1" for="inputCity">縣市</label>
                                    <select id="inputCity" class="form-control" v-model="formData.city">
                                        <option value="" disabled>請選擇縣市</option>
                                        <option v-for="(city, idx) in cities" :key="idx" :value="city">
                                            {{ city }}
                                        </option>
                                    </select>
                                    <span v-if="errors.city" class="text-danger 
                                    ">{{ errors.city }}</span>
                                </div>
                                <!-- Form Group (last name)-->
                                <div class="col-md-6">
                                    <label class="small mb-1" for="inputDistrict">鄉鎮區</label>
                                    <select id="inputDistrict" class="form-control" v-model="formData.district">
                                        <option value="" disabled>請選擇鄉鎮區</option>
                                        <option v-for="(district, idx) in districtOptions" :key="idx" :value="district">
                                            {{ district }}
                                        </option>
                                    </select>
                                    <span v-if="errors.district" class="text-danger">{{
                                        errors.district }}</span>

                                </div>

                            </div>
                            <div class="mb-3">
                                <label class="small mb-1" for="inputAddress">詳細地址</label>
                                <input class="form-control" type="text" v-model="formData.address" id="inputAddress">
                                <span v-if="errors.address" class="text-danger">{{ errors.address }}</span>
                            </div>
                            <!-- Save changes button-->
                            <button class="btn btn-outline-success mr-5" type="reset"
                                @click.prevent="resetForm">重置</button>
                            <button class="btn btn-outline-danger" type="submit"
                                @click.prevent="confirmAndUpdate">修改</button>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="css" scoped>
body {
    margin-top: 20px;
    background-color: #f2f6fc;
    color: #69707a;
}

.img-account-profile {
    height: 10rem;
    border: 5px solid #c5ccd6;
}

.rounded-circle {
    border-radius: 50% !important;
}

.card {
    box-shadow: 0 0.15rem 1.75rem 0 rgb(33 40 50 / 15%);
}


.card-header:first-child {
    border-radius: 0.35rem 0.35rem 0 0;
}

.card-header {
    padding: 1rem 1.35rem;
    margin-bottom: 0;
    background-color: rgba(33, 40, 50, 0.03);
    border-bottom: 1px solid rgba(33, 40, 50, 0.125);
    text-align: center;
    font-weight: bold;
}

.form-control,
.dataTable-input {
    display: block;
    width: 100%;
    padding: 0.875rem 1.125rem;
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 1;
    color: #69707a;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #c5ccd6;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    border-radius: 0.35rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.readonly {
    display: block;
    width: 100%;
    padding: 0.875rem 1.125rem;
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 1;
    color: #69707a;
    background-color: #F0F0F0;

    border: 1px solid #c5ccd6;

    border-radius: 0.35rem;
}
</style>