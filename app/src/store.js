import { defineStore } from 'pinia'
import jsonData from './assets/data/products.json'

export const useSpiderStore = defineStore('spider', {
  id: 'spider',
  state: () => ({
    queryString: '?utm_source=shockingelk%40gmail.com&utm_medium=directory',
    products: jsonData.products,
    updatedAt: jsonData.updatedAt,
    variants: [],
    terpenes: [],
    cannabinoids: [],
    vendors: [],
    checkedVendors: [],
    normalizedVariants: [],
    checkedVariants: [],
    checkedCannabinoids: [],
    checkedTerpenes: [],
    terpenes: [
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
    terpeneNames(state) {
      // unique values in product.terpenes[].name
      const terpenes = new Set()
      state.products.forEach((product) => {
        if (!product.terpenes) return
        product.terpenes.forEach((terpene) => {
          terpenes.add(terpene.name)
        })
      })
      return [...terpenes]
    },
    cannabinoidNames(state) {
      // unique values in product.cannabinoids[].name
      const cannabinoids = new Set()
      state.products.forEach((product) => {
        if (!product.cannabinoids) return
        product.cannabinoids.forEach((cannabinoid) => {
          cannabinoids.add(cannabinoid.name)
        })
      })
      return [...cannabinoids]

    },
    filteredProducts(state) {
      if (!state.products?.filter) return state.products

      const products = state.products.filter((product) => {
        return (this.checkedVendors.includes(product.vendor)
        && product.variants.some((variant) => this.checkedVariants.includes(variant))
        && (product.cannabinoids && product.cannabinoids.some((cannabinoid) => this.checkedCannabinoids.includes(cannabinoid.name)))
        && (product.terpenes && product.terpenes.some((terpene) => this.checkedTerpenes.includes(terpene.name)))
        )
      })
      // products.sort(this.sortProducts('title'))

      return [...products]
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
      const a = this.products[0].title
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
      const b = this.products[0].title
      console.log('changed?', a, b)
    },
    sortProductsByTerpene(chemicalName) {
      console.log('sortProductsByTerpene called', chemicalName)
      const a = this.products[0].title
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
    normalizeCannabinoids() {
      const cannabinoids = []
    
      this.products.forEach((product) => {
        if (!product.cannabinoids || product.cannabinoids.length === 0) {
          return
        }
    
        product.cannabinoids.forEach((variant) => {
          if (!variant) return
    
          if (!cannabinoids.includes(variant)) {
            cannabinoids.push(variant)
          }
        })
      })
    
      cannabinoids.sort(this.sortByParseFloat)
    
      this.checkedCannabinoids = [...cannabinoids]
      this.normalizedCannabinoids = [...cannabinoids]
    },
    normalizeTerpenes() {
      const terpenes = []
    
      this.products.forEach((product) => {
        if (!product.terpenes || product.terpenes.length === 0) {
          return
        }
    
        product.terpenes.forEach((variant) => {
          if (!variant) return
    
          if (!terpenes.includes(variant)) {
            terpenes.push(variant)
          }
        })
      })
    
      terpenes.sort(this.sortByParseFloat)
    
      this.checkedTerpenes = [...terpenes]
      this.normalizedTerpenes = [...terpenes]
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
    toggleSelectedCannabinoid(cannabinoid) {
      if (this.checkedCannabinoids.find((element) => element === cannabinoid)) {
        this.checkedCannabinoids.splice(this.checkedCannabinoids.indexOf(cannabinoid), 1)
      } else {
        this.checkedCannabinoids.push(cannabinoid)
      }
    },
    toggleSelectedTerpene(terpene) {
      if (this.checkedTerpenes.find((element) => element === terpene)) {
        this.checkedTerpenes.splice(this.checkedTerpenes.indexOf(terpene), 1)
      } else {
        this.checkedTerpenes.push(terpene)
      }
    },
    toggleSelectedVendor(vendor) {
      if (this.checkedVendors.find((element) => element === vendor)) {
        this.checkedVendors.splice(this.checkedVendors.indexOf(vendor), 1)
      } else { this.checkedVendors.push(vendor) }
    }
  }
})
