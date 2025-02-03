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
        profileLoaded: false,  // 新增，表示用戶資料是否已載入
    }),
    actions: {
        async login(userId, token, userRole) {
            this.isAuthenticated = true;
            this.id = userId;
            this.token = token;
            this.role = userRole;
            console.log('Setting token:', token, 'and userId:', userId);
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('userId', userId);
            sessionStorage.setItem('userRole', userRole);
            await this.fetchUserProfile();
        },
        logout() {
            this.isAuthenticated = false;
            this.id = null;
            this.token = null;
            this.role = null;
            this.name = '';
            this.avatar = '';
            this.profileLoaded = false;
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('userId');
            sessionStorage.removeItem('userRole');

        },
        initialize() {
            const token = sessionStorage.getItem('token');
            const userId = sessionStorage.getItem('userId');
            const userRole = sessionStorage.getItem('userRole');
            const cachedName = sessionStorage.getItem('userName');
            const cachedAvatar = sessionStorage.getItem('userAvatar');
            if (token && userId) {
                this.isAuthenticated = true;
                this.token = token;
                this.id = userId;
                this.role = userRole;
                if (cachedName) {
                    this.name = cachedName;
                    this.profileLoaded = true; // 如果有快取資料，直接視為已載入
                }
                if (cachedAvatar) {
                    this.avatar = cachedAvatar;
                }
                // 後台仍可呼叫 fetchUserProfile() 來更新資料
                this.fetchUserProfile();
            }
        },
        getters: {
            isAdmin: (state) => state.role === 'ROLE_ADMIN',
            isCaregiver: (state) => state.role === 'ROLE_CAREGIVER',
            isUser: (state) => state.role === 'ROLE_USER',
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
                    this.profileLoaded = true;
                    sessionStorage.setItem('userName', this.name);
                    sessionStorage.setItem('userAvatar', this.avatar);
                }
            } catch (error) {
                console.error('抓取用戶資料失敗:', error);
            }
        },
    },
});