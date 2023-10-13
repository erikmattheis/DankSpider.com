<template>
  <form class="search-filters page">
    <div class="container">
      <ul>
        <li class="small shadowy-button spacer">.</li>
        <li v-for="(vendor, i) in unselectedVendors" :key="i"
          @click="toggleSelectedVendor(vendor)"
          class="small shadowy-button"
          :title="vendor">
          {{ vendor }}
        </li>
      </ul>
      <ul>
        <li class="shadowy-button selected spacer">.</li>
        <li v-for="(vendor, i) in selectedVendors" :key="i"
          @click="toggleSelectedVendor(vendor)"
          class="shadowy-button selected"
          :title="vendor">
          {{ vendor }}
        </li>
      </ul>
    </div>
    <div class="container">
      <ul>
        <li class="small shadowy-button spacer">.</li>
        <li v-for="(variant, i) in unselectedVariants" :key="i"
          @click="toggleSelectedVariant(variant)"
          class="small shadowy-button"
          :title="variant">
          {{ variant }}
        </li>
        <!--
        <li @click.prevent="store.selectAllSizeFilters()" class="shadowy-button all selected" title="Select None">
          Select All
        </li>
      -->
      </ul>
      <ul>
        <li class="spacer">.</li>
        <li v-for="(variant, i) in selectedVariants" :key="i"
          @click="toggleSelectedVariant(variant)"
          class="shadowy-button selected"
          :title="variant">
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
    <div class="container slim">
      <div class="stats">
        {{ numProducts }} product{{ numProducts === 1 ? '' :
          's' }} from {{ numVendors }} vendor{{ numVendors === 1 ? '' : 's' }}
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
      aVendorWasClicked: false,
      aVariantWasClicked: false,
    };
  },
  created() {
    this.store = useSpiderStore();
    this.store.normalizeVariants(this.store.variants);
    this.store.normalizeVendors(this.store.variants);
  },
  mounted() {
    const queryParams = new URLSearchParams(window.location.search);
    for (const [key, value] of queryParams) {
      if (key === 'sizes') {
        const checked = decodeURIComponent(value).split(',').sort();
        if (this.store.normalizedVariants.length > checked.length && checked.length !== 0) {
          this.store.checkedVariants = [...checked];
        }
      } else if (key === 'vendors') {
        const checked = decodeURIComponent(value).split(',').sort();
        if (this.store.vendors.length > checked.length && checked.length !== 0) {
          this.store.checkedVendors = [...checked];
        }
      }
    }
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
  margin: 0;
  list-style-type: none;
  padding-left: 0;
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
  margin-left: 0px;
  margin-right: 10px;
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