/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
// import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'


// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  components: {

  },
  theme: {
    defaultTheme: 'dark'
  },

  global: {
    ripple: false,
    elevation: 2,
    icons: '', // Use 'md' for Material Design Icons,
    // 'fa' for Font Awesome 4 icons
  },




})
