// src/plugins/axios.js
import axios from 'axios';
import Swal from 'sweetalert2';
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';
// 添加請求攔截器
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
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
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token 過期處理
            Swal.fire({
                title: '登入逾時',
                text: '您的登入已過期，請重新登入',
                icon: 'warning',
                confirmButtonText: '確定',
            }).then(() => {
                localStorage.removeItem('authToken'); // 清除 Token
                window.location.href = '/home'; // 導向登入頁
            });
        }
        return Promise.reject(error);
    }
);

export default axios;
