/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'
import { createRouter, createWebHistory } from 'vue-router'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

const app = createApp(App)

registerPlugins(app)

import CardList from '@/components/CardList.vue'
import ResultsTable from '@/components/ResultsTable.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: CardList },
        { path: '/ResultsTable', component: ResultsTable },
    ],
})

app.use(router)

app.mount('#app')
