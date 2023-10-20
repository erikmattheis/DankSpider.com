<template>
  <form class="search-filters page">
    <div class="container">
      <ul>
        <li class="shadowy-button selected spacer">.</li>
        <li v-for="(vendor, i) in vendors" :key="i" @click="toggleSelectedVendor(vendor)"
          class="shadowy-button" :class="{selected: checkedVendors.includes(vendor)}" :title="vendor">
          {{ vendor }}
        </li>
      </ul>
    </div>
    <div class="container">
      <ul>
        <!--
        <li @click.prevent="store.selectAllSizeFilters()" class="shadowy-button all selected" title="Select None">
          Select All
        </li>
      -->
      </ul>
      <ul>
        <li class="spacer">.</li>
        <li v-for="(variant, i) in variants" :key="i" @click="toggleSelectedVariant(variant)"
          class="shadowy-button" :class="{selected: checkedVariants.includes(variant)}" :title="variant">
          {{ variant }}
        </li>
        <!--
        <li v-if="checkedVariants.length > 0" @click.prevent="store.clearSelectedSizeFilters()"
          class="shadowy-button none"
          title="Select None">Select None
        </li>
      -->
      </ul>
    </div>
    <div class="container">
      <ul>
        <li class="spacer">.</li>
        <li v-for="(cannabinoid, i) in store.cannabinoidNames" :key="i" @click="toggleSelectedCannabinoid(cannabinoid)"
          class="shadowy-button" :class="{selected: checkedCannabinoids.includes(cannabinoid)}" :title="cannabinoid">
          {{ cannabinoid }}  <font-awesome-icon :icon="['fas', 'circle']" v-if="checkedCannabinoids.includes(cannabinoid)"/>
          <font-awesome-icon :icon="['fas', 'face-grin-stars']" v-else/>
        </li>
      </ul>
    </div>
    <div class="container">
      <ul>
        <li class="spacer">.</li>
        <li v-for="(terpene, i) in store.terpeneNames" :key="i" @click="toggleSelectedTerpene(terpene)"
          class="shadowy-button" :class="{selected: checkedTerpenes.includes(terpene)}" :title="terpene">
          {{ terpene }}  <font-awesome-icon :icon="['fas', 'circle']" v-if="checkedTerpenes.includes(terpene)"/>
          <font-awesome-icon :icon="['fas', 'leaf']" v-else/>
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
  </form>
</template>

<script>
import { useSpiderStore } from '../store';

export default {
  name: 'SpiderPageFilters',
  data() {
    return {
      store: null,
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
  },
  methods: {
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
  }
}
</script>

<style scoped>
.spacer {
  opacity: 0;
  cursor: default;
}

.small {
  font-size: 0.6em;
}

.container.slim {
  margin-bottom: 3px;
  margin-left: 20px;
}

.container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 5px;
  width: 100%;
}

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
  margin: 0 0 30px 0;
  list-style-type: none;
  padding-left: 0;
  border-bottom: 1px solid #aaa;
}

ul li {
  display: inline-block;
  font-weight: 300;
  margin-bottom: 10px;
  margin-left: 10px;
  margin-right: 0px;
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

select {
  appearance: none !important;
}

.sort-by {
  margin-right: 80px
}
</style>