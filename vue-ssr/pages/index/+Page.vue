<template>
  <ProductFilters @set-cannabinoid-order="setCannabinoidOrder" @set-terpene-order="setTerpeneOrder" :terpene-names="terpeneNames" :cannabinoid-names="cannabinoidNames"/>
  <ProductsList @set-terpene-names="setTerpeneNames" @set-cannabinoid-names="setCannabinoidNames":cannabinoid-order="cannabinoidOrder" :terpene-order="terpeneOrder"/>
</template>

<script>
import ProductsList from './ProductsList.vue';
import ProductFilters from './ProductsFilter.vue';


export default {
  name: 'SortedProducts',
  data: () => ({
    items: [],
    cannabinoidNames: [],
    cannabinoidOrder: [],
    terpeneNames: [],
    terpeneOrder: [],
  }),
  components: {
    ProductsList,
    ProductFilters,
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
  }

}

</script>

<style>

  
</style>