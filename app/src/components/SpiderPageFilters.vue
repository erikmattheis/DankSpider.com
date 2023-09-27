<template>
  <form class="search-filters page">
    <ul>
      <li v-for="(vendor, i) in vendors" :key="i"
        @click="toggleSelectedVendor(vendor)"
        class="shadowy-button"
        :class="{ selected: checkedVendors.includes(vendor) }"
        :title="vendor">
        {{ vendor }}
      </li>
    </ul>
    <ul>
      <li v-for="(variant, i) in normalizedVariants" :key="i"
        @click="toggleSelected(variant)"
        class="shadowy-button"
        :class="{ selected: checkedVariants.includes(variant) }"
        :title="variant">
        {{ variant }}
      </li>
      <li v-if="checkedVariants.length > 0" @click.prevent="store.clearSelectedSizeFilters()" class="shadowy-button none"
        title="Select None">Select None
      </li>
      <li v-else @click.prevent="store.selectAllSizeFilters()" class="shadowy-button all selected" title="Select None">
        Select All
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
      store: null,
    };
  },
  created() {

    this.store = useSpiderStore();
    this.store.normalizeVariants(this.store.variants);

  },
  computed: {
    normalizedVariants() {
      return this.store.normalizedVariants;
    },
    checkedVariants() {
      return this.store.checkedVariants;
    },
    vendors() {
      return this.store.vendors;
    },
    checkedVendors() {
      return this.store.checkedVendors;
    },
  },
  methods: {
    toggleSelected(variant) {
      this.store.toggleSelected(variant);
    },
    toggleSelectedVendor(vendor) {
      this.store.toggleSelectedVendor(vendor);
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
}

ul li {
  display: inline-block;
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