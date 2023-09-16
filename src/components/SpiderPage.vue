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
  justify-content: flex-start;
  align-items: center;
  width: 100%;
}

ul {
  display: flex;
  flex-wrap: wrap;
  margin: 0;
}

ul li {
  display: block;
  font-weight: 500;
  margin-bottom: 10px;
  margin-right: 5px;
  padding: 5px 10px;
  border-radius: 20px;
  background-color: #333;
  color: #eee;
  cursor: pointer;
}

ul li.selected {
  color: #242424;
  background-color: #eee;
}

li span {
  white-space: nowrap;
}

.horizontal-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-left: -20px;
  margin-right: -20px;
}
</style>