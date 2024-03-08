<template>
  <v-container>
    <RouterView />
  </v-container>
</template>

<script>

export default {
  name: 'App',
  components: {

  }
}

</script>

<style>
.v-enter-active,
.v-leave-active {
  transition: all 0.1s ease !important;
}

.v-enter, .v-leave-to {
  opacity: 0;
}
  
</style>