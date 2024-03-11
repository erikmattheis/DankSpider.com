import vue from '@vitejs/plugin-vue'
import ssr from 'vike/plugin'

export default {
  plugins: [vue(), ssr()],
  ssr: { noExternal: ['vuetify'] }
}
