<!-- +Page.vue -->
<template>
  <div>
  <a @click="TrackEvent('ok')">Click me</a>
  <ProductsFilters @set-cannabinoid-order="setCannabinoidOrder" @set-terpene-order="setTerpeneOrder" :terpene-names="terpeneNames" :cannabinoid-names="cannabinoidNames"/>
  <ProductsList @set-terpene-names="setTerpeneNames" @set-cannabinoid-names="setCannabinoidNames" :cannabinoid-order="cannabinoidOrder" :terpene-order="terpeneOrder" :products="products"/>
</div>
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
  created() {
    console.log('this', this)
  },
  mounted() {
    console.log('this', this)
   // this.products = Object.keys(this);
   const pageContext = usePageContext()
   this.products = pageContext.products;
  },
  methods: {
    trace(event) {
      window?.console.log('event', event)
    },
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