import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
    state: () => ({
        email: '', // 用戶的信箱
    }),
    actions: {
        setEmail(email) {
            this.email = email;
        },
        clearEmail() {
            this.email = '';
        },
    },
});
