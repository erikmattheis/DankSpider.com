<template>
  <v-container fluid>
    <RouterView />
  </v-container>
</template>

<script>

import ResultsTable from './components/ResultsTable.vue'
import CardList from './components/CardList.vue'

export default {
  name: 'App',
  components: {
    ResultsTable,
    CardList
  }
}

</script>

<style>

  
</style>