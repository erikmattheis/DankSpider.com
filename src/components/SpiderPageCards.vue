<template>
  <div class="spider-page page">
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
      console.log('SpiderPageCards filteredProducts', this.store.filteredProducts);
      return this.store.filteredProducts;
    },
  }
}
</script>

<style scoped>
.spider-page {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
}

ul {
  display: flex;
  flex-wrap: wrap;
  margin: 0;
}

ul li {
  display: block;
  font-weight: 500;
  margin-bottom: 10px;
  margin-right: 5px;
  padding: 5px 10px;
  border-radius: 20px;
  background-color: #333;
  color: #eee;
}

.horizontal-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-left: -20px;
  margin-right: -20px;
}
</style>