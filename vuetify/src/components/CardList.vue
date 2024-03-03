<template>
  <v-container class="fill-height">
    <v-responsive class="align-center text-center fill-height">
      <v-infinite-scroll :height="300"
                         :items="items"
                         :onLoad="load">

        <v-card v-for="(item, index) in items"
                :key="item" variant="tonal" href="item.url">
          <v-card-subtitle> {{ item.vendor }} </v-card-subtitle>
          <v-card-title> {{ item.title }} </v-card-title>
          <v-card-text>



          </v-card-text>
        </v-card>

      </v-infinite-scroll>
    </v-responsive>
  </v-container>v-container>
</template>

<script setup>
import { ref } from 'vue'

let items = ref([{ title: 'Item 1', vendor: 'Vendor 1'}, { title: 'Item 2', vendor: 'Vendor 2', }, { title: 'Item 3', vendor: 'Vendor 3', }, { title: 'Item 4', vendor: 'Vendor 4', }, { title: 'Item 5', vendor: 'Vendor 5', }, { title: 'Item 6', vendor: 'Vendor 6', }, { title: 'Item 7', vendor: 'Vendor 7', }, { title: 'Item 8', vendor: 'Vendor 8', }, { title: 'Item 9', vendor: 'Vendor 9', }, { title: 'Item 10', vendor: 'Vendor 10', },])
let loading = ref(false)

function load() {
  if (loading.value) return

  loading.value = true

  setTimeout(() => {
    items.value = items.value.concat(Array.from({ length: 10 }, (_, i) => items.value.length + i))
    loading.value = false
  }, 1000)
}
//
</script>
