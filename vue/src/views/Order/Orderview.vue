<script setup>
import { ref, computed } from 'vue';
//表頭欄位定義
const allHeaders = [
    { text: '訂單編號', value: '' },
    { text: '使用者編號', value: '' },
    { text: '使用者姓名', value: '' },
    { text: '看護編號', value: '' },
    { text: '看護姓名', value: '' },
    { text: '建立日期', value: '' },
    { text: '開始日期', value: '' },
    { text: '結束日期', value: '' },
    { text: '', value: '' },
]..
</script>

<template>
    <v-container>
        <h2 align="center">後台訂單列表</h2>
        <v-data-table :headers="headers" :items="filteredOrders" :items-per-page="10" class="elevation-1">
            <!-- 工具列(搜尋、篩選) -->
            <template #top>
                <v-toolbar flat>
                    <v-toolbar-title>訂單管理</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-text-field v-model="search" label="搜尋訂單" append-icon="mdi-magnify" single-line clearable>
                    </v-text-field>
                </v-toolbar>
            </template>
            <!-- 自訂欄位展示 -->
            <template #item.userId="{ item }">
                <span>{{ item.userID }}</span>
            </template>

            <template #item.caregiverName="{ item }">
                <span>{{ item.caregiverName }}</span>
            </template>
            <!-- 狀態顯示格式 -->
            <template #item.status="{ item }">
                <v-chip :color="statusColor(item.status)" dark>
                    {{ item.status }}
                </v-chip>
            </template>
            <!-- 操作按鈕 -->
            <template #item.actions="{ item }">
                <v-btn small color="primary" @click="updateOrder" (item.orderId)>編輯</v-btn>
                <v-btn small color="error" @click="deleteOrder" (item.orderId)>刪除</v-btn>

            </template>
        </v-data-table>

    </v-container>
</template>

<style lang="css" scoped></style>