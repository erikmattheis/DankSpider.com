
export const useProductStore = defineStore('productStore', {
  state: () => ({
    products: [],
    selectedVendors: [],
    selectedVariants: [],
  }),
  getters: {
    // Filters products based on selected vendors and variants
    filteredProducts(state) {
      return state.products.filter(product => {
        const vendorMatch = state.selectedVendors.length === 0 || state.selectedVendors.includes(product.vendor);
        const variantMatch = state.selectedVariants.length === 0 || product.variants.some(variant => state.selectedVariants.includes(variant));
        return vendorMatch && variantMatch;
      });
    },
    // Sorting helpers (Placeholder for actual logic)
    sortByDate() {
        this.products.sort((a, b) => a.lastUpdated.localeCompare(b.lastUpdated));
    },
    sortByTitle() {
        this.products.sort((a, b) => a.title.localeCompare(b.title));
    },
    // Sort by highest concentration of a given terpene or cannabinoid
    sortByConcentration() {
      // Implement sorting by highest concentration
    },
    vendors(_, getters) {
      const vendorSet = new Set();
      getters.filteredProducts.forEach(product => {
          vendorSet.add(product.vendor);
      });
      return Array.from(vendorSet).sort();
    },
    variants(_, getters) {
      const variantSet = new Set();
      getters.filteredProducts.forEach(product => {
          product.variants.forEach(variant => {
            if (variant && variant.name) {
                variantSet.add(variant.name);
            }
          });
      });
      return Array.from(variantSet).sort();
    },
    terpenes(_, getters) {
      const terpeneSet = new Set();
      getters.filteredProducts.forEach(product => {
          product.terpenes.forEach(terpene => {
            if (terpene && terpene.name) {
                terpeneSet.add(terpene.name);
            }
          });
      });
      return Array.from(terpeneSet).sort();
    },
    cannabinoids(_, getters) {
      const canabinoidSet = new Set();
      getters.filteredProducts.forEach(product => {
          product.cannabinoids.forEach(terpene => {
            if (canabinoid && canabinoid.name) {
                canabinoidSet.add(anabinoid.name);
            }
          });
      });
      return Array.from(canabinoidSet).sort();
    },

  },
  actions: {
    // Action to sort products by different criteria
    sortProducts(criteria) {
      switch (criteria.type) {
        case 'date':
          // Implement sorting logic based on criteria
          break;
        case 'title':
          // Implement sorting logic based on criteria
          break;
        case 'concentration':
          // Implement sorting logic based on terpene or cannabinoid concentration
          // criteria.name will hold the name of the terpene or cannabinoid
          break;
        default:
          // Default case if no matching criteria
          break;
      }
    },
  }
});
