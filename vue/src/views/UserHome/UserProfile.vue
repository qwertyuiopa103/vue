<script setup>
import { ref, computed } from 'vue'
import locationsData from '@/data/locations.json'
// 預設的頭像路徑（若尚未上傳或圖片載入失敗時）
const defaultImageUrl = 'http://bootdey.com/img/Content/avatar/avatar1.png'

// 用於顯示圖片的 ref，預設先放入 defaultImageUrl
const imageSrc = ref(defaultImageUrl)

// 當使用者上傳檔案時
const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 建立 FileReader 讀取檔案
    const reader = new FileReader()
    reader.onload = (e) => {
        // 讀取成功後，更新 imageSrc
        imageSrc.value = e.target.result
    }
    reader.readAsDataURL(file)
}

// --- 以下為「縣市/鄉鎮區」相關邏輯 ---

// 從 JSON 取出城市陣列以及 districts 物件
// cities: ["基隆市","臺北市","新北市", ...]
const cities = locationsData.cities
// districts: { "基隆市":[...], "臺北市":[...], ... }
const allDistricts = locationsData.districts

// 透過 v-model 綁定使用者目前選擇的 city, district
const selectedCity = ref('')
const selectedDistrict = ref('')

// 根據選擇的 city 動態產生鄉鎮區清單
const districtOptions = computed(() => {
    if (!selectedCity.value) {
        return []
    }
    return allDistricts[selectedCity.value] || []
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
                            <input type="file" class="form-control" aria-label="file example"
                                @change="handleFileChange">

                        </div>
                    </div>
                </div>
            </div>
            <div class="col-xl-8">
                <!-- Account details card-->
                <div class="card mb-4">
                    <div class="card-header">個人資料</div>
                    <div class="card-body">
                        <form>
                            <!-- Form Group (username)-->
                            <div class="mb-3">
                                <label class="small mb-1">姓名</label>
                                <input class="form-control" type="text" value="">
                            </div>
                            <div class="mb-3">
                                <label class="small mb-1">電子信箱</label>
                                <input class="form-control" type="email" value="">
                            </div>
                            <div class="mb-3">
                                <label class="small mb-1">手機號碼</label>
                                <input class="form-control" type="text" value="">
                            </div>
                            <!-- Form Row-->
                            <div class="row gx-3 mb-3">
                                <!-- Form Group (first name)-->
                                <div class="col-md-6">
                                    <label class="small mb-1" for="inputCity">縣市</label>
                                    <select id="inputCity" class="form-control" v-model="selectedCity">
                                        <option value="" disabled>請選擇縣市</option>
                                        <option v-for="(city, idx) in cities" :key="idx" :value="city">
                                            {{ city }}
                                        </option>
                                    </select>
                                </div>
                                <!-- Form Group (last name)-->
                                <div class="col-md-6">
                                    <label class="small mb-1" for="inputDistrict">鄉鎮區</label>
                                    <select id="inputDistrict" class="form-control" v-model="selectedDistrict">
                                        <option value="" disabled>請選擇鄉鎮區</option>
                                        <option v-for="(district, idx) in districtOptions" :key="idx" :value="district">
                                            {{ district }}
                                        </option>
                                    </select>
                                </div>

                            </div>
                            <div class="mb-3">
                                <label class="small mb-1" for="inputAddress">詳細地址</label>
                                <input class="form-control" type="text" value="" id="inputAddress">
                            </div>
                            <!-- Save changes button-->
                            <button class="btn btn-outline-success mr-5" type="reset">重置</button>
                            <button class="btn btn-outline-danger" type="submit">修改</button>

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

.nav-borders .nav-link.active {
    color: #0061f2;
    border-bottom-color: #0061f2;
}

.nav-borders .nav-link {
    color: #69707a;
    border-bottom-width: 0.125rem;
    border-bottom-style: solid;
    border-bottom-color: transparent;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    padding-left: 0;
    padding-right: 0;
    margin-left: 1rem;
    margin-right: 1rem;
}
</style>