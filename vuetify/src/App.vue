<template>
  <v-container fluid>
    <v-card>
      <results-table  />
    </v-card>
  </v-container>
</template>

<script>

import ResultsTable from './components/ResultsTable.vue'

export default {
  name: 'App',
  components: {
    ResultsTable
  }
}

</script>

<style>

  
</style>