// Nuxt config file
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  build: { analyze: true },
 
  modules: [
    'vuetify-nuxt-module'
  ],
  vuetify: {
  
    moduleOptions: {
      /* module specific options */
   
    },
    vuetifyOptions: {
      /* vuetify options */
      
    },

  },
})