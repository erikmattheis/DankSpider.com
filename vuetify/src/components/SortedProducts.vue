<template>
 <ProductFilters />
  <CardList/>
</template>

<script>

import CardList from './CardList.vue';
import ProductFilters from './ProductsFilter.vue';

export default {
  name: 'SortedProducts',
  components: {
    CardList
  }
}

</script>

<style>

  
</style>