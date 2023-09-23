import { defineStore } from 'pinia';
import jsonData from './assets/data/products.json';

export const useSpiderStore = defineStore('spider', {
  id: 'spider',
  state: () => ({
    products: jsonData.products,
    updatedAt: jsonData.updatedAt,
    variants: [],
    normalizedVariants: [],
    checkedVariants: [],
    emptyProduct: {
      name: 'empty',
      image: '',
      variants: [],
    },
  }),
  getters: {
    filteredProducts(state) {
      console.log('state.products', state.products.length);
      if (!state.products?.filter) return state.products;
      const products = state.products.filter((product) => {
        return product.variants.some((variant) => this.checkedVariants.includes(variant));
      });

      const emptyProductsCount = Math.max(3 - products.length, 0);
      const emptyProducts = Array(emptyProductsCount).fill(state.emptyProduct);
      console.log('emptyProducts', emptyProducts);
      const sorted = this.sortProducts(products, 'title');
      return [...sorted, ...emptyProducts];
    },
    numProducts(state) {
      return state.filteredProducts.length;
    },
    numVendors(state) {
      const uniqueVendors = new Set();
      state.filteredProducts.forEach((product) => {
        uniqueVendors.add(product.vendor);
      });
      return uniqueVendors.size;
    },
    updatedString(state) {
      const date = new Date(jsonData.updatedAt);
      const options = {
        weekday: 'long',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      };
      console.log(date)
      return date.toLocaleString('en-US', options);
    }
  },
  actions: {
    clearSelectedSizeFilters() {
      this.checkedVariants = [];
      this.highlightChecked();
    },
    selectAllSizeFilters() {
      this.checkedVariants = [...this.normalizedVariants];
      this.highlightChecked();
    },
    sortProducts(products, by) {
      if (!products?.sort) return products;
      products.sort((a, b) => {
        if (a[by] < b[by]) return -1;
        if (a[by] > b[by]) return 1;
        return 0;
      });
      return products;
    },
    normalizeText(title) {
      return title.toLowerCase().replace(/[^\w]+/g, '');
    },
    normalizeVariants() {
      const variants = [];

      // Iterate over each product
      this.products.forEach((product) => {
        // Iterate over each variant of the product
        product.variants.forEach((variant) => {
          if (!variant) return;
          const normalizedVariant = this.normalizeText(variant);

          // Add the variant and its normalized counterpart to the arrays
          if (!variants.includes(variant)) {
            console.log('variant', variant, ' is not yet in ', variants);
            variants.push(variant);
            //throw new Error('stop')
          }
        });
      });

      this.checkedVariants = [...variants];
      this.normalizedVariants = [...variants];

      // Highlight the checked variants
      this.highlightChecked();
    },
    highlightChecked() {
      console.log('highlightChecked');
      document.querySelectorAll('.variant-name').forEach((element) => {
        const match = this.checkedVariants.some((member) => element.textContent === member);
        if (match) {
          element.classList.add('selected');
        } else {
          element.classList.remove('selected');
        }
      });
    },
    toggleSelected(variant) {
      if (this.checkedVariants.find((element) => element === variant)) {
        this.checkedVariants.splice(this.checkedVariants.indexOf(variant), 1);
      } else {
        this.checkedVariants.push(variant);
      }
      this.highlightChecked()
    },
  },
});