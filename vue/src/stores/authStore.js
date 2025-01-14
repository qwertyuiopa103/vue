// src/stores/authStore.js
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        isAuthenticated: false,
        id: null,
        token: null, // JWT Token
        role: null,
    }),
    actions: {
        login(userId, token, userRole) {
            this.isAuthenticated = true;
            this.id = userId;
            this.token = token;
            this.role = userRole;
            console.log('Setting token:', token, 'and userId:', userId);
            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId);
            localStorage.setItem('userRole', userRole);

        },
        logout() {
            this.isAuthenticated = false;
            this.id = null;
            this.token = null;
            this.role = null;
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
            }
        },
    },
});