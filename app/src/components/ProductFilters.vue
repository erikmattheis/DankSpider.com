<template>
  <form class="page filters container">
    <div class="header" @click="toggleCollapse('filters')">
      <h3>Filters</h3>
      <div class="collapse-button">
        <span v-if="isCollapsed"><font-awesome-icon :icon="['fas', 'filter']" /></span>
        <span v-else><font-awesome-icon :icon="['fas', 'filter-circle-xmark']" /></span>
      </div>
    </div>
    <div class="container" id="filters">
      <div class="header" @click="toggleCollapse('vendors')">
        <h3>Vendors</h3>
        <div class="selected-items"><span v-for="(vendor, i) in checkedVendors">{{ vendor }}</span></div>
        <div class="collapse-button">
          <font-awesome-icon :icon="['fas', 'square-caret-right']" />
        </div>
      </div>
      <ul id="vendors">
        <li v-for="(vendor, i) in vendors" :key="i" @click="toggleSelectedVendor(vendor)" class="shadowy-button"
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

      <div class="header">
        <h3>Sizes</h3>
        <div class="selected-items"><span v-for="(variant, i) in checkedVariants">{{ variant }}</span></div>
        <div class="collapse-button" @click="toggleCollapse('sizes')">
          <font-awesome-icon :icon="['fas', 'square-caret-right']" />
        </div>
      </div>

      <ul id="sizes" class="container">
        <li v-for="(variant, i) in variants" :key="i" @click="toggleSelectedVariant(variant)" class="shadowy-button"
          :class="{ selected: checkedVariants.includes(variant) }" :title="variant">
          {{ variant }}
        </li>
        <li @click.prevent="store.selectAllSizeFilters()" class="shadowy-button selected" title="All ">
          All
        </li>
        <li @click.prevent="store.clearSelectedSizeFilters()" class="shadowy-button selected" title="None">
          None
        </li>
      </ul>

      <div class="container">
        <div class="header">
          <h3>Terpenes</h3>
          <div class="selected-items">
            <input type="checkbox" @click="store.toggleFilterByTerpenes" :checked="store.filterByTerpenes">
            <span v-for="(terpene) in checkedTerpenes">{{ terpene }}</span>
          </div>
        </div>
        <div class="collapse-button" @click="toggleCollapse('terpenes')">
          <font-awesome-icon :icon="['fas', 'square-caret-right']" />
        </div>
        <ul>
          <li v-for="(terpene, i) in store.terpenes" :key="i" @click="toggleSelectedTerpene(terpene)"
            class="shadowy-button" :class="{ selected: checkedTerpenes.includes(terpene) }" :title="terpene">
            {{ terpene }} <!--<font-awesome-icon :icon="['fas', 'face-grin-stars']" v-if="checkedTerpenes.includes(terpene)"/>
          <font-awesome-icon :icon="['fas', 'star-of-life']" v-else/>-->
          </li>
          <li @click.prevent="store.selectAllTerpeneFilters()" class="shadowy-button selected" title="All ">
            None
          </li>
          <li @click.prevent="store.clearSelectedTerpeneFilters()" class="shadowy-button selected" title="None">
            None
          </li>
        </ul>
      </div>
      <div class="container">
        <div class="header">
          <h3>Cannabinoids</h3>
          <div class="selected-items">
            <input type="checkbox" @click="store.toggleFilterByCannabinoids" :checked="store.filterByCannabinoids">
            <span v-for="(cannabinoid) in checkedCannabinoids">{{ cannabinoid }}</span>
          </div>
          <div class="collapse-button" @click="toggleCollapse('cannabinoids')">
            <font-awesome-icon :icon="['fas', 'star-of-life']" />
          </div>
        </div>
        <ul>
          <li v-for="(cannabinoid, i) in store.cannabinoidNames" :key="i" @click="toggleSelectedCannabinoid(cannabinoid)"
            class="shadowy-button" :class="{ selected: checkedCannabinoids.includes(cannabinoid) }" :title="cannabinoid">
            {{ cannabinoid }} <!-- <font-awesome-icon :icon="['fas', 'leaf']" v-if="checkedCannabinoids.includes(cannabinoid)"/>
          <font-awesome-icon :icon="['fas', 'star-of-life']" v-else/>-->
          </li>
          <li @click.prevent="store.selectAllVendorFilters()" class="shadowy-button selected" title="All ">
            None
          </li>
          <li @click.prevent="store.clearSelectedVendorFilters()" class="shadowy-button selected" title="None">
            None
          </li>
        </ul>
      </div>
      <div class="container slim">
        <div class="stats">
          {{ numProducts }} product{{ numProducts === 1 ? '' :
            's' }} from {{ numVendors }} vendor{{ numVendors === 1 ? '' : 's' }}
        </div>
        <div>
          <select class="sort-by" @change="sortProductsByTerpene">
            <option value="all">Sort by Terpene...</option>
            <option v-for="chemical in store.terpeneNames">{{ chemical }}</option>
          </select>
          <select class="sort-by" @change="sortProductsByCannabinoid">
            <option value="all">Sort by Cannabinoid...</option>
            <option v-for="chemical in store.cannabinoidNames">{{ chemical }}</option>
          </select>
        </div>
      </div>
    </div>
  </form>
</template>

<script>
import { useSpiderStore } from '../store';

export default {
  name: 'ProductFilters',
  data() {
    return {
      store: null,
      isCollapsed: false,
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
    this.store.normalizeCannabinoids();
    this.store.normalizeTerpenes();
    this.variants = this.store.normalizedVariants;
    this.terpenes = this.store.terpeneNames;
    this.cannabinoids = this.store.cannabinoidNames;
  },
  mounted() {
    const queryParams = new URLSearchParams(window.location.search);
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
  },
  computed: {
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
    selectedVendors() {
      return this.vendors.filter(vendor => this.checkedVendors.includes(vendor));
    },
    unselectedVendors() {
      return this.vendors.filter(vendor => !this.checkedVendors.includes(vendor));
    },
    selectedVariants() {
      return this.normalizedVariants.filter(variant => this.checkedVariants.includes(variant));
    },
    unselectedVariants() {
      return this.normalizedVariants.filter(variant => !this.checkedVariants.includes(variant));
    },
    numProducts() {
      return this.store.numProducts;
    },
    numVendors() {
      return this.store.numVendors;
    },
    sortProductsByTerpene(event) {
      console.log('sort', event.target.value);
      this.store.sortProductsByTerpene(event.target.value);
    },
    sortProductsByCannabinoid(event) {
      console.log('sort', event.target.value);
      this.store.sortProductsByCannabinoid(event.target.value);
    },
    toggleSelectedVariant(variant) {
      if (!this.aVariantWasClicked) {
        this.onlySelectVariant(variant);
        this.aVariantWasClicked = true;
      }
      else {
        this.store.toggleSelectedVariant(decodeURIComponent(variant));
        if (this.unselectedVariants.length === 0) {
          this.aVariantWasClicked = false;
        }
      }
      this.changeQueryStrings(this.checkedVariants, this.checkedVendors);
    },
    toggleSelectedVendor(vendor) {
      if (!this.aVendorWasClicked) {
        this.onlySelectVendor(vendor);
        this.aVendorWasClicked = true;
      }
      else {
        this.store.toggleSelectedVendor(decodeURIComponent(vendor));
        if (this.unselectedVendors.length === 0) {
          this.aVendorWasClicked = false;
        }
      }
      this.changeQueryStrings(this.checkedVariants, this.checkedVendors);
    },
    toggleSelectedCannabinoid(cannabinoid) {
      this.store.toggleSelectedCannabinoid(decodeURIComponent(cannabinoid));
    },
    toggleSelectedTerpene(terpene) {
      this.store.toggleSelectedTerpene(decodeURIComponent(terpene));
    },
    changeQueryStrings(checkedVariants, checkedVendors) {
      const sizes = checkedVariants.sort().join(',');
      const vendors = checkedVendors.sort().join(',');
      this.$router.push({ path: '', query: { sizes, vendors } });
    },
    onlySelectVariant(variant) {
      this.store.checkedVariants = [variant];
    },
    onlySelectVendor(vendor) {
      this.store.checkedVendors = [vendor];
    }
  },
  methods: {
    toggleCollapse(id) {
      const element = document.getElementById(id);
      element.classList.toggle('collapsed');
    },
    toggleOnlyShowProductsWithTerpenes() {
      this.store.toggleOnlyShowProductsWithTerpenes();
    },
    toggleOnlyShowProductsWithCannabinoids() {
      this.store.toggleOnlyShowProductsWithCannabinoids();
    }
  }
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
}

.collapse-button {
  align-self: flex-end;
}

.selected-items {
  font-size: 0.5rem;
}

.container {
  margin: 30px 0;
  background-color: #fff;
  width: 100%;
}



.selected-items span {
  margin-right: 5px;
  padding: 2px 5px;
  border-radius: 5px;
  background-color: #eee;
  color: #333;
}



.small {
  font-size: 0.6em;
}

.container.slim {
  margin-bottom: 3px;
  margin-left: 20px;
}

.filters {
  margin-bottom: 20px;
  background-color: #fff;
}

ul {
  display: block;
  flex-wrap: wrap;
  margin: 10px 0 20px 0;
  list-style-type: none;
  padding-left: 0;
}

ul li {
  display: inline-block;
  font-weight: 300;
  font-size: 70%;
  margin: 2px;
  padding: 0 8px;
  border-radius: 20px;
  background-color: #012e06;
  color: #eee;
  cursor: pointer;
}

ul li.shadowy-button {
  font-weight: 400;
}

ul li.shadowy-button.selected,
ul li.selected {
  color: #057503;
  font-weight: 600;
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

select {
  appearance: none !important;
}

.sort-by {
  margin-right: 80px
}

.collapsed {
  height: 0;
}
</style>