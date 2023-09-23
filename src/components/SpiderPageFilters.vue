<template>
  <form class="search-filters page">
    <ul>
      <li v-for="(variant, i) in normalizedVariants" :key="i"
        @click="toggleSelected(variant)"
        class="shadowy-button"
        :class="{ selected: checkedVariants.includes(variant) }"
        :title="variant">
        {{ variant }}
      </li>
      <li v-if="checkedVariants.length > 0" @click="store.clearSelectedSizeFilters()" class="shadowy-button none"
        title="Select None">Select None
      </li>
      <li v-else @click="store.selectAllSizeFilters()" class="shadowy-button all selected" title="Select None">Select All
      </li>
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
  margin-bottom: 20px;
  background-color: #fff;
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
  font-weight: 300;
  margin-bottom: 10px;
  margin-right: 5px;
  padding: 5px 10px;
  border-radius: 20px;
  background-color: #aaa;
  color: #eee;
  cursor: pointer;
}

ul li.shadowy-button {
  font-weight: 400;
}

ul li.shadowy-button.selected,
ul li.selected {
  color: #242424;
  font-weight: 600;
  background-color: #fff;
}

li span {
  white-space: nowrap;
}

ul li::after {
  display: block;
  content: attr(title);
  font-weight: 700;
  height: 1px;
  color: transparent;
  overflow: hidden;
  visibility: hidden;
}

ul li.all,
ul li.none {
  font-weight: 500;
  text-align: center;
}
</style>