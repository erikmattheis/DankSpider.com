<template>
  <!--- TODO: https://css-tricks.com/a-dynamically-sized-sticky-sidebar-with-html-and-css/ -->
  <form class="page">
    <div class="header" >
      <div class="stats">
        {{ numProducts }} product{{ numProducts === 1 ? '' : 's' }} from {{ numVendors }} vendor{{ numVendors === 1 ? ''
          : 's' }}
      </div>
      <h3 class="filters-title">Filters</h3>
      <!--
      <div class="collapse-button filters down">
        <font-awesome-icon :icon="['fas', 'right-long']" />
      </div>
      -->
    </div>
    <div class="filters filter" id="filters">

      <div class="header">
        <h3>Vendors</h3>
        <!--
        <div class="collapse-button vendors arrow">
          <font-awesome-icon :icon="['fas', 'right-long']" />
        </div>
        -->
      </div>

      <div class="vendors filter">
        <ul class="container">
          <li v-for="(vendor, i) in vendors" :key="i" @click.prevent="toggleSelectedVendor(vendor)" class="shadowy-button"
            :class="{ selected: checkedVendors.includes(vendor) }" :title="vendor">
            {{ vendor }}
          </li>
          <li @click.prevent="store.selectAllVendorFilters()" class="shadowy-button selected" title="All ">
            All
          </li>
          <li @click.prevent="store.clearSelectedVendorFilters()" class="shadowy-button selected" title="None">
            None
          </li>
        </ul>
      </div>

      <div class="header">
        <h3>Sizes</h3>
        <!--
        <div class="collapse-button sizes arrow">
          <font-awesome-icon :icon="['fas', 'right-long']" />
        </div>
        -->
      </div>

      <div class="sizes filter">
        <ul class="container">
          <li v-for="(variant, i) in variants" :key="i" @click.prevent="toggleSelectedVariant(variant)"
            class="shadowy-button" :class="{ selected: checkedVariants.includes(variant) }" :title="variant">
            {{ variant }}
          </li>
          <li @click.prevent="store.selectAllSizeFilters()" class="shadowy-button selected" title="All ">
            All
          </li>
          <li @click.prevent="store.clearSelectedSizeFilters()" class="shadowy-button selected" title="None">
            None
          </li>
        </ul>
      </div>


      <div class="terpenes filter collapsed">
        <ul class="container">
          <li v-for="( terpene, i ) in  store.terpeneNames" :key="i" @click.prevent="toggleSelectedTerpene(terpene)"
            class="shadowy-button" :class="{ selected: checkedTerpenes.includes(terpene) }" :title="terpene">
            {{ terpene }}
          </li>
          <li @click.prevent="store.selectAllTerpeneFilters()" class="shadowy-button selected" title="All ">
            All
          </li>
          <li @click.prevent="store.clearSelectedTerpeneFilters()" class="shadowy-button selected" title="None">
            None
          </li>
        </ul>
      </div>

      <div class="container header">
        <label class="sort-label">Terpenes</label>
        <select class="sort-by shadowy-button selected" @change="sortProductsByTerpene" >
          <option v-for="chemical in store.filteredProductsTerpenes">{{ chemical }}</option>
        </select>
        <label class="sort-label">Cannabinoids</label>
        <select class="sort-by shadowy-button selected" @change="sortProductsByCannabinoid">
          <option selected="true" disabled="true">Sort by Cannabinoid</option>
          <option v-for="chemical in store.filteredProductsCannabinoids">{{ chemical }}</option>
        </select>
      </div>
    </div>
  </form>
</template>

<script>
/* TODO: padding, animation */
import { useSpiderStore } from '../store';

export default {
  name: 'ProductFilters',
  data() {
    return {
      store: null,
      isCollapsed: false,
      showSizes: true,
      showVendors: true,
      showTerpenes: true,
      showCannabinoids: true,
      terpenes: [],
      cannabinoids: [],
      aVendorWasClicked: false,
      aVariantWasClicked: false,
    }
  },
  created() {
    this.store = useSpiderStore();
    this.store.normalizeVariants(this.store.variants);
    this.store.normalizeVendors(this.store.variants);
    this.store.thinkAboutCannabinoids();
    this.store.thinkAboutTerpenes();
    this.variants = this.store.normalizedVariants;
    this.terpenes = this.store.terpeneNames;
    this.cannabinoids = this.store.cannabinoidNames;
  },
  mounted() {
    const queryParams = new URLSearchParams(window.location.search);
    /*
    for (const [key, value] of queryParams) {
      if (key === 'sizes') {

        const checked = decodeURIComponent(value).split(',').sort();
        if (this.store.normalizedVariants.length > checked.length) {
          this.store.checkedVariants = [...checked];
        }
      } else if (key === 'vendors') {

        const checked = decodeURIComponent(value).split(',').sort();
        if (this.store.vendors.length > checked.length) {
          this.store.checkedVendors = [...checked];
        }
      }
    }
    this.store.checkedTerpenes = [...this.terpenes];
    this.store.checkedCannabinoids = [...this.cannabinoids];
    */
  },
  computed: {
    checkedVendorsList() {
      return this.store.checkedVendors.join(', ');
    },
    checkedSizesList() {
      return this.store.checkedVariants.join(', ');
    },
    normalizedVariants() {
      return this.store.normalizedVariants;
    },
    checkedVariants() {
      return this.store.checkedVariants;
    },
    checkedTerpenes() {
      return this.store.checkedTerpenes;
    },
    checkedCannabinoids() {
      return this.store.checkedCannabinoids;
    },
    vendors() {
      return this.store.vendors;
    },
    checkedVendors() {
      return this.store.checkedVendors;
    },
    numProducts() {
      return this.store.numProducts;
    },
    numVendors() {
      return this.store.numVendors;
    }
  },
  methods: {
    toggleCollapse(name) {

      // toggle "collapsed" class on element with classes name and "containe
      const element = document.querySelector(`.${name}.filter`);
      element.classList.toggle('collapsed');

      // toggle "down" class on element with class "collapse-button" inside element with classes name and "header"
      const button = document.querySelector(`.${name}.collapse-button`);
      button.classList.toggle('down');

      // toggle "hidden" class on element with class "container" inside element with classes name and "filter"
      const container = document.querySelector(`.${name}.list`);
      container.classList.toggle('hidden');


    },

    toggleOnlyShowProductsWithTerpenes() {
      this.store.toggleOnlyShowProductsWithTerpenes();
    },
    toggleOnlyShowProductsWithCannabinoids() {
      this.store.toggleOnlyShowProductsWithCannabinoids();
    },
    sortProductsByTerpene(event) {
      console.log('sort', event.target.value);
      this.store.sortProductsByTerpene(event.target.value);
    },
    sortProductsByCannabinoid(event) {
      this.store.sortProductsByCannabinoid(event.target.value);
    },
    toggleSelectedVariant(variant) {
      if (!this.aVariantWasClicked) {
        this.onlySelectVariant(variant);
        this.aVariantWasClicked = true;
      }
      else {
        this.store.toggleSelectedVariant(decodeURIComponent(variant));
        if (this.checkedVariants.length === this.numSortedVariants) {
          this.aVariantWasClicked = false;
        }
      }
      this.changeQueryStrings(this.checkedVariants, this.checkedVendors);
      return false;
    },
    toggleSelectedVendor(vendor) {
      if (!this.aVendorWasClicked) {
        this.onlySelectVendor(vendor);
        this.aVendorWasClicked = true;
      }
      else {
        this.store.toggleSelectedVendor(decodeURIComponent(vendor));
        if (this.checkedVendors.length === this.numVendors) {
          this.aVendorWasClicked = false;
        }
      }
      this.changeQueryStrings(this.checkedVariants, this.checkedVendors);
      return false;
    },
    toggleSelectedCannabinoid(cannabinoid) {
      this.store.toggleSelectedCannabinoid(decodeURIComponent(cannabinoid));
      return false;
    },
    toggleSelectedTerpene(terpene) {
      this.store.toggleSelectedTerpene(decodeURIComponent(terpene));
      return false;
    },
    changeQueryStrings(checkedVariants, checkedVendors) {
      const sizes = checkedVariants.sort().join(',');
      const vendors = checkedVendors.sort().join(',');
      this.$router.push({ to: '/', query: { sizes, vendors, savePosition: true } });
      return false;
    },
    onlySelectVariant(variant) {
      this.store.checkedVariants = [variant];
      return false;
    },
    onlySelectVendor(vendor) {
      this.store.checkedVendors = [vendor];
      return false;
    }
  }
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  width: 100%;
  border-top: 1px solid #ccc;
  background-color: #eee;
}

.filters-title {
  margin-left: auto;
  margin-right: 8px;
}

h3 {
  margin: 0 0 0 8px;
  align-self: flex-start;
}

.sort-label {
  margin-right: 4px;
}

.selected-items {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
  overflow-x: scroll;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-left: 12px;
}

.selected-items::-moz-scrollbar,
.selected-items::-webkit-scrollbar {
  display: none;
}

.selected-items span {
  margin-right: 5px;
  font-size: 0.5rem;
  background-color: #eee;
  color: #333;
}

.collapse-button {
  margin-right: 8px;
  transition: transform 0.3s ease-in-out;
  align-self: flex-end;
}

.hidden {
  opacity: 0;
}

.down {
  transform: rotate(90deg);
}

.container {
  width: 100%;
  padding: 6px;
}

h3 {
  margin: 0 0 0 8px;
}

.selected-items::-moz-scrollbar,
.selected-items::-webkit-scrollbar {
  display: none;
}

.selected-items span {
  margin-right: 5px;
  font-size: 0.5rem;
  background-color: #eee;
  color: #333;
}

.container.slim {
  margin-bottom: 3px;
  margin-left: 20px;
}

.filter {
  transition: all 0.4s ease-out;
  height: auto;
  overflow: hidden;
}

.filters-container,
ul {
  display: block;
  height: min-content;
  flex-wrap: wrap;
  list-style-type: none;
  background-color: #fff;
  margin: 0;
}

.sort-by,
ul li {
  display: inline-block;
  font-weight: 300;
  font-size: 70%;
  margin: 2px;
  padding: 0 4px;
  border-radius: 20px;
  background-color: #012e06;
  color: #eee;
  cursor: pointer;
}

select.shadowy-button.selected,
ul li.shadowy-button.selected,
ul li.selected {
  color: #057503;
  font-weight: 700;
  background-color: #fff;
}

li span {
  white-space: nowrap;
}

ul li::after {
  display: block;
  content: attr(title);
  font-weight: 600;
  height: 1px;
  color: transparent;
  overflow: hidden;
  visibility: hidden;
}

.sort-by {
  margin-right: 80px;
  padding: 4px 30px;
}

.collapsed {
  height: 0;
}
</style>