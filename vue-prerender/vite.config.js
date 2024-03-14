import vue from '@vitejs/plugin-vue'
import vike from 'vike/plugin'

const config = {
  plugins: [
    vike({ prerender: true }),
    vue({
      include: [/\.vue$/]
    })
  ],
  // We manually add a list of dependencies to be pre-bundled, in order to avoid a page reload at dev start which breaks Vike's CI
  optimizeDeps: { include: ['cross-fetch'] }
}

export default config