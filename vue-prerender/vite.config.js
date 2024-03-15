import vue from '@vitejs/plugin-vue'
import vike from 'vike/plugin'

const config = {
  ssr: {
    // Add problematic npm packages here
    noExternal: ['vuetify']
  },
  plugins: [
    vike({prerender: true}),
    vue({
      include: [/\.vue$/]
    }),
  ]
}

export default config



