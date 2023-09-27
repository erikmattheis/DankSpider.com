import { createRouter, createWebHistory } from 'vue-router';
import SpiderPage from './components/SpiderPage.vue';
import NewsPage from './components/NewsPage.vue';
import StrainsPage from './components/StrainsPage.vue';
import StrainPage from './components/StrainPage.vue';
import THCAPage from './components/THCAPage.vue';
import NavPreview from './components/NavPreview.vue';
import test from './components/test.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'SpiderPage',
      component: SpiderPage,
    },
    {
      path: '/news',
      name: 'NewsPage',
      component: NewsPage,
    },
    {
      path: '/strains',
      name: 'StrainsPage',
      component: StrainsPage,
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
      component: THCAPage,
    },
    {
      path: '/pinia',
      name: 'pinia-test',
      component: test,
    },
    {
      path: '/nav-preview',
      name: 'NavPreview',
      component: NavPreview,
    },
  ],
});

export default router;