<template>
  <ProductFilters @set-cannabinoid-order="setCannabinoidOrder" @set-terpene-order="setTerpeneOrder"/>
  <CardList :cannabinoid-order="cannabinoidOrder" :terpene-order="terpeneOrder"/>
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
      console.log('out', cannabinoidOrder)
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