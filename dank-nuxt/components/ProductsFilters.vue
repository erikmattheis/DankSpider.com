<template>
    <v-form ref="form">
        <v-select :items="terpenes"
          v-model="selectedTerpene"
          label="Terpene">
        </v-select>
        <v-select :items="cannabinoids"
          v-model="selectedCannabinoid"
          label="Cannabinoid">
        </v-select>
    </v-form>
</template>

<script setup>

import { useProductStore } from '~/stores/products'

const store = useProductStore()
const terpenes = store.terpenes
const selectedTerpene = store.selectedTerpene
const cannabinoids = store.cannabinoids
const selectedCannabinoid = store.selectedCannabinoid


</script>