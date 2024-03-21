import { createSSRApp, h } from 'vue'
import PageLayout from './PageLayout.vue'

//import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/lib/components/index.mjs'
import * as directives from 'vuetify/lib/directives/index.mjs'

const vuetify = createVuetify({
  components,
  directives,
  ssr:true
})

export function createApp() {
  const app = createSSRApp({
    render: () => h(PageLayout),
  })

  app.use(vuetify)

  return { app }
}




