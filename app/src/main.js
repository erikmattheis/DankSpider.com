import './style.css';
import { createApp } from 'vue'
import { createPinia } from 'pinia';
import VueGtag from "vue-gtag";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
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
  faSquareCaretRight,
  faSquareCaretDown,
} from "@fortawesome/free-solid-svg-icons";

library.add([faChevronDown, faChevronUp, faUser, faBars, faLeaf, faFaceGrinStars, faStarOfLife, faFilter, faFilterCircleXmark, faSquareCaretRight, faSquareCaretDown]);

import App from './App.vue'
import router from './router';

const app = createApp(App);
const pinia = createPinia();

app.component('font-awesome-icon', FontAwesomeIcon);

app.use(router);
app.use(pinia);
app.use(VueGtag, {
  config: {
    appName: 'DankSpider',
    pageTrackerScreenviewEnabled: true,
    id: "G-1R8ZDWL3XJ",
  },
}, router);

app.mount('#app');