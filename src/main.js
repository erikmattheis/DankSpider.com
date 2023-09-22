import './style.css';
import { createApp } from 'vue'
import { createPinia } from 'pinia';
import VueGtag from "vue-gtag";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faUser
} from "@fortawesome/free-solid-svg-icons";

library.add([faChevronDown, faChevronUp, faUser]);

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
    /* id: "G-6VS0E4L3NDD", */
  },
}, router);

app.mount('#app');