import vue from '@vitejs/plugin-vue'
import md from 'unplugin-vue-markdown/vite'
import vike from 'vike/plugin'

const config = {
  ssr: {
    // Add problematic npm packages here
    noExternal: ['vuetify']
  },
  plugins: [
    vike(),
    vue({
      include: [/\.vue$/, /\.md$/]
    }),
    md({})
  ]
}

export default config



