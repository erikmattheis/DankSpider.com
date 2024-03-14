<!-- +Page.vue -->
<template>
  <ProductsFilters @set-cannabinoid-order="setCannabinoidOrder" @set-terpene-order="setTerpeneOrder" :terpene-names="terpeneNames" :cannabinoid-names="cannabinoidNames"/>
  <ProductsList @set-terpene-names="setTerpeneNames" @set-cannabinoid-names="setCannabinoidNames" :cannabinoid-order="cannabinoidOrder" :terpene-order="terpeneOrder" :products="products"/>
</template>

<script>
import ProductsList from './ProductsList.vue';
import ProductsFilters from './ProductsFilters.vue';

export default {
  name: 'SortedProducts',
  components: {
    ProductsList,
    ProductsFilters,
  },
  data() {
    return {
      products: [],
      cannabinoidNames: [],
      cannabinoidOrder: [],
      terpeneNames: [],
      terpeneOrder: [],
    }
  },
  created() {
   // this.products = Object.keys(this);
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