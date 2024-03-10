import vue from '@vitejs/plugin-vue'
import vike from 'vike/plugin'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default {
  base: '/',
  build: {
    rollupOptions: {
      external: ['vuetify/lib'],
    },
  },
  plugins: [vue({ template: { transformAssetUrls } }), vuetify(), vike()]
}
