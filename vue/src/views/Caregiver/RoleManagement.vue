<template>
    <v-container>
        <h2 class="mb-4">使用者權限管理</h2>

        <v-card>
            <v-card-title>
                <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    label="搜尋"
                    single-line
                    hide-details
                    density="compact"
                ></v-text-field>
            </v-card-title>

            <v-data-table
                :headers="headers"
                :items="users"
                :search="search"
                class="elevation-1"
            >
                <!-- 自訂欄位 -->
                <template v-slot:item.roles="{ item }">
                    <v-select
                        v-model="item.userRole"
                        :items="availableRoles"
                        density="compact"
                        @update:model-value="updateRole(item)"
                    ></v-select>
                </template>

                <template v-slot:item.caregiverNO="{ item }">
                    <span v-if="item.caregiverNO">{{ item.caregiverNO }}</span>
                    <span v-else class="text-grey">--</span>
                </template>
            </v-data-table>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '@/plugins/axios'
import Swal from 'sweetalert2'

const search = ref('')
const users = ref([])

const headers = [
    { title: '使用者ID', key: 'userID', align: 'start' },
    { title: '姓名', key: 'userName', align: 'start' },
    { title: '看護編號', key: 'caregiverNO', align: 'start' },
    { title: '角色', key: 'roles', align: 'start' },
]

const availableRoles = [
    { text: '一般用戶', value: 'ROLE_USER' },
    { text: '看護人員', value: 'ROLE_CAREGIVER' },
    { text: '管理員', value: 'ROLE_ADMIN' },
]

// 獲取所有使用者資料
const fetchUsers = async () => {
    try {
        const response = await axios.get('/UserAdmin/roles')
        if (response.status === 200) {
            users.value = response.data
        }
    } catch (error) {
        console.error('獲取用戶資料失敗:', error)
        Swal.fire('錯誤', '獲取用戶資料失敗', 'error')
    }
}

// 更新用戶角色
const updateRole = async (user) => {
    try {
        // 顯示確認對話框
        const result = await Swal.fire({
            title: '確認更改角色？',
            text: `確定要將 ${user.userName} 的角色更改為 ${user.userRole}？`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '確定',
            cancelButtonText: '取消'
        })

        if (result.isConfirmed) {
            const response = await axios.patch(
                `/UserAdmin/roles/${user.userID}`,
                { role: user.userRole }
            )

            if (response.status === 200) {
                Swal.fire('成功', '角色更新成功', 'success')
                await fetchUsers() // 重新載入資料
            }
        } else {
            // 如果取消，恢復原來的角色
            await fetchUsers()
        }
    } catch (error) {
        console.error('更新角色失敗:', error)
        Swal.fire('錯誤', '更新角色失敗', 'error')
        await fetchUsers() // 重新載入資料以恢復原始狀態
    }
}

// 在組件掛載時獲取資料
onMounted(() => {
    fetchUsers()
})
</script>

<style scoped>
.v-data-table {
    width: 100%;
}

.text-grey {
    color: #999;
}
</style>