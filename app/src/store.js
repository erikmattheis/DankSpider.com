import { defineStore } from 'pinia'
import jsonData from './assets/data/products.json'

export const useSpiderStore = defineStore('spider', {
  id: 'spider',
  state: () => ({
    queryString: '?utm_source=shockingelk%40gmail.com&utm_medium=directory',
    products: jsonData.products,
    updatedAt: jsonData.updatedAt,
    variants: [],
    vendors: [],
    checkedVendors: [],
    normalizedVariants: [],
    checkedVariants: [],
    emptyProduct: {
      name: 'empty',
      image: '',
      variants: []
    },
    cannabinoidNames: [
      'Δ-8 THC',
      'Δ-9 THC',
      'Δ-9 THCA',
      'THCP',
      'THCV',
      'Δ-9 THCVA',
      'R-Δ-10 THC',
      'S-Δ-10 THC',
      '9R-HHC',
      'THC0',
      'CBDV',
      'CBDVA',
      'CBD',
      'CBDA',
      'CBG',
      'CBGA',
      'CBN',
      'CBNA',
      'CBC',
      'CBCA',
      'Total Cannabinoids'
    ],
    terpeneNames: [
      'Borneol',
      'Camphene', 'Carene',
      'Caryophyllene', 'Caryoptnyliene',
      'Citral', 'Dihydrocarveol',
      'Eucalyptol', 'Fenchone',
      'Limonene', 'Linalool',
      'Menthol', 'Nerolidol',
      'Ocimene', 'PPM',
      'Pulegone', 'Terpinolene',
      'Total', 'α-Bisabolol',
      'α-Humulene', 'α-Pinene',
      'α-Terpinene', 'β-Caryophyllene',
      'β-Myrcene', 'γ-Terpinene',
      'Total Terpenes'
    ]
  }),
  getters: {
    filteredProducts(state) {
      console.log('filteredProducts')
      if (!state.products?.filter) return state.products
      const products = state.products.filter((product) => {
        return this.checkedVendors.includes(product.vendor) && product.variants.some((variant) => this.checkedVariants.includes(variant))
      })

      // products.sort(this.sortProducts('title'))

      return [...products, ...emptyProducts]
    },
    numProducts(state) {
      return state.filteredProducts.filter((product) => product.name !== 'empty').length
    },
    numVendors(state) {
      const uniqueVendors = new Set()
      state.filteredProducts.forEach((product) => {
        if (product.name === 'empty') return
        uniqueVendors.add(product.vendor)
      })
      return uniqueVendors.size
    },
    updatedString(state) {
      const date = new Date(jsonData.updatedAt)
      const options = {
        weekday: 'long',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }

      return date.toLocaleString('en-US', options)
    },
    variantClasses(state) {
      const classes = {}
      state.checkedVariants.forEach((variant) => {
        classes[variant] = 'selected'
      })
      return classes
    }
  },
  actions: {
    sortProductsByCannabinoid(chemicalName) {
      console.log('sortProductsByCannabinoid called', chemicalName)

      const sortedProducts = this.products.sort((a, b) => {
        if (!a.cannabinoids || !a.cannabinoids.length) return 1
        if (!b.cannabinoids || !b.cannabinoids.length) return -1

        const aChemical = a.cannabinoids?.find((chemical) => chemical.name === chemicalName)

        const bChemical = b.cannabinoids?.find((chemical) => chemical.name === chemicalName)

        if (parseFloat(aChemical?.pct) < parseFloat(bChemical?.pct)) return 1
        if (parseFloat(aChemical?.pct) > parseFloat(bChemical?.pct)) return -1
        return 0
      })
      this.products = [...sortedProducts]
    },
    sortProductsByTerpene(chemicalName) {
      console.log('sortProductsByTerpene called', chemicalName)
      const a = this.products[0].title
      const sortedProducts = this.products.sort((a, b) => {
        if (!a.terpenes || !a.terpenes.length) return 1
        if (!b.terpenes || !b.terpenes.length) return -1

        const aChemical = a.terpenes?.find((chemical) => chemical.name === chemicalName)

        const bChemical = b.terpenes?.find((chemical) => chemical.name === chemicalName)

        if (parseFloat(aChemical?.pct) < parseFloat(bChemical?.pct)) return 1
        if (parseFloat(aChemical?.pct) > parseFloat(bChemical?.pct)) return -1
        return 0
      })
      this.products = [...sortedProducts]
      const b = this.products[0].title
      console.log('changed?', a, b)
    },
    clearSelectedSizeFilters() {
      this.checkedVariants = []
    },
    resetFilters() {
      this.selectAllSizeFilters()
      this.selectAllVendorFilters()
    },
    selectAllSizeFilters() {
      this.checkedVariants = [...this.normalizedVariants]
    },
    selectAllVendorFilters() {
      this.checkedVendors = [...this.vendors]
    },
    sortProducts(property) {
      console.log('sortProducts called')
      let sortOrder = 1
      if (property[0] === '-') {
        sortOrder = -1
        property = property.substr(1)
      }
      return function (a, b) {
        const result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0
        return result * sortOrder
      }
    },
    normalizeVariants() {
      const variants = []

      this.products.forEach((product) => {
        if (!product.variants || product.variants.length === 0 || product.variants[0] === 'CBD Type 3') {
          return
        }

        product.variants.forEach((variant) => {
          if (!variant) return

          if (!variants.includes(variant)) {
            variants.push(variant)
          }
        })
      })

      variants.sort(this.sortByParseFloat)

      this.checkedVariants = [...variants]
      this.normalizedVariants = [...variants]
    },
    normalizeVendors() {
      const vendors = []

      this.products.forEach((product) => {
        if (!product.image || !product.variants || product.variants.length === 0 || product.variants[0] === 'CBD Type 3') {
          return
        }

        product.variants.forEach((variant) => {
          if (!variant) return

          if (!vendors.includes(product.vendor)) {
            vendors.push(product.vendor)
          }
        })
      })

      vendors.sort()
      this.vendors = [...vendors]
      this.checkedVendors = [...vendors]
    },
    sortByParseFloat(a, b) {
      const aNumber = parseFloat(a)
      const bNumber = parseFloat(b)
      if (aNumber < bNumber) return -1
      if (aNumber > bNumber) return 1
      return 0
    },
    toggleSelectedVariant(variant) {
      if (this.checkedVariants.find((element) => element === variant)) {
        this.checkedVariants.splice(this.checkedVariants.indexOf(variant), 1)
      } else {
        this.checkedVariants.push(variant)
      }
    },
    toggleSelectedVendor(vendor) {
      if (this.checkedVendors.find((element) => element === vendor)) {
        this.checkedVendors.splice(this.checkedVendors.indexOf(vendor), 1)
      } else { this.checkedVendors.push(vendor) }
    }
  }
})
