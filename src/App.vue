<template>
  <div class="app">
    <AgeGate />
    <h3 class="band"><span>Updated {{ updatedAt }}</span></h3>
    <TimeBackground />
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
import { useSpiderStore } from './store';
import AgeGate from './components/AgeGate.vue';
import TimeBackground from './components/TimeBackground.vue';


export default {
  name: 'DankSpider',
  components: {
    AgeGate,
    TimeBackground
  },
  data() {
    return {
      store: null
    };
  },
  async created() {
    this.store = useSpiderStore();
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
    updatedAt() {
      return this.getFormattedDate(this.store.updatedAt);
    },
  },

  methods: {
    getFormattedDate(timestamp) {
      const date = new Date(timestamp);
      const options = {
        weekday: 'long',
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

h3.band {
  background-color: #003a00;
  color: #eee;
  font-weight: 700;
  width: 300%;
  text-align: center;
  margin-top: 0;
  padding: 5px;
}

.shadowy {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: .25rem;
  box-shadow: rgba(0, 0, 0, 0.015) 0 1px 3px 0;
}

.shadowy-button {
  background-color: #FFFFFF;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: .25rem;
  box-shadow: rgba(0, 0, 0, 0.02) 0 1px 3px 0;
  color: #999;
  cursor: pointer;
  display: inline-flex;
  font-weight: 700;
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

h3::before {
  content: "";
  display: block;
  position: absolute;
  top: 0;
  right: 0;
  width: 50px;
  height: 50px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1' x='0px' y='0px' viewBox='0 0 100 125' style='0 0 100 100;' xml:space='preserve'%3E%3Cpath fill='%23006400' d='M91.1732559,65.2123337c0.1885376-0.1524048,0.111145-0.4525146-0.1275635-0.494812  c-2.9918823-0.5293579-17.0772705-2.4012451-32.7253418,5.6477661  c22.6732178-16.1123657,29.2202148-37.7199097,30.3676147-42.2001953c0.086731-0.338501-0.2612305-0.6188354-0.5735474-0.4620972  c-4.1758423,2.0952148-24.262207,13.2840576-35.1105957,39.4271851c9.2589111-30.4700928-0.4328613-54.4731445-2.5964966-59.2218018  c-0.1602173-0.3516235-0.6544189-0.3516235-0.8146362,0c-2.1636353,4.7486572-11.8554077,28.751709-2.5964966,59.2218018  C36.1478043,40.9870529,16.0614395,29.7982101,11.8855972,27.7029953c-0.3123169-0.1567383-0.6602783,0.1235962-0.5735474,0.4620972  c1.1473999,4.4802856,7.694397,26.0878296,30.3676147,42.2001953c-15.6481323-8.0490112-29.7334595-6.177124-32.7253418-5.6477661  c-0.2387085,0.0422974-0.3161011,0.3424072-0.1276245,0.494812C11.4750137,67.353569,25.5076675,77.7090378,46.8480606,75.90728  c-13.1650391,1.8064575-20.4822388,9.762207-21.8703613,11.4136353c-0.1015625,0.1207275-0.0148315,0.3029175,0.1428833,0.300293  c2.2753296-0.038147,14.1558228-0.7643433,24.234375-11.3418579L48.961647,92.0820847c0,0,0.3317261,0.2732544,1.0383301,0.2732544  c0.706665,0,1.0383911-0.2732544,1.0383911-0.2732544l-0.1915283-15.5884399  c10.0346069,10.3762207,21.7724609,11.0896606,24.0325928,11.1275635c0.1577148,0.0026245,0.2444458-0.1795654,0.1428833-0.300293  c-1.3881226-1.6514282-8.7053223-9.6071777-21.8703613-11.4136353  C74.4923477,77.7090378,88.5249405,67.353569,91.1732559,65.2123337z M49.3705215,75.6510544  c-0.1087036,0.0077515-0.2131348,0.0205078-0.321167,0.0291138c0.1072998-0.0130005,0.2138062-0.0247803,0.3214722-0.0383911  L49.3705215,75.6510544z M50.8367081,75.6698532l-0.000061-0.0032959c0.0380859,0.0046387,0.0759888,0.0089722,0.1140137,0.0136108  C50.9123306,75.6770554,50.8750992,75.6727829,50.8367081,75.6698532z%3C/path%3E%3C/svg%3E");
  transform: rotate(45deg);
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
