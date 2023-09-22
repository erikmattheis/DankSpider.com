<template>
  <div class="spider-page2 page">
    <div class="stats">
      {{ numVarians }} variant{{ numVariants === 1 ? '' : 's' }} of {{ numProducts }} product{{ numProducts === 1 ? '' :
        's' }} from {{ numVandors }} vendor{{ numVendors === 1 ? '' : 's' }}
    </div>
    <div class="horizontal-cards">
      <template v-if="filteredProducts.length === 0">
        <p>No products found</p>
      </template>
      <template v-for="(product, i) in filteredProducts" :key="i">
        <ProductCard :product="product" />
      </template>
    </div>
  </div>
</template>

<script>
import { useSpiderStore } from '../store';

import ProductCard from './ProductCard.vue';

export default {
  name: 'SpiderPageCards',
  components: {
    ProductCard,
  },
  data() {
    return {
      store: null,
    }
  },
  created() {
    this.store = useSpiderStore();
  },
  computed: {
    filteredProducts() {
      return this.store.filteredProducts;
    },
    numVariants() {
      return this.store.numVariants;
    },
    numVendors() {
      return this.store.numVendors;
    },
  }
}
</script>

<style scoped>
.spider-page {}

.horizontal-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-left: -20px;
  margin-right: -20px;
}
</style>