<template>
  <v-app>
    <v-main>
      <router-view />
      <side-navigation/>
    </v-main>
  </v-app>
</template>

<script>
import SideNavigation from './components/SideNavigation.vue'
export default {
  components: {
    SideNavigation
  }
}
  //
</script>
