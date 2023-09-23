<template>
  <div class="spider-page page">
    <SpiderPageFilters class="spider-page-filters" />
    <SpiderPageCards class="spider-page-cards" />
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

.spider-page-filters {
  position: sticky;
  top: 54px;
  padding-top: 21px;
  overflow-y: auto;
  z-index: 1;
}

.spider-page-cards {
  flex: 1;
}
</style>