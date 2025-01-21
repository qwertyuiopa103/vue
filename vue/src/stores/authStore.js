// src/stores/authStore.js
import { defineStore } from 'pinia';
import axios from 'axios';
export const useAuthStore = defineStore('auth', {
    state: () => ({
        isAuthenticated: false,
        id: null,
        token: null, // JWT Token
        role: null,
        name: '',          // 新增
        avatar: '',        // 新增
    }),
    actions: {
        async login(userId, token, userRole) {
            this.isAuthenticated = true;
            this.id = userId;
            this.token = token;
            this.role = userRole;
            console.log('Setting token:', token, 'and userId:', userId);
            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId);
            localStorage.setItem('userRole', userRole);
            await this.fetchUserProfile();
        },
        logout() {
            this.isAuthenticated = false;
            this.id = null;
            this.token = null;
            this.role = null;
            this.name = '';
            this.avatar = '';
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('userRole');
        },
        initialize() {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            const userRole = localStorage.getItem('userRole');
            if (token && userId) {
                this.isAuthenticated = true;
                this.token = token;
                this.id = userId;
                this.role = userRole;
                this.fetchUserProfile();
            }
        },

        async fetchUserProfile() {
            if (!this.token) {
                console.warn('無法加載用戶資料，因為 token 不存在');
                return;
            }

            try {
                const response = await axios.get('/user/profile', {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                });

                if (response.status === 200) {
                    const { name, avatar } = response.data;

                    // 更新用戶詳細資料
                    this.name = name || '用戶';
                    this.avatar = avatar || '/user/img/user3.png';

                    // console.log('用戶資料加載成功:', this.name, this.avatar);
                }
            } catch (error) {
                console.error('抓取用戶資料失敗:', error);
            }
        },
    },
});