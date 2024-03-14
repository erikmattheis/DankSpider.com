<!-- +Page.vue -->
<template>
  <ProductsFilters @set-cannabinoid-order="setCannabinoidOrder" @set-terpene-order="setTerpeneOrder" :terpene-names="terpeneNames" :cannabinoid-names="cannabinoidNames"/>
  <ProductsList @set-terpene-names="setTerpeneNames" @set-cannabinoid-names="setCannabinoidNames" :cannabinoid-order="cannabinoidOrder" :terpene-order="terpeneOrder" :products="products"/>
</template>

<script>
import { usePageContext } from 'vike-vue/usePageContext'
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
      products: [],
      cannabinoidNames: [],
      cannabinoidOrder: [],
      terpeneNames: [],
      terpeneOrder: [],
    }
  },
  mounted() {
   // this.products = Object.keys(this);
   const pageContext = usePageContext()
   this.products = pageContext.products
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