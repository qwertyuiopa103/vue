<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

// 1. 取得路由參數
const route = useRoute()
const userId = route.params.id

// 2. 定義一個變數儲存使用者詳細資料
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
    userUpdated: '',
    userLockoutEnd: '',
    userFailedLoginAttempts: 0,
    userVerified: false,
    userActive: false
})

// 3. 在組件掛載時，去呼叫後端 API 取得資料
onMounted(async () => {
    try {
        const response = await fetch(`http://localhost:8080/api/user/${userId}`)
        // 假設後端回傳格式符合 JSON
        user.value = await response.json()
    } catch (error) {
        console.error('取得使用者資料失敗', error)
    }
})

const formatDate = (date) => {
    if (!date) return '尚未登入'
    const options = {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    }
    return new Date(date).toLocaleDateString('zh-TW', options)
}

</script>
<template>
    <v-container>
        <v-sheet class="mx-auto" max-width="1000">
            <v-form>
                <v-row>
                    <!-- 個人資料部分 -->
                    <v-col cols="12" md="6">
                        <fieldset>
                            <legend>個人資料</legend>
                            <v-text-field v-model="user.userID" label="編號" variant="outlined" class="custom-label"
                                readonly></v-text-field>
                            <v-text-field v-model="user.userName" label="姓名" variant="outlined" class="custom-label"
                                readonly></v-text-field>
                            <v-text-field v-model="user.userEmail" label="信箱" variant="outlined" class="custom-label"
                                readonly></v-text-field>
                            <v-text-field v-model="user.userPhone" label="手機" variant="outlined" class="custom-label"
                                readonly></v-text-field>
                            <v-text-field v-model="user.userCity" label="城市" variant="outlined" class="custom-label"
                                readonly></v-text-field>
                            <v-text-field v-model="user.userDistrict" label="鄉鎮區" variant="outlined"
                                class="custom-label" readonly></v-text-field>
                            <v-text-field v-model="user.userAddress" label="地址" variant="outlined" class="custom-label"
                                readonly></v-text-field>
                        </fieldset>
                    </v-col>
                    <v-col cols="12" md="6">
                        <fieldset>
                            <legend>系統資料</legend>
                            <v-text-field v-model="user.userCreat" label="創建時間" variant="outlined" class="custom-label"
                                readonly></v-text-field>
                            <v-text-field :value="user.userLogin ? user.userLogin : '尚未登入'" label="登入時間"
                                variant="outlined" class="custom-label" readonly></v-text-field>
                            <v-text-field v-model="user.userUpdated"
                                :value="user.userUpdated ? user.userUpdated : '尚未更新'" label="更新時間" variant="outlined"
                                class="custom-label" readonly></v-text-field>
                            <v-text-field v-model="user.userLockoutEnd"
                                :value="user.userLockoutEnd ? user.userLockoutEnd : '未被鎖定'" label="鎖定時間"
                                variant="outlined" class="custom-label" readonly></v-text-field>
                            <v-text-field v-model="user.userFailedLoginAttempts" label="錯誤次數" variant="outlined"
                                class="custom-label" readonly></v-text-field>
                            <v-text-field v-model="user.userVerified" :value="user.userVerified ? '已驗證' : '未驗證'"
                                label="驗證狀態" variant="outlined" class="custom-label" readonly></v-text-field>
                            <v-text-field v-model="user.userActive" :value="user.userActive ? '啟用' : '禁用'" label="啟用狀態"
                                variant="outlined" class="custom-label" readonly></v-text-field>
                        </fieldset>
                    </v-col>
                </v-row>
            </v-form>
        </v-sheet>
    </v-container>
</template>
<style scoped>
.custom-label ::v-deep input {
    font-size: 18px;
    color: #4caf50;
}

.custom-label ::v-deep .v-label {
    font-size: 18px;
    color: #4caf50;
    /* 設定標籤字體顏色為綠色 */
}

.custom-label ::v-deep .v-input__control .v-input__slot {
    color: #000;
    /* 設定輸入框內文字顏色為黑色 */
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
}
</style>