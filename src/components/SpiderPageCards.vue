<template>
  <div class="spider-page2 page">
    <div class="stats">
      {{ numProducts }} product{{ numProducts === 1 ? '' :
        's' }} from {{ numVendors }} vendor{{ numVendors === 1 ? '' : 's' }}
    </div>
    <div class="horizontal-cards">
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
      store: null
    }
  },
  created() {
    this.store = useSpiderStore();
  },
  computed: {
    filteredProducts() {
      return this.store.filteredProducts;
    },
    numProducts() {
      return this.store.numProducts;
    },
    numVendors() {
      return this.store.numVendors;
    },
  }
}
</script>

<style scoped>
.horizontal-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-left: -20px;
  margin-right: -20px;
}
</style>