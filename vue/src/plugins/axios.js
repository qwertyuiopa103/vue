// src/plugins/axios.js
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VUE_API_BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// axios.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('authToken');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// axios.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     if (error.response.status === 401) {
//       // 未授權，可能需要重定向到登入頁面
//       // router.push('/login');
//     }
//     return Promise.reject(error);
//   }
// );

export default axios;
