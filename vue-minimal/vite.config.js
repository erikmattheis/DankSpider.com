import vue from '@vitejs/plugin-vue'
import vike from 'vike/plugin'
import { fileURLToPath, URL } from 'node:url'

export default {
  plugins: [vue(), vike()],
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
