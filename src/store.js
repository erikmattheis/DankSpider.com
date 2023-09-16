import { defineStore } from 'pinia';
import jsonData from './assets/data/products.json';

export const useSpiderStore = defineStore('spider', {
  id: 'spider',
  state: () => ({
    products: jsonData,
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

      const products = state.products.filter((product) => {
        return product.variants.some((variant) => this.checkedVariants.includes(variant));
      });

      const emptyProductsCount = Math.max(4 - products.length, 0);
      const emptyProducts = Array(emptyProductsCount).fill(state.emptyProduct);

      return [...products, ...emptyProducts];
    },
  },
  actions: {
    sortProducts(by) {
      this.products.sort((a, b) => {
        if (a[by] < b[by]) return -1;
        if (a[by] > b[by]) return 1;
        return 0;
      });
    },
    normalizeText(title) {
      return title.toLowerCase().replace(/[^\w]+/g, '');
    },
    normalizeVariants() {
      const smallsRegex = /smalls\b/i;
      const variants = [];

      jsonData.forEach((product) => {
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
      this.sortProducts('title');
      this.normalizedVariants = variants;
    },
    highlightChecked() {

      document.querySelectorAll('li').forEach((element) => {
        if (this.checkedVariants.find((member) => element.textContent === member)) {
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