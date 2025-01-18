// src/plugins/axios.js
import axios from 'axios';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
const router = useRouter();
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';
// 添加請求攔截器
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 添加回應攔截器
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const { status, config } = error.response;

            // 如果是 401 且不是登錄請求，處理 Token 過期
            if (status === 401 && config.url !== '/LoginController/login' && config.url !== '/LoginController/adminlogin') {
                Swal.fire({
                    title: '登入逾時',
                    text: '您的登入已過期，請重新登入',
                    icon: 'warning',
                    confirmButtonText: '確定',
                }).then(() => {
                    localStorage.removeItem('token'); // 清除 Token
                    router.push("/home"); // 導向登入頁
                });
            }
        }
        return Promise.reject(error);
    }
);
export default axios;
