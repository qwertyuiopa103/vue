<template>
    <v-container>
        <v-tabs v-model="tab" color="#8E8E8E" style="font-weight: bolder;">
            <v-tab value="1" class="mr-5">會員管理</v-tab>
            <v-tab value="2">會員分析</v-tab>
        </v-tabs>
        <v-tabs-window v-model="tab">
            <!-- 會員管理頁籤 -->
            <v-tabs-window-item value="1">
                <v-row class="mt-4">
                    <v-col cols="2" class="mr-3 ">
                        <v-select v-model="searchField" :items="searchFields" label="搜尋欄位" variant="outlined"
                            density="compact" single-line item-title="text" item-value="value"></v-select>
                    </v-col>
                    <v-col cols="0">
                        <v-text-field v-model="search" label="輸入關鍵字" prepend-inner-icon="mdi-magnify" variant="outlined"
                            hide-details single-line density="compact" clearable="ture"></v-text-field>
                    </v-col>
                </v-row>
                <v-data-table :headers="headers" :items="filteredUsers" item-key="userID" :loading="loading"
                    class="custom-label fixed-table" style="white-space: nowrap;">
                    <!-- 自訂頭貼欄位 -->
                    <template #item.avatar="{ item }">
                        <v-avatar>
                            <img :src="item.userPhoto || '/user/img/user3.png'" alt="Avatar"
                                style="width: 100%; height: auto; object-fit: cover;" />
                        </v-avatar>
                    </template>
                    <!-- 自訂啟用狀態欄位 -->
                    <template #item.userActive="{ item }">
                        <VSwitch v-model="item.userActive" @change="() => updateUserStatus(item)"
                            :label="item.userActive ? '啟用' : '停用'" hide-details inset />
                    </template>
                    <template #item.userDeleted="{ item }">
                        <span>{{ item.userDeleted }}</span>
                    </template>
                    <!-- 角色 -->
                    <template #item.userRole="{ item }">
                        <span>{{ item.userRoleDisplay }}</span>
                    </template>
                    <!-- 自訂詳細資料按鈕 -->
                    <template #item.details="{ item }">
                        <v-btn icon @click="goToDetails(item.userID)">
                            <v-icon>mdi-magnify</v-icon>
                        </v-btn>
                    </template>

                    <!-- 自訂修改按鈕 
            <template #item.edit="{ item }">
                <v-btn icon @click="editUser(item.userID)">
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>
            </template>-->

                    <!-- 自訂刪除按鈕 -->
                    <template #item.delete="{ item }">
                        <v-btn icon @click="deleteUser(item.userID)">
                            <v-icon>mdi-trash-can</v-icon>
                        </v-btn>
                    </template>
                </v-data-table>
            </v-tabs-window-item>
            <v-tabs-window-item value="2">
                <Chart class="mt-2"></Chart>
            </v-tabs-window-item>
        </v-tabs-window>
    </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { VSwitch, VBtn, VIcon, VContainer, VDataTable } from 'vuetify/components'
import axios from '@/plugins/axios';
import Chart from '@/components/User/chart.vue';
const router = useRouter()
const users = ref([])
const loading = ref(false)
const tab = ref(2)
const search = ref()
const searchField = ref('userID'); // 預設搜尋欄位
const searchFields = [
    { text: '編號', value: 'userID' },
    { text: '姓名', value: 'userName' },
    { text: '信箱', value: 'userEmail' },
    { text: '手機', value: 'userPhone' },
    { text: '角色', value: 'userRole' }
]; // 可供選擇的搜尋欄位/ 可供選擇的搜尋欄位
const headers = [
    { title: '頭貼', key: 'avatar', align: 'center', sortable: false, width: '50px ' },
    { title: '編號', key: 'userID', align: 'center', width: '80px ' },
    { title: '姓名', key: 'userName', width: '60px ' },
    { title: '信箱', key: 'userEmail', align: 'center', width: '200px ' },
    { title: '手機', key: 'userPhone', align: 'center', width: '100px ' },
    { title: '啟用狀態', key: 'userActive', align: 'center', width: '110px ' },
    { title: '刪除', key: 'userDeleted', width: '40px' },
    { title: '角色', key: 'userRole', align: 'center', width: '80px' },
    { title: '詳細資料', key: 'details', align: 'center', sortable: false, width: '60px' },
    // { title: '修改', key: 'edit', align: 'center', sortable: false },
    { title: '刪除', key: 'delete', align: 'center', sortable: false, width: '60px' },
]
const roleMap = {
    ROLE_ADMIN: '管理員',
    ROLE_USER: '使用者',
    //moderator: '版主',
};
// 取得用戶資料
const fetchUsers = async () => {
    loading.value = true
    try {
        const response = await axios.get('/UserAdmin/users');
        console.log('API 返回資料:', response.data);
        if (response.status === 200) {
            // users.value = response.data.filter(user => !user.userDeleted);
            users.value = response.data;
        } else {
            throw new Error('Failed to fetch users');
        }
    } catch (error) {
        console.error(error)
        Swal.fire('錯誤', '取得用戶資料失敗', 'error')
    } finally {
        loading.value = false
    }
}

// 更新用戶狀態
const updateUserStatus = async (user) => {
    try {
        const response = await axios.patch(`/UserAdmin/users/${user.userID}/status`, {
            userStatus: user.userActive ? 1 : 0,
        });
        if (response.status === 200) {
            Swal.fire('成功', '用戶狀態已更新', 'success');
        } else {
            throw new Error('Failed to update status');
        }
    } catch (error) {
        console.error(error)
        Swal.fire('錯誤', '更新用戶狀態失敗', 'error')
        // 如果更新失敗，將狀態還原
        user.userActive = !user.userActive
    }
}

// 跳轉到詳細資料頁面
const goToDetails = (userID) => {
    router.push(`/admin/userOne/${userID}`)
}

// 跳轉到編輯用戶頁面
// const editUser = (userID) => {
//     router.push(`/admin/user/edit/${userID}`)
// }

// 刪除用戶
const deleteUser = async (userID) => {
    const result = await Swal.fire({
        title: '確認刪除?',
        text: `您確定要刪除會員編號 ${userID} 嗎?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        cancelButtonText: '取消',
        confirmButtonText: '刪除',
    })

    if (result.isConfirmed) {
        try {
            const response = await axios.delete(`/UserAdmin/users/${userID}`);

            if (response.status === 200) {
                Swal.fire('已刪除!', `${userID} 已成功刪除。`, 'success');
                // 重新取得用戶資料
                await fetchUsers();
            } else {
                throw new Error('Failed to delete user');
            }
        } catch (error) {
            console.error(error)
            Swal.fire('錯誤', '刪除用戶失敗', 'error')
        }
    }
}
const filteredUsers = computed(() => {
    // 格式化用戶數據
    const formattedUsers = users.value.map(user => ({
        ...user,
        userRoleDisplay: roleMap[user.userRole] || '未知角色', // 格式化角色顯示名稱
        userDeleted: user.userDeleted ? '是' : '否',          // 格式化刪除狀態
    }));

    // 如果沒有搜尋條件，返回全部用戶
    if (!search.value || !searchField.value) {
        return formattedUsers;
    }

    // 根據搜尋條件進行篩選
    return formattedUsers.filter(user => {
        const fieldKey = searchField.value; // 搜尋欄位
        const fieldValue = fieldKey === 'userRole' ? user.userRoleDisplay : user[fieldKey]; // 使用顯示名稱

        if (!fieldValue) {
            return false;
        }

        return fieldValue.toString().toLowerCase().includes(search.value.toLowerCase());
    });
});

// 在組件掛載時取得用戶資料
onMounted(() => {
    fetchUsers()
})
</script>

<style scoped>
@import 'vuetify/styles';

/* .v-selection-control {
    padding-top: 20px;
} */
hr {
    margin: 0 !important;
}

.custom-label ::v-deep(.v-data-table__th) {
    background-color: #D0D0D0 !important;
    font-weight: bold;

}

::v-deep(.v-select) {
    font-size: larger;
}

.fixed-table ::v-deep table {
    table-layout: fixed !important;
    width: 100% !important;
    /* 確保表格寬度佔滿 */
}
</style>