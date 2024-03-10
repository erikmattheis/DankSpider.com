import vue from '@vitejs/plugin-vue'
import vike from 'vike/plugin'

import { fileURLToPath, URL } from 'node:url'

/* use  
    "@vue/compiler-sfc": "^3.2.47",
    "@vue/server-renderer": "^3.2.47",
    "vike": "0.4.165",
    "vite": "^5.0.10",
    "vue": "^3.2.47",
    "vuetify": "^3.5.8" */
import vuetify from 'vuetify'



export default {
  plugins: [vue(), vuetify(), vike()],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./', import.meta.url))
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
}
