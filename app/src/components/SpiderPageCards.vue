<template>
  <div class="page">
    <div class="horizontal-cards">
      <template v-for="(product, i) in filteredProducts" :key="i">
        <ProductCard2 :product="product" />
      </template>
    </div>
  </div>
</template>

<script>
import { useSpiderStore } from '../store';

import ProductCard2 from './ProductCard2.vue';

export default {
  name: 'SpiderPageCards',
  components: {
    ProductCard2,
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
    }
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