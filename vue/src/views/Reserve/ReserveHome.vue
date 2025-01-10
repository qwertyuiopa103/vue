<template>
  <div class="service-query-container">
    <h2>服務查詢資料</h2>

    <form @submit.prevent="handleSubmit">
      <div>
        <label for="userId">輸入用戶編號：</label>
        <input type="text" id="userId" v-model="userId" placeholder="請輸入用戶編號" />
      </div>

      <div>
        <label for="caregiverId">輸入看護編號：</label>
        <input type="number" id="caregiverId" v-model="caregiverId" placeholder="請輸入看護編號" />
      </div>

      <div>
        <input type="submit" value="查詢" />
      </div>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userId: "",
      caregiverId: "",
    };
  },
  methods: {
    handleSubmit() {
      // 使用 Vue Router 的 $router.push 方法來進行跳轉並附加查詢參數
      this.$router.push({
        path: '/admin/reserve/search',
        query: {
          userId: this.userId,
          caregiverId: this.caregiverId,
        }
      });
    },
  },
};
</script>

<style scoped>
.service-query-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50px 20px;
  background-color: #ffffff;
}

h2 {
  font-size: 2rem;
  margin-bottom: 30px;
}

form {
  width: 100%;
  max-width: 600px;
  border: 1px solid #000;
  padding: 20px;
  margin-bottom: 20px;
}

div {
  margin-bottom: 15px;
}

label {
  font-size: 1rem;
  margin-bottom: 5px;
  color: #000;
}

input[type="number"] {
  width: 100%;
  padding: 8px;
  border: 1px solid #000;
}
input[type="text"] {
  width: 100%;
  padding: 8px;
  border: 1px solid #000;
}

input[type="submit"] {
  width: 100%;
  padding: 12px;
  border: 1px solid #000;
  background-color: transparent;
  cursor: pointer;
}

input[type="submit"]:hover {
  background-color: #f0f0f0;
}
</style>
