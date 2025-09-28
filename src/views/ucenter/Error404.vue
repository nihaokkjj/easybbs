<script setup>

</script>

<template>
  <div class="body">
    <div class="error-content">
    <div class="info">404</div>
    <div class="home">
      <router-link to="/">首页</router-link>
    </div>
  </div>
  </div>
</template>

<style scoped>
.body {
  background-color: rgb(248, 247, 247);
  min-height: calc(100vh);
  .error-content {
    padding: 200px 0px;
    text-align: center;
    .info{
      font-size: 100px;
    }
    .home {
      font-size: 30px;
      color: rgb(91, 94, 97);
    }
}
}
</style>