<template>
    <div class="chat-wrapper" v-if="isAuthenticated">
        <!-- 客服圖示 -->
        <div class="chat-icon" @click="toggleChat">
            <img src="/user/img/technical-support.png" alt="客服圖示" />
        </div>

        <!-- 聊天視窗 (Bootstrap 模板) -->
        <div class="chat-window" v-if="isChatOpen">
            <div class="container">
                <div class="row bootstrap snippets bootdeys">

                    <!-- DIRECT CHAT WARNING -->
                    <div class="box box-warning direct-chat direct-chat-warning">
                        <div class="chat-header box-header with-border">
                            <h3 class="box-title"><i class="mdi mdi-face-agent mr-2 "
                                    style="font-size: 30px !important"></i>客服小幫手
                            </h3>

                            <div class="box-tools pull-right">
                                <button type="button" class="btn btn-box-tool ml-2" data-widget="remove"
                                    @click="toggleChat">
                                    <i class="fa fa-times"></i>
                                </button>
                            </div>
                        </div>
                        <!-- /.box-header -->

                        <div class="box-body">
                            <!-- 常見問題區塊 -->
                            <div class="common-questions mt-2">
                                <div>
                                    <button v-for="(question, idx) in commonQuestions" :key="idx"
                                        class="btn btn-secondary btn-sm m-1" @click="clickCommonQuestion(question)">
                                        {{ question }}
                                    </button>
                                    <button class="btn btn-warning btn-sm m-1" @click="edit" type="button">問題1</button>
                                    <button class="btn btn-warning btn-sm m-1" @click="edit2" type="button">問題2</button>
                                </div>
                            </div>

                            <div class="direct-chat-messages">
                                <!-- 動態迴圈顯示 messages -->
                                <div v-for="(msg, index) in messages" :key="index" class="direct-chat-msg"
                                    :class="{ right: msg.role === 'user' }">
                                    <div class="direct-chat-info clearfix">
                                        <!-- 左側顯示『您』，右側顯示『客服小幫手』 -->
                                        <!-- 客服名稱 (左) -->
                                        <span class="direct-chat-name mr-2" v-if="msg.role === 'assistant'">客服小幫手</span>
                                        <span class="direct-chat-timestamp" v-if="msg.role === 'assistant'">{{
                                            msg.timestamp }}</span>

                                        <!-- 使用者名稱 (右) -->
                                        <span class="direct-chat-name" v-if="msg.role === 'user'">您</span>
                                        <span class="direct-chat-timestamp ml-2" v-if="msg.role === 'user'">{{
                                            msg.timestamp
                                            }}</span>

                                    </div>
                                    <!-- /.direct-chat-info -->

                                    <!-- 大頭貼示意，可各自替換 -->
                                    <img v-if="msg.role === 'assistant'" class="direct-chat-img" :src="assistantAvatar"
                                        alt="客服圖像" />
                                    <div class="direct-chat-text" v-if="msg.isLoading">
                                        思考中...請稍後
                                    </div>
                                    <!-- 訊息文字 -->
                                    <div class="direct-chat-text" v-else style="white-space: pre-line;">
                                        {{ msg.content }}
                                    </div>
                                    <!-- /.direct-chat-text -->
                                </div>
                            </div>

                        </div>
                        <!-- /.box-body -->

                        <div class="box-footer">
                            <!-- 送出訊息 (防止預設 POST 行為改用Vue事件) -->
                            <form @submit.prevent="sendMessage">
                                <div class="input-group">
                                    <input type="text" name="message" placeholder="請輸入訊息" class="form-control"
                                        v-model.trim="userInput" />
                                    <span class="input-group-btn">
                                        <button type="submit" class="btn btn-warning btn-flat ml-2">發送</button>
                                    </span>
                                </div>
                            </form>
                        </div>
                        <!-- /.box-footer-->
                    </div>
                    <!--/.direct-chat -->

                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { watch, ref, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore';
const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);
const isLoading = ref(false)
// 是否顯示聊天視窗
const isChatOpen = ref(false)
// 使用者輸入
const userInput = ref('')
// 所有對話記錄
const edit = () => {
    userInput.value = '我家長輩生重病需要看護，地點在台北和新北';
    sendMessage();
};
const edit2 = () => {
    userInput.value = '我家長輩只需要基本照護，有推薦的嗎?';
    sendMessage();
};

const messages = ref([
    {
        role: 'assistant',
        content: '您好，我是AI客服機器人，有任何問題都可以詢問我呦 : )',
        timestamp: getFormattedTime()
    }
]);

// 1) 每次成功登入後，把 messages 清空或重設
watch(isAuthenticated, (newVal, oldVal) => {
    if (newVal && !oldVal) {
        // 代表從未登入 -> 已登入
        messages.value = [ // 重新給一筆歡迎訊息
            {
                role: 'assistant',
                content: '您好，我是AI客服機器人，有任何問題都可以詢問我呦 : )',
                timestamp: getFormattedTime()
            }
        ]
    }
});

const commonQuestions = ref([
    "成為看護",
    "付款方式",
    "服務地區"
]);

function clickCommonQuestion(question) {
    // 讓 userInput 帶入這個問題
    userInput.value = question;
    // 立刻呼叫 sendMessage()
    sendMessage();
}
// 可以自訂頭像
const assistantAvatar = '/user/img/technical-support.png'

/** 切換聊天視窗開關 */
function toggleChat() {
    isChatOpen.value = !isChatOpen.value
}

/** 取得當前 時:分 的格式，如 "09:05"、"14:28" */
function getFormattedTime() {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
}

/** 送出訊息給後端 */
async function sendMessage() {
    if (!userInput.value.trim()) return
    // 1️⃣ 先儲存使用者的輸入
    const messageText = userInput.value;

    // 2️⃣ 立即清空輸入框，避免延遲
    userInput.value = '';
    // 1) 先把使用者訊息加入 messages
    messages.value.push({
        role: 'user',
        content: messageText,
        timestamp: getFormattedTime()
    })

    isLoading.value = true;
    messages.value.push({
        role: 'assistant',
        content: '搜尋中...',
        timestamp: getFormattedTime(),
        isLoading: true // 標記這條訊息是「搜尋中」
    });

    try {
        // 2) 呼叫後端API, 依你的實際路徑 /api/userChat 或 /userChat 等
        const response = await axios.post('/userChat', {
            message: messageText,
        })

        // 4️⃣ 刪除「搜尋中...」訊息
        messages.value = messages.value.filter(msg => !msg.isLoading);
        // 3) 後端回覆 (FAQ or ChatGPT)，同樣帶上 timestamp
        const reply = response.data
        messages.value.push({
            role: 'assistant',
            content: reply,
            timestamp: getFormattedTime()
        })
    } catch (error) {
        console.error(error)
        // 如果 API 錯誤，也放一則訊息顯示給使用者
        messages.value.push({
            role: 'assistant',
            content: '很抱歉，目前服務無法使用。',
            timestamp: getFormattedTime()
        })
    } finally {
        isLoading.value = false;

    }
}
</script>

<style scoped>
.common-questions {
    padding-bottom: 5px;
}

.form-control {
    border-radius: 10px !important;
    /* 左側圓角 */
}


/* 固定在網頁右下角，可自行調整與「回到頂部」按鈕錯開的距離 */
.chat-wrapper {
    position: fixed;
    bottom: 90px;
    /* 略高一點，避免跟回到頂部重疊 */
    right: 20px;
    z-index: 2000;
    /* 確保在最上層可以被點擊 */
}

/* 客服圖示 */
.chat-icon {
    width: 80px;
    height: 80px;
    cursor: pointer;
}

.chat-icon img {
    width: 100%;
    height: 100%;
}

/* 聊天視窗 */
.chat-window {
    width: 500px;
    height: 500px;
    background: #fff;
    border: 1px solid #ccc;
    position: absolute;
    bottom: 0px;
    right: 90px;
    /* 讓內部容器都可以使用 Bootstrap grid，不再另外用 flex: column */
}

/* 其餘樣式直接引用原來模板的 .box, .direct-chat-* CSS */
.box {
    position: relative;
    border-radius: 3px;
    background: #ffffff;
    border-top: 3px solid #d2d6de;
    width: 100%;
    height: 0px !important;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}


.box.box-primary {
    border-top-color: #3c8dbc;
}

.box.box-info {
    border-top-color: #00c0ef;
}

.box.box-danger {
    border-top-color: #dd4b39;
}

.box.box-warning {
    border-top-color: #f39c12;
}

.box.box-success {
    border-top-color: #00a65a;
}

.box.box-default {
    border-top-color: #d2d6de;
}

.box.collapsed-box .box-body,
.box.collapsed-box .box-footer {
    display: none;
}

.box .nav-stacked>li {
    border-bottom: 1px solid #f4f4f4;
    margin: 0;
}

.box .nav-stacked>li:last-of-type {
    border-bottom: none;
}


.box .border-right {
    border-right: 1px solid #f4f4f4;
}

.box .border-left {
    border-left: 1px solid #f4f4f4;
}

.box.box-solid {
    border-top: 0;
}

.box.box-solid>.box-header .btn.btn-default {
    background: transparent;
}

.box.box-solid>.box-header .btn:hover,
.box.box-solid>.box-header a:hover {
    background: rgba(0, 0, 0, 0.1);
}

.box.box-solid.box-default {
    border: 1px solid #d2d6de;
}

.box.box-solid.box-default>.box-header {
    color: #444;
    background: #d2d6de;
    background-color: #d2d6de;
}

.box.box-solid.box-default>.box-header a,
.box.box-solid.box-default>.box-header .btn {
    color: #444;
}

.box.box-solid.box-primary {
    border: 1px solid #3c8dbc;
}

.box.box-solid.box-primary>.box-header {
    color: #fff;
    background: #3c8dbc;
    background-color: #3c8dbc;
}

.box.box-solid.box-primary>.box-header a,
.box.box-solid.box-primary>.box-header .btn {
    color: #fff;
}

.box.box-solid.box-info {
    border: 1px solid #00c0ef;
}

.box.box-solid.box-info>.box-header {
    color: #fff;
    background: #00c0ef;
    background-color: #00c0ef;
}

.box.box-solid.box-info>.box-header a,
.box.box-solid.box-info>.box-header .btn {
    color: #fff;
}

.box.box-solid.box-danger {
    border: 1px solid #dd4b39;
}

.box.box-solid.box-danger>.box-header {
    color: #fff;
    background: #dd4b39;
    background-color: #dd4b39;
}

.box.box-solid.box-danger>.box-header a,
.box.box-solid.box-danger>.box-header .btn {
    color: #fff;
}

.box.box-solid.box-warning {
    border: 1px solid #f39c12;
}

.box.box-solid.box-warning>.box-header {
    color: #fff;
    background: #f39c12;
    background-color: #f39c12;
}

.box.box-solid.box-warning>.box-header a,
.box.box-solid.box-warning>.box-header .btn {
    color: #fff;
}

.box.box-solid.box-success {
    border: 1px solid #00a65a;
}

.box.box-solid.box-success>.box-header {
    color: #fff;
    background: #00a65a;
    background-color: #00a65a;
}

.box.box-solid.box-success>.box-header a,
.box.box-solid.box-success>.box-header .btn {
    color: #fff;
}

.box.box-solid>.box-header>.box-tools .btn {
    border: 0;
    box-shadow: none;
}

.box.box-solid[class*='bg']>.box-header {
    color: #fff;
}

.box .box-group>.box {
    margin-bottom: 5px;
}

.box .knob-label {
    text-align: center;
    color: #333;
    font-weight: 100;
    font-size: 12px;
    margin-bottom: 0.3em;
}

.box>.overlay,
.overlay-wrapper>.overlay,
.box>.loading-img,
.overlay-wrapper>.loading-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%
}

.box .overlay,
.overlay-wrapper .overlay {
    z-index: 50;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 3px;
}

.box .overlay>.fa,
.overlay-wrapper .overlay>.fa {
    position: absolute;
    top: 50%;
    left: 50%;
    margin-left: -15px;
    margin-top: -15px;
    color: #000;
    font-size: 30px;
}

.box .overlay.dark,
.overlay-wrapper .overlay.dark {
    background: rgba(0, 0, 0, 0.5);
}

.box-header:before,
.box-body:before,
.box-footer:before,
.box-header:after,
.box-body:after,
.box-footer:after {
    content: " ";
    display: table;
}

.box-header:after,
.box-body:after,
.box-footer:after {
    clear: both;
}

.box-header {
    color: #444;
    display: block;
    padding: 10px;
    position: relative;
}

.box-header.with-border {
    border-bottom: 1px solid #f4f4f4;
}

.collapsed-box .box-header.with-border {
    border-bottom: none;
}

.box-header>.fa,
.box-header>.glyphicon,
.box-header>.ion,
.box-header .box-title {
    display: inline-block;
    font-size: 20px;
    font-weight: bold;
    margin: 0;
    line-height: 1;
}

.box-header>.fa,
.box-header>.glyphicon,
.box-header>.ion {
    margin-right: 5px;
}

.box-header>.box-tools {
    position: absolute;
    right: 10px;
    top: 5px;
}

.box-header>.box-tools [data-toggle="tooltip"] {
    position: relative;
}

.box-header>.box-tools.pull-right .dropdown-menu {
    right: 0;
    left: auto;
}

.btn-box-tool {
    padding: 5px;
    font-size: 18px;
    background: transparent;
    color: #97a0b3;
}

.open .btn-box-tool,
.btn-box-tool:hover {
    color: #606c84;
}

.btn-box-tool.btn:active {
    box-shadow: none;
}

.box-body {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-bottom-right-radius: 3px;
    border-bottom-left-radius: 3px;
    padding: 10px;
    height: 360px;
}

.no-header .box-body {
    border-top-right-radius: 3px;
    border-top-left-radius: 3px;
}

.box-body>.table {
    margin-bottom: 0;
}

.box-body .fc {
    margin-top: 5px;
}

.box-body .full-width-chart {
    margin: -19px;
}

.box-body.no-padding .full-width-chart {
    margin: -9px;
}

.box-body .box-pane {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 3px;
}

.box-body .box-pane-right {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-bottom-right-radius: 3px;
    border-bottom-left-radius: 0;
}

.box-footer {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-bottom-right-radius: 3px;
    border-bottom-left-radius: 3px;
    border-top: 1px solid #f4f4f4;
    padding: 10px;
    background-color: #fff;
}

.direct-chat .box-body {
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
    position: relative;
    /*overflow-x: hidden;*/
    padding: 0;
}

.direct-chat.chat-pane-open .direct-chat-contacts {
    -webkit-transform: translate(0, 0);
    -ms-transform: translate(0, 0);
    -o-transform: translate(0, 0);
    transform: translate(0, 0);
}

.direct-chat-messages {
    -webkit-transform: translate(0, 0);
    -ms-transform: translate(0, 0);
    -o-transform: translate(0, 0);
    transform: translate(0, 0);
    padding: 10px;
    height: 300px;
    overflow-x: hidden;
}

.direct-chat-msg,
.direct-chat-text {
    display: block;
}

.direct-chat-msg {
    margin-bottom: 10px;

}

.direct-chat-msg:before,
.direct-chat-msg:after {
    content: " ";
    display: table;
}

.direct-chat-msg:after {
    clear: both;
}

.direct-chat-messages,
.direct-chat-contacts {
    -webkit-transition: -webkit-transform .5s ease-in-out;
    -moz-transition: -moz-transform .5s ease-in-out;
    -o-transition: -o-transform .5s ease-in-out;
    transition: transform .5s ease-in-out;
}

.direct-chat-text {
    border-radius: 5px;
    position: relative;
    padding: 5px 10px;
    background: #d2d6de;
    border: 1px solid #d2d6de;
    margin: 5px 0 0 50px;
    color: #444;
}

.direct-chat-text:after,
.direct-chat-text:before {
    position: absolute;
    right: 100%;
    top: 15px;
    border: solid transparent;
    border-right-color: #d2d6de;
    content: ' ';
    height: 0;
    width: 0;
    pointer-events: none;
}

.direct-chat-text:after {
    border-width: 5px;
    margin-top: -5px;
}

.direct-chat-text:before {
    border-width: 6px;
    margin-top: -6px;
}

/* .right .direct-chat-text {
    margin-right: 50px;
    margin-left: 0;
} */

.right .direct-chat-text:after,
.right .direct-chat-text:before {
    right: auto;
    left: 100%;
    border-right-color: transparent;
    border-left-color: #d2d6de;
}

.direct-chat-img {
    border-radius: 50%;
    float: left;
    width: 40px;
    height: 40px;
}

.right .direct-chat-img {
    float: right;
}

.direct-chat-info {
    display: flex;
    /* justify-content: space-between; */
    align-items: center;
    font-size: 16px;
    margin-bottom: 5px;
}

/* 客服名稱與時間靠左 */
.direct-chat-msg .direct-chat-name {
    text-align: left;
    font-weight: bold;
}

.direct-chat-msg .direct-chat-timestamp {
    text-align: left;
    color: #999;
}

.direct-chat-msg.right .direct-chat-info {
    justify-content: flex-end;
}

.direct-chat-msg.right .direct-chat-name {
    text-align: right;
    margin-left: 8px;
    /* 讓名稱與時間不會太擠 */
}

.direct-chat-msg.right .direct-chat-timestamp {
    text-align: right;
}


.direct-chat-contacts-open .direct-chat-contacts {
    -webkit-transform: translate(0, 0);
    -ms-transform: translate(0, 0);
    -o-transform: translate(0, 0);
    transform: translate(0, 0);
}

.direct-chat-contacts {
    -webkit-transform: translate(101%, 0);
    -ms-transform: translate(101%, 0);
    -o-transform: translate(101%, 0);
    transform: translate(101%, 0);
    position: absolute;
    top: 0;
    bottom: 0;
    height: 250px;
    width: 100%;
    background: #222d32;
    color: #fff;
    overflow: auto;
}

.contacts-list>li {
    border-bottom: 1px solid rgba(0, 0, 0, 0.2);
    padding: 10px;
    margin: 0;
}

.contacts-list>li:before,
.contacts-list>li:after {
    content: " ";
    display: table;
}

.contacts-list>li:after {
    clear: both;
}

.contacts-list>li:last-of-type {
    border-bottom: none;
}

.contacts-list-img {
    border-radius: 50%;
    width: 40px;
    float: left;
}

.contacts-list-info {
    margin-left: 45px;
    color: #fff;
}

.contacts-list-name,
.contacts-list-status {
    display: block;
}

.contacts-list-name {
    font-weight: 600;
}

.contacts-list-status {
    font-size: 12px;
}

.contacts-list-date {
    color: #aaa;
    font-weight: normal;
}

.contacts-list-msg {
    color: #999;
}

.direct-chat-danger .right>.direct-chat-text {
    background: #dd4b39;
    border-color: #dd4b39;
    color: #fff;
}

.direct-chat-danger .right>.direct-chat-text:after,
.direct-chat-danger .right>.direct-chat-text:before {
    border-left-color: #dd4b39;
}

.direct-chat-primary .right>.direct-chat-text {
    background: #3c8dbc;
    border-color: #3c8dbc;
    color: #fff;
}

.direct-chat-primary .right>.direct-chat-text:after,
.direct-chat-primary .right>.direct-chat-text:before {
    border-left-color: #3c8dbc;
}

.direct-chat-warning .right>.direct-chat-text {
    background: #f39c12;
    border-color: #f39c12;
    color: #fff;
}

.direct-chat-warning .right>.direct-chat-text:after,
.direct-chat-warning .right>.direct-chat-text:before {
    border-left-color: #f39c12;
}

.direct-chat-info .right>.direct-chat-text {
    background: #00c0ef;
    border-color: #00c0ef;
    color: #fff;
}

.direct-chat-info .right>.direct-chat-text:after,
.direct-chat-info .right>.direct-chat-text:before {
    border-left-color: #00c0ef;
}

.direct-chat-success .right>.direct-chat-text {
    background: #00a65a;
    border-color: #00a65a;
    color: #fff;
}

.direct-chat-success .right>.direct-chat-text:after,
.direct-chat-success .right>.direct-chat-text:before {
    border-left-color: #00a65a;
}
</style>