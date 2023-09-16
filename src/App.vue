<template>
  <div class="app">
    <navigation />
    <router-view />
  </div>
</template>

<script>
import axios from 'axios';
import Navigation from './components/Navigation.vue';


export default {
  name: 'DankSpider',
  components: {
    Navigation,
  },
  data() {
    return {
    };
  },
  async created() {

    if (false) {
      try {

        const result = await axios.post('/.netlify/functions/build', {

        });

        console.log('result building products', result);

      }

      catch (error) {
        console.log('error building products', error);
      }
    }

  },

  computed: {

  },

  methods: {

  }
}
</script>

<style>
:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

body {
  margin: 0;
  display: flex;
  place-items: start;
  min-height: 100vh;
}

#app {
  margin: 0 auto;
}

.page {
  /* adjust this value to match the width of your cards */
  margin: 0 auto;
}

.app {
  margin: 0 2px;
  width: 360px;
}

@media (min-width: 768px) {
  .app {
    margin: 0 10px;
    width: 720px;
  }
}

@media (min-width: 992px) {
  .app {
    width: 960px;
  }
}

@media (min-width: 1200px) {
  .app {
    width: 1290px;
  }
}


@media (min-width: 1400px) {}
</style>
