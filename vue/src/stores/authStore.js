// src/stores/authStore.js
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        isAuthenticated: false,
        id: null,
        token: null, // JWT Token
    }),
    actions: {
        login(userId, token) {
            this.isAuthenticated = true;
            this.id = userId;
            this.token = token;
            console.log('Setting token:', token, 'and userId:', userId);
            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId);
        },
        logout() {
            this.isAuthenticated = false;
            this.id = null;
            this.token = null;
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
        },
        initialize() {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            if (token && userId) {
                this.isAuthenticated = true;
                this.token = token;
                this.id = userId;
            }
        },
    },
});