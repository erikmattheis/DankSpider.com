<template>
  <form class="search-filters page">
    <div class="filter-column left-column" v-if="vendors.length">
      <div>
        <h3>Vendor</h3>
        <ul>
          <li v-for="(vendor, i) in unselectedVendors" :key="i"
            @click="toggleSelectedVendor(vendor)"
            class="shadowy-button selected">
            {{ vendor }}
          </li>
        </ul>
      </div>
      <div>
        <h3>Selected Vendor {{ selectedVendors.length }}</h3>
        <ul>
          <li v-for="(vendor, i) in selectedVendors" :key="i"
            @click="toggleSelectedVendor(vendor)"
            class="small shadowy-button">
            {{ vendor }}
          </li>
        </ul>
      </div>
    </div>
    <div class="filter-column right-column" v-if="normalizedVariants.length">
      <div>
        <h3>Variant</h3>
        <ul>
          <li v-for="(variant, i) in unselectedVariants" :key="i"
            @click="toggleSelectedVariant(variant)"
            class="small shadowy-button">
            {{ variant }}
          </li>
        </ul>
      </div>
      <div>
        <h3>Selected Variant</h3>
        <ul>
          <li v-for="(variant, i) in    selectedVariants   " :key="i"
            @click="toggleSelectedVariant(variant)"
            :class="shadowy - button selected">
            {{ variant }}
          </li>
        </ul>
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
      normalizedVariants: store.normalizedVariants,
      checkedVariants: store.checkedVariants,
      vendors: store.vendors,
      checkedVendors: store.checkedVendors,
    };
  },
  mounted() {
    const store = useSpiderStore();
    store.normalizeVariants(store.variants);
  },
  computed: {
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
  },
  methods: {
    toggleSelectedVariant(variant) {
      const store = useSpiderStore();
      store.toggleSelectedVariant(variant);
    },
    toggleSelectedVendor(vendor) {
      const store = useSpiderStore();
      store.toggleSelectedVendor(vendor);
    },
  },
};
</script>

<style scoped>
.search-filters {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  margin-bottom: 20px;
  background-color: #fff;
}

.filter-column {
  width: 50%;
  display: flex;
  flex-wrap: wrap;
  margin: 0;
  list-style-type: none;
  position: relative;
  justify-content: flex-start;
}

.left-column {
  margin-right: 5%;
}

.right-column {
  margin-left: 5%;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

li {
  border-radius: 20px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

li:hover {
  transform: scale(1.1);
}

.selected {
  background-color: #fff;
  color: #242424;
  font-weight: 600;
  animation: grow 0.2s ease-in-out forwards;
}

@keyframes grow {
  from {
    font-size: 12px;
  }

  to {
    font-size: 18px;
  }
}

@media (max-width: 768px) {
  .filter-column {
    justify-content: center;
    width: 100%;
  }

  .left-column {
    margin-right: 0;
    margin-bottom: 20px;
  }

  .right-column {
    margin-left: 0;
  }
}
</style>