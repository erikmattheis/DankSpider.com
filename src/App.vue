<template>
  <div class="app">
    <AgeGate />
    <h3>Updated 9/16 2:34 am</h3>
    <navigation />
    <router-view />
  </div>
</template>



<script>

/*
fix highlighted size
add price
mailing list
deploy
add sorting
more vendors
mobile navigation
more google events
add dynamic updated date
*/

import axios from 'axios';
import AgeGate from './components/AgeGate.vue';
import Navigation from './components/Navigation.vue';

export default {
  name: 'DankSpider',
  components: {
    AgeGate,
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
    getFormattedDate(timestamp) {
      const date = new Date(timestamp);
      const options = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      };
      return date.toLocaleString('en-US', options);
    }
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
  background-color: #eee;
  color: #333;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 360px;
}

h3 {
  color: #0a0;
}

.shadowy-button {
  background-color: #FFFFFF;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: .25rem;
  box-shadow: rgba(0, 0, 0, 0.02) 0 1px 3px 0;
  color: #999;
  cursor: pointer;
  display: inline-flex;
  font-weight: 600;
  justify-content: center;
  margin: 0;
  padding: calc(.875rem - 1px) calc(1.5rem - 1px);
  position: relative;
  text-decoration: none;
  transition: all 250ms;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  vertical-align: baseline;
  width: auto;
}

.shadowy-button:hover,
.shadowy-button:focus {
  border-color: rgba(0, 0, 0, 0.15);
  box-shadow: rgba(0, 0, 0, 0.1) 0 4px 12px;
  color: rgba(0, 0, 0, 0.65);
}

.shadowy-button:hover {
  transform: translateY(-1px);
}

.shadowy-button:active,
.shadowy-button.router-link-active {
  background-color: #F0F0F1;
  border-color: rgba(0, 0, 0, 0.15);
  box-shadow: rgba(0, 0, 0, 0.06) 0 2px 4px;
  color: rgba(0, 0, 0, 0.65);
  transform: translateY(0);
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
