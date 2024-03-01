<template>
  <v-container class="fill-height">
    <v-responsive class="align-center text-center fill-height">
      <v-infinite-scroll :height="300" :items="items" :onLoad="load">
        <template v-for="(item, index) in items" :key="item">

          >

          <v-card>
            <v-card-subtitle>
              {{ vendor }}
            <v-card-title>
              {{ item }}
            </v-card-title>
<v-template v-slot:default="{ item, index }">
  <v-card>
    <v-card-title>
      Item #{{ item }}
    </v-card-title>
    <v-card-text>
      This is the item #{{ item }}.
    </v-card-text>
  </v-card>

<div :class="['pa-2', index % 2 === 0 ? 'bg-grey-lighten-2' : '']">
            Item #{{ item }}
          </div>
  <v-card-actions>
    <v-btn>Click me</v-btn>
  </v-card-actions>
</v-card>
        </template>
      </v-infinite-scroll>
    </v-responsive>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'

let items = ref([])
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
