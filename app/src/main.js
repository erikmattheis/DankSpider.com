import './style.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueGtag from 'vue-gtag'
import VueMeta from 'vue-meta'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faChevronDown,
  faChevronUp,
  faUser,
  faBars,
  faLeaf,
  faFaceGrinStars,
  faStarOfLife,
  faFilter,
  faFilterCircleXmark,
  faRightLong,
  faDownLong,
  faSort
} from '@fortawesome/free-solid-svg-icons'

import App from './App.vue'
import router from './router'

library.add([faChevronDown, faChevronUp, faUser, faBars, faLeaf, faFaceGrinStars, faStarOfLife, faFilter, faFilterCircleXmark, faRightLong, faDownLong, faSort])

const app = createApp(App)
const pinia = createPinia()

app.component('font-awesome-icon', FontAwesomeIcon)

app.use(router)
app.use(pinia)
app.use(VueGtag, {
  config: {
    appName: 'DankSpider',
    pageTrackerScreenviewEnabled: true,
    id: 'G-1R8ZDWL3XJ'
  }
}, router)
app.use(VueMeta)

app.mount('#app')
