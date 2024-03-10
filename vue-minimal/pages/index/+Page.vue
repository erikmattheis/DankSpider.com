<template>
  <ProductsFilters @set-cannabinoid-order="setCannabinoidOrder" @set-terpene-order="setTerpeneOrder" :terpene-names="terpeneNames"/>
  <ProductsList @set-terpene-names="setTerpeneNames" @set-cannabinoid-names="setCannabinoidNames":cannabinoid-order="cannabinoidOrder" :terpene-order="terpeneOrder"/>
</template>

<script>

import ProductsList from '../../components/ProductsList.vue';
import ProductsFilters from '../../components/ProductsFilter.vue';

export default {
  name: 'SortedProducts',
  data: () => ({
    cannabinoidOrder: [],
    terpeneOrder: [],
  }),
  components: {
    ProductsList,
    ProductsFilters,
  },
  methods: {
    setCannabinoidOrder(cannabinoidOrder) {
      console.log('out', cannabinoidOrder)
      this.cannabinoidOrder = cannabinoidOrder;
    },
    setTerpeneOrder(terpeneOrder) {
      this.terpeneOrder = terpeneOrder;
    },
    setCannabinoidNames(cannabinoidNames) {
      this.cannabinoidNames = cannabinoidNames;
    },
    setTerpeneNames(terpeneNames) {
      this.terpeneNames = terpeneNames;
    }
    // get the selected cannabinoid
    // get the selected terpene
  }

}

</script>

<style>

  
</style>