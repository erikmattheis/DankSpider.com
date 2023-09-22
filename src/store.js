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
    numVariants(state) {
      return state.filteredProducts.reduce((total, obj) => {
        return total + obj.variants.length;
      }, 0);
    },
    numProducts(state) {
      console.log('state.filteredProducts', state.filteredProducts.length)
      return state.filteredProducts.length;
    },
    numVendors(state) {
      const uniqueVendors = new Set();
      state.filteredProducts.forEach((product) => {
        product.variants.forEach((variant) => {
          uniqueVendors.add(variant);
        });
      });
      return uniqueVendors.size;
    },

  },
  actions: {
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
      const smallsRegex = /smalls\b/i;
      const variants = [];
      if (!this.products.forEach) return;
      this.products.forEach((product) => {
        product.variants.forEach((variant) => {
          if (!variant) return;
          const normalizedVariant = this.normalizeText(variant);

          if (!variants.includes(variant)) {

            variants.push(variant);
            this.normalizedVariants.push(normalizedVariant);
            if (smallsRegex.test(variant)) {
              this.checkedVariants.push(variant);
            }
          }
        });
      });

      this.normalizedVariants = variants;
    },
    highlightChecked() {
      document.querySelectorAll('.variant-name').forEach((element) => {
        const match = this.checkedVariants.some((member) => element.textContent === member);
        if (match) {
          console.log('match!!!!');
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