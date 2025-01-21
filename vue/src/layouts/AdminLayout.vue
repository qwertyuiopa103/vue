<template>
    <VLayout>
        <!-- 側邊抽屜 -->
        <VNavigationDrawer v-model="drawer">
            <VList density="compact" nav>
                <!-- 清單項目 -->
                <VListItem v-for="(item, index) in items" :key="index" :to="item.link" class="d-flex align-center ma-2">
                    <div class="d-flex justify-space-between align-center" style="width: 100%;">
                        <VIcon class="mr-5" style="font-size: 20px;">{{ item.prependIcon }}</VIcon>
                        <VListItemTitle style="font-size:20px;font-weight:bold;">
                            {{ item.title }}
                        </VListItemTitle>
                    </div>
                </VListItem>
            </VList>
        </VNavigationDrawer>

        <!-- 上方工具列 -->
        <VAppBar border="b" class="ps-4" flat>
            <!-- 小螢幕時出現的按鈕，用於切換抽屜 -->
            <VAppBarNavIcon icon="mdi-menu" @click="drawer = !drawer" />

            <VAppBarTitle class="title">
                <RouterLink to="/admin">後台管理</RouterLink>
            </VAppBarTitle>

            <!-- 右側功能按鈕 -->
            <template #append>
                <div class="mr-2" style="font-size: small;">歡迎，<strong>{{ username }}</strong></div>
                <VBtn class="text-none me-2" height="48" icon slim>
                    <VAvatar>
                        <img :src="avatarUrl || '/user/img/user3.png'" alt="Avatar"
                            style="width: 100%; height: auto; object-fit: cover;" />
                    </VAvatar>
                    <VMenu activator="parent">
                        <VList density="compact" nav>
                            <VListItem append-icon="mdi-home-account" link title="前台" @click.prevent="home" />
                            <VListItem append-icon="mdi-logout" link title="登出" @click.prevent="logout" />
                        </VList>
                    </VMenu>
                </VBtn>
            </template>
        </VAppBar>

        <VMain>
            <div class="pa-4">
                <!-- 路由顯示區 -->
                <router-view></router-view>
            </div>
        </VMain>
    </VLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '@/plugins/axios';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
const router = useRouter();
const authStore = useAuthStore();
const avatarUrl = ref(null);
const username = ref(null);
const drawer = ref(true)
const items = ref([
    {
        title: '會員管理',
        prependIcon: 'mdi-account',
        link: '/admin/user',
    },
    {
        title: '看護管理',
        prependIcon: 'mdi-doctor',
        link: '/admin/caregiver',
    },
    {
        title: '預約管理',
        prependIcon: 'mdi-calendar',
        link: '/admin/reserve/search',
    },
    {
        title: '訂單管理',
        prependIcon: 'mdi-text-box-edit-outline',
        link: '/admin/orderView',
    },
    {
        title: '活動管理',
        prependIcon: 'mdi-palette',
        link: '/admin/event/detail',
    },
])
const fetchUserAvatar = async () => {

    try {
        const response = await axios.get('/UserAdmin/users/avatar');
        if (response.status === 200) {
            const { avatar, name } = response.data;
            username.value = name;
            if (avatar) {
                // 假設 avatar 是 Base64 編碼的圖片數據
                avatarUrl.value = avatar;
            }// 设置头像
        }
    } catch (error) {
        console.error('获取用户头像失败:', error);
    }
};

// 组件挂载时请求头像
onMounted(() => {
    fetchUserAvatar();
});
const logout = () => {
    authStore.logout();
    // 如果需要重定向到登錄頁面，可以在此處添加：
    router.push("/adminlogin")
};

const home = () => {
    router.push("/home")
}
</script>
<style scoped>
a {
    font-weight: bold;
    text-decoration: none !important;
    color: #000;
}
</style>