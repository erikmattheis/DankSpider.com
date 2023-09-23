<template>
  <form class="search-filters page">
    <ul>
      <li v-for="(variant, i) in normalizedVariants" :key="i"
        @click="toggleSelected(variant)"
        class="shadowy-button"
        :class="{ selected: checkedVariants.includes(variant) }">
        {{ variant }}
      </li>
      <li v-if="checkedVariants.length > 0" @click="store.clearSelectedSizeFilters()" class="shadowy-button">Select None
      </li>
      <li v-else @click="store.selectSizeFilters()" class="shadowy-button">Select None</li>


    </ul>
  </form>
</template>

<script>
import { useSpiderStore } from '../store';

export default {
  name: 'SpiderPageFilters',
  data() {
    return {
      variants: [],
      store: null,
      isExpanded: true,
    };
  },
  created() {
    this.store = useSpiderStore();
    this.store.sortProducts('title');
    this.store.normalizeVariants(this.store.variants);
  },
  computed: {
    normalizedVariants() {
      return this.store.normalizedVariants;
    },
    checkedVariants() {
      return this.store.checkedVariants;
    }
  },
  methods: {
    toggleSelected(variant) {
      this.store.toggleSelected(variant);
    },
  },
};
</script>

<style scoped>
.search-filters {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  margin: 20px 0;
}

ul {
  display: flex;
  flex-wrap: wrap;
  margin: 0;
  list-style-type: none;
  padding-left: 0;
}

ul li {
  display: block;
  font-weight: 500;
  margin-bottom: 10px;
  margin-right: 5px;
  padding: 5px 10px;
  border-radius: 20px;
  background-color: #aaa;
  color: #eee;
  cursor: pointer;
}

ul li.selected {
  color: #242424;
  background-color: #fff;
}

li span {
  white-space: nowrap;
}
</style>