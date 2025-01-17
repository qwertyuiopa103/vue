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

            <VAppBarTitle style="font-weight:bold;">後台管理</VAppBarTitle>

            <!-- 右側功能按鈕 -->
            <template #append>
                <VBtn class="text-none me-2" height="48" icon slim>
                    <VAvatar color="surface-light" image="https://cdn.vuetifyjs.com/images/john.png" size="32" />
                    <VMenu activator="parent">
                        <VList density="compact" nav>
                            <VListItem append-icon="mdi-cog-outline" link title="Settings" />
                            <VListItem append-icon="mdi-logout" link title="Logout" />
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
import { ref } from 'vue'

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
        link: '/admin/test',
    },
    {
        title: '預約管理',
        prependIcon: 'mdi-calendar',
        link: '/admin/reserve',
    },
    {
        title: '訂單管理',
        prependIcon: 'mdi-text-box-edit-outline',
        link: true,
    },
    {
        title: '活動管理',
        prependIcon: 'mdi-palette',
        link: true,
    },
])
</script>
<style scoped></style>