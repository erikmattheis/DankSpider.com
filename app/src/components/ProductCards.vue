<template>
  <div class="page">
    <!--
    missingTerps: {{ missingTerps.length }}<br>
    missingCanns: {{ missingCanns.length }}<br>
    missingBoth: {{ missingBoth.length }}<br>
    completeProducts: {{ completeProducts.length }}<br>
    -->
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
  name: 'ProductCards',
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
    missingTerps() {
      return this.store.filteredProducts.filter(product => !product.terpenes || product.terpenes.length === 0);
    },
    missingCanns() {
      return this.store.filteredProducts.filter(product => !product.cannabinoids || product.cannabinoids.length === 0);
    },
    missingBoth() {
      return this.store.filteredProducts.filter(product => (!product.terpenes || product.terpenes.length === 0) && (!product.cannabinoids || product.cannabinoids.length === 0));
    },
    completeProducts() {
      return this.store.filteredProducts.filter(product => product.terpenes && product.terpenes.length > 0 && product.cannabinoids && product.cannabinoids.length > 0);
    },
  }
}
</script>

<style scoped>
.horizontal-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

@media (min-width: 768px) {
  .horizontal-cards {
    margin-left: -20px;
    margin-right: -20px;
  }
}
</style>