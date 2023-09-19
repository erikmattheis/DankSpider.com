<template>
  <ul class="nav">
    <li class="nav-item"><router-link class="shadowy-button" to="/">Available</router-link></li>
    <li class="nav-item"><router-link class="shadowy-button" to="/news">THCa vs THC</router-link></li>
    <!--<li class="nav-item"><router-link class="shadowy-button" to="/strains">Strains</router-link></li>-->
  </ul>
</template>

<style scoped>
.nav {
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-item {
  margin-bottom: 10px;
  margin-right: 5px;
  padding: 5px 10px;
  border-radius: 4px;
  /*
  background-color: #333;
  color: #ccc;
  */
  font-weight: 500;
  font-size: 14px;
}

.nav-item span {
  white-space: nowrap;
}

a {
  text-decoration: none;
}
</style>