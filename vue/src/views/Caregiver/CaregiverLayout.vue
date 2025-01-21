<template>
    <VLayout>
        <!-- 側邊選單 -->
        <VNavigationDrawer v-model="drawer">
            <VList density="compact" nav>
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

        <!-- 頂部欄 -->
        <VAppBar border="b" class="ps-4" flat>
            <VAppBarNavIcon @click="drawer = !drawer" />
            <VAppBarTitle class="title">
                <RouterLink to="/caregiver">看護管理</RouterLink>
            </VAppBarTitle>

            <!-- 右側功能區 -->
            <template #append>
                <!-- 使用者資訊和選單 -->
            </template>
        </VAppBar>

        <VMain>
            <div class="pa-4">
                <router-view></router-view>
            </div>
        </VMain>
    </VLayout>
</template>

<script setup>
const drawer = ref(true);
const items = ref([
    {
        title: '個人資料',
        prependIcon: 'mdi-account',
        link: '/caregiver/profile',
    },
    {
        title: '預約管理',
        prependIcon: 'mdi-calendar',
        link: '/caregiver/schedule',
    },
    {
        title: '服務紀錄',
        prependIcon: 'mdi-history',
        link: '/caregiver/history',
    },
    // 其他選單項目
]);
</script>