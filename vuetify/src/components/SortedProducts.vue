<template>
  <ProductFilters />
  <CardList @cannabinoid-order="cannabinoidOrder"/>
</template>

<script>

import CardList from './CardList.vue';
import ProductFilters from './ProductsFilter.vue';

export default {
  name: 'SortedProducts',
  data: () => ({
    cannabinoidOrder: [],
    terpeneOrder: [],
  }),
  components: {
    CardList,
    ProductFilters,
  },
  methods: {
    setCannabinoidOrder(cannabinoidOrder) {
      this.cannabinoidOrder = cannabinoidOrder;
    },
    setTerpeneOrder(terpeneOrder) {
      this.terpeneOrder = terpeneOrder;
    }
    // get the selected cannabinoid
    // get the selected terpene
  }

}

</script>

<style>

  
</style>