<!-- +Page.vue -->
<template>
  <div>
  <a @click="TrackEvent('ok')">Click me</a>
  <ProductsFilters @set-cannabinoid-order="setCannabinoidOrder" @set-terpene-order="setTerpeneOrder" :terpene-names="terpeneNames" :cannabinoid-names="cannabinoidNames"/>
  <ProductsList @set-terpene-names="setTerpeneNames" @set-cannabinoid-names="setCannabinoidNames" :cannabinoid-order="cannabinoidOrder" :terpene-order="terpeneOrder" :products="products"/>
</div>
</template>

<script>
import ProductsFilters from './ProductsFilters.vue';
import ProductsList from './ProductsList.vue';

export default {
  name: 'SortedProducts',
  components: {
    ProductsFilters,
    ProductsList
  },
  data() {
    return {
      cannabinoidNames: [],
      cannabinoidOrder: [],
      terpeneNames: [],
      terpeneOrder: [],
    }
  },
  asyncData: {
    // This will be replaced with the actual data returned by the `data` function
    products: []
  },
  created() {
    logger.info('products', this.products)
    window.console.log('products', this.products) 
  },
  methods: {
    setCannabinoidOrder(cannabinoidOrder) {
      window?.console.log('out', cannabinoidOrder)
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