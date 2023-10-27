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
    numSortableTerpenes: 0,
    cannabinoids: [],
    numSortableCannabinoids: 0,
    vendors: [],
    checkedVendors: [],
    checkedVariants: [],
    checkedCannabinoids: [],
    checkedTerpenes: [],
    normalizedVariants: [],
    filterByCannabinoids: false,
    filterByTerpenes: false
  }),
  getters: {
    terpeneNames () {
      // unique values in product.terpenes[].name
console.log('this.products', this.products.length)
      if (!this.products) return []

      const terpenes = new Set()
      this.products.forEach((product) => {
        if (!product.terpenes) return
        product.terpenes.forEach((terpene) => {
          terpenes.add(terpene.name)
        })
      })
      return [...terpenes]
    },
    cannabinoidNames () {
      // unique values in product.cannabinoids[].name

      if (!this.products) return []

      const cannabinoids = new Set()
      this.products.forEach((product) => {
        if (!product.cannabinoids) return
        product.cannabinoids.forEach((cannabinoid) => {
          cannabinoids.add(cannabinoid.name)
        })
      })
      return [...cannabinoids]
    },
    filteredProducts () {
      if (!this.products?.filter || !this.checkedCannabinoids?.filter && !this.checkedTerpenes?.filter ) return this.products

      const products = this.products.filter((product) => {
        return (this.checkedVendors.includes(product.vendor) &&
        product.variants.some((variant) => this.checkedVariants.includes(variant)) &&
        (this.checkedCannabinoids.length === this.numSortableCannabinoids.length || (!product.cannabinoids || product.cannabinoids.some((cannabinoid) => this.checkedCannabinoids.includes(cannabinoid.name)))) &&
        (this.checkedTerpenes.length === this.numSortableTerpenes || (!product.terpenes || product.terpenes.some((terpene) => this.checkedTerpenes.includes(terpene.name))))
        )
      })

      return [...products]
    },
    filteredProductsTerpenes () {

      if (!this.filteredProducts) return []

      const terpenes = new Set()

      this.filteredProducts.forEach((product) => {
        if (!product.terpenes) return
        product.terpenes.forEach((terpene) => {
          terpenes.add(terpene.name)
        })
      })
      
      return [...terpenes].sort()
    },
    filteredProductsCannabinoids () {

      if (!this.filteredProducts) return []

      const cannabinoids = new Set()

      this.filteredProducts.forEach((product) => {
        if (!product.cannabinoids) return
        product.cannabinoids.forEach((cannabinoid) => {
          cannabinoids.add(cannabinoid.name)
        })
      })
      
      return [...cannabinoids].sort()
    },
    numProducts () {
      return this.filteredProducts?.filter((product) => product.name !== 'empty').length
    },
    numVendors () {
      if (!this.filteredProducts) return 0
      const uniqueVendors = new Set()
      this.filteredProducts.forEach((product) => {
        if (product.name === 'empty') return
        uniqueVendors.add(product.vendor)
      })
      return uniqueVendors.size
    },
    updatedString () {
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
    variantClasses () {
      const classes = {}
      this.checkedVariants.forEach((variant) => {
        classes[variant] = 'selected'
      })
      return classes
    }
  },
  actions: {
    toggleFilterByCannabinoids () {
      this.filterByCannabinoids = !this.filterByCannabinoids
    },
    toggleFilterByTerpenes () {
      this.filterByTerpenes = !this.filterByTerpenes
    },
    sortProductsByCannabinoid (chemicalName) {
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
    sortProductsByTerpene (chemicalName) {
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
    },
    resetFilters () {
      this.selectAllSizeFilters()
      this.selectAllVendorFilters()
    },
    selectAllVendorFilters () {
      this.checkedVendors = [...this.vendors]
    },
    clearSelectedVendorFilters () {
      this.checkedVendors = []
    },
    selectAllSizeFilters () {
      this.checkedVariants = [...this.normalizedVariants]
    },
    clearSelectedSizeFilters () {
      this.checkedVariants = []
    },
    selectAllCannabinoidFilters () {
      this.checkedCannabinoids = [...this.cannabinoids]
    },
    clearSelectedCannabinoidFilters () {
      this.checkedCannabinoids = []
    },
    selectAllTerpeneFilters () {
      this.checkedTerpenes = [...this.terpenes]
    },
    clearSelectedTerpeneFilters () {
      this.checkedTerpenes = []
    },
    sortProducts (property) {
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
    normalizeVariants () {

      if (!this.products) return

      const variants = []

      this.products.forEach((product) => {
        if (!product.variants || product.variants[0] === 'CBD Type 3') {
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
    normalizeCannabinoids () {

      if (!this.products) return

      const cannabinoids = []

      this.products.forEach((product) => {
        if (!product.cannabinoids) {
          return
        }

        product.cannabinoids.forEach((cannabinoid) => {
          if (!cannabinoid.name) return

          if (!cannabinoids.includes(cannabinoid.name)) {
            cannabinoids.push(cannabinoid.name)
          }
        })
      })

      cannabinoids.sort()
      
      const totalIndex = cannabinoids.findIndex((element) => element === 'Total')
console.log('totalIndex', totalIndex)
      const deltaIndexes = cannabinoids.reduce((acc, element, index) => {
        console.log('element', element);
        if (element.startsWith('∆')) {
          acc.push(index)
        }
        return acc
      }, [])
      console.log('deltaIndexes', deltaIndexes)
      // Move delta members to the front and Total as to beginning
      deltaIndexes.forEach((index) => {
        cannabinoids.unshift(cannabinoids.splice(index, 1)[0])
      }
      )
      console.log('cannabinoids', cannabinoids)
      cannabinoids.unshift(cannabinoids.splice(totalIndex, 1)[0])
      console.log('cannabinoids', cannabinoids)
      this.checkedCannabinoids = [...cannabinoids]
      this.normalizedCannabinoids = [...cannabinoids]
    },
    normalizeTerpenes () {

      if (!this.products) return

      const terpenes = []

      this.products.forEach((product) => {
        if (!product.terpenes) {
          return
        }

        product.terpenes.forEach((terpene) => {
          if (!terpene.name) return

          if (!terpenes.includes(terpene.name)) {
            terpenes.push(terpene.name)
          }
        })
      })

      terpenes.sort()

      this.checkedTerpenes = [...terpenes]
      this.normalizedTerpenes = [...terpenes]
    },
    normalizeVendors () { 

      if (!this.products) return

      const vendors = []

      this.products.forEach((product) => {
        if (!product.vendor) return

        if (!vendors.includes(product.vendor)) {
          vendors.push(product.vendor)
        }
      })
      vendors.sort()

      this.vendors = [...vendors]
      this.checkedVendors = [...vendors]
    },
    sortByParseFloat (a, b) {
      const aNumber = parseFloat(a)
      const bNumber = parseFloat(b)
      if (aNumber < bNumber) return -1
      if (aNumber > bNumber) return 1
      return 0
    },
    toggleSelectedVariant (variant) {
      if (this.checkedVariants.find((element) => element === variant)) {
        this.checkedVariants.splice(this.checkedVariants.indexOf(variant), 1)
      } else {
        this.checkedVariants.push(variant)
      }
    },
    toggleSelectedCannabinoid (cannabinoid) {
      if (this.checkedCannabinoids.find((element) => element === cannabinoid)) {
        this.checkedCannabinoids.splice(this.checkedCannabinoids.indexOf(cannabinoid), 1)
      } else {
        this.checkedCannabinoids.push(cannabinoid)
      }
    },
    toggleSelectedTerpene (terpene) {
      if (this.checkedTerpenes.find((element) => element === terpene)) {
        this.checkedTerpenes.push(terpene)
      } else {
        this.checkedTerpenes.splice(this.checkedTerpenes.indexOf(terpene), 1)
      }
    },
    toggleSelectedVendor (vendor) {
      if (this.checkedVendors.find((element) => element === vendor)) {
        this.checkedVendors.splice(this.checkedVendors.indexOf(vendor), 1)
      } else { this.checkedVendors.push(vendor) }
    }
  }
})
