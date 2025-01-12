import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/authStore';

// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap-icons/font/bootstrap-icons.css';

// 引入 AOS CSS
import 'aos/dist/aos.css';

// 引入 Swiper CSS
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// 引入 GLightbox CSS
import 'glightbox/dist/css/glightbox.min.css';

import '@/assets/Home/css/main.css';

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import zhHant from 'vuetify/lib/locale/zh-Hant'

import { Field, Form, ErrorMessage, defineRule, configure } from 'vee-validate';
import * as rules from '@vee-validate/rules';
import { localize } from '@vee-validate/i18n';
import zhTW from '@vee-validate/i18n/dist/locale/zh_TW.json';

import axios from './plugins/axios'; // 導入自定義配置的 Axios


import App from './App.vue'
import router from './router'

const app = createApp(App)

const vuetify = createVuetify({
    components,
    directives,
    locale: {
        locale: 'zh-Hant',
        messages: {
            'zh-Hant': zhHant,
        },
    },
})

// 註冊所有驗證規則
Object.keys(rules).forEach(ruleName => {
    if (typeof rules[ruleName] === 'function') {
        defineRule(ruleName, rules[ruleName]);
    }
});

// 設定語系和全域選項
configure({
    generateMessage: localize('zh_TW', zhTW), // 設定語系為繁體中文
    validateOnChange: false,  // 禁用輸入變更時的驗證
    validateOnBlur: true,     // 啟用失去焦點時的驗證
    validateOnInput: false,   // 禁用輸入時的驗證
    validateOnModelUpdate: false, // 禁用模型更新時的驗證
});

// 全域註冊 vee-validate 組件
app.component('Field', Field);
app.component('Form', Form);
app.component('ErrorMessage', ErrorMessage);

app.use(createPinia())
app.use(router)
const authStore = useAuthStore();
console.log('Before initialize:', localStorage.getItem('token'), localStorage.getItem('userId'));
authStore.initialize();
console.log('After initialize:', authStore.token, authStore.id);
app.use(vuetify)
app.config.globalProperties.$axios = axios;
app.mount('#app')
