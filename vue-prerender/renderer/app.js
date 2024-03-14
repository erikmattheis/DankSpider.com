import { createSSRApp, h } from 'vue'
import PageLayout from './PageLayout.vue'

//import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
})

export function createApp() {
  const app = createSSRApp({
    render: () => h(PageLayout),
  })

  app.use(vuetify)

  return { app }
}



