import { createRouter, createWebHistory } from 'vue-router'
import ProductPage from './components/ProductPage.vue'
import NewsPage from './components/NewsPage.vue'
import TerpenesPage from './components/TerpenesPage.vue';
import TerpenePage from './components/TerpenePage.vue';
import StrainsPage from './components/StrainsPage.vue'
import StrainPage from './components/StrainPage.vue'
import THCAPage from './components/THCAPage.vue'
import test from './components/test.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'ProductPage',
      component: ProductPage
    },
    {
      path: '/news',
      name: 'NewsPage',
      component: NewsPage
    },

    {
      path: '/terpenes',
      name: 'TerpenesPage',
      component: TerpenesPage,
    },
    {
      path: '/terpene/:terpeneName',
      name: 'TerpenePage',
      component: TerpenePage,
    },
    {
      path: '/strains',
      name: 'StrainsPage',
      component: StrainsPage
    },
    {
      path: '/strains/grapefruit',
      name: 'StrainPageGrapefruit',
      component: StrainPage,
      props: {
        strainName: 'Grapefruit'
      }
    },
    {
      path: '/strains/blueberry',
      name: 'StrainPageBlueberry',
      component: StrainPage,
      props: {
        strainName: 'Blueberry'
      }
    },
    {
      path: '/strains/northern-lights',
      name: 'StrainPageNorthernLights',
      component: StrainPage,
      props: {
        strainName: 'Northern Lights'
      }
    },
    {
      path: '/strains/durban-poison',
      name: 'StrainPageDurbanPoison',
      component: StrainPage,
      props: {
        strainName: 'Durban Poison'
      }
    },
    {
      path: '/information/THCA',
      name: 'THCAPage',
      component: THCAPage
    },
    {
      path: '/test',
      name: 'test',
      component: test
    }
  ]
})

export default router
