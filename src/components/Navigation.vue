<template>
  <ul class="nav">
    <li class="nav-item"><router-link to="/">Home</router-link></li>
    <li class="nav-item"><router-link to="/news">Products</router-link></li>
    <li class="nav-item"><router-link to="/strains">Strains</router-link></li>
  </ul>
</template>

<style scoped>
.nav {
  display: flex;
  align-items: center;
}

.nav-item {
  display: block;
  margin-bottom: 10px;
  margin-right: 5px;
  padding: 5px 10px;
  border-radius: 20px;
  background-color: #333;
  color: #ccc;
  font-weight: 500;
  font-size: 14px;
}

.nav-item span {
  white-space: nowrap;
}

a {
  color: inherit;
  text-decoration: none;
}
</style>