import { createApp } from 'vue'
import { createPinia } from 'pinia';
import VueGtag from "vue-gtag";

import App from './App.vue'
import router from './router';

const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.use(pinia);
app.use(VueGtag, {
  config: {
    appName: 'DankSpider',
    pageTrackerScreenviewEnabled: true,
    id: "G-6VS0E4L3NDD",
  },
}, router);

app.mount('#app');