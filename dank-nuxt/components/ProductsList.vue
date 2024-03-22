<template>
    <div>
        <v-card v-for="product in products"
          :key="product.name">
            <ProductCard :product="product" />
        </v-card>
    </div>
</template>

<script setup>
import { useProductStore } from '~/stores/products'

const store = useProductStore()
const products = store.filteredProducts

</script>
