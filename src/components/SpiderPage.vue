<template>
  <div class="spider-page page">
    <SpiderPageFilters />
    <SpiderPageCards />
  </div>
</template>

<script>
import SpiderPageFilters from './SpiderPageFilters.vue';
import SpiderPageCards from './SpiderPageCards.vue';

export default {
  components: {
    SpiderPageFilters,
    SpiderPageCards,
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
</style>