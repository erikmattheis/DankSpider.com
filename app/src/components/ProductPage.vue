<template>
  <div class="spider-page page">
    <ProductFilters class="spider-page-filters" />
    <ProductCards class="spider-page-cards" />
  </div>
</template>

<script>
import ProductFilters from './ProductFilters.vue';
import ProductCards from './ProductCards.vue';

export default {
  components: {
    ProductFilters,
    ProductCards,
  },
}
</script>

<style scoped>
.spider-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.spider-page-filters {
  position: sticky;
  top: 48px;
  padding-top: 21px;
  overflow-y: auto;
  z-index: 1;
}

.spider-page-cards {
  flex: 1;
  z-index: 0;
}
</style>