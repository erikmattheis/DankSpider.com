
  <!--
0. Analytics X
1. Lazy images X
2. Email X
3. More vendors
4. Better filter UI
  add price
  add sorting
  mobile navigation

  */-->
<template>
  <div class="app">
    <AgeGate />
    <BigLogo />
    <router-view />
    <Navigation />
  </div>
</template>




<script>
import AgeGate from './components/AgeGate.vue';
import Navigation from './components/Navigation.vue';
import BigLogo from './components/BigLogo.vue';

export default {
  name: 'DankSpider',
  components: {
    AgeGate,
    Navigation,
    BigLogo,
  },
  data() {
    return {
      store: null,
      position: 0,
    };
  }
}
</script>

<style>
body {
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* min-height: 100vh; */
  background-color: #eee;
  color: #333;
}

#app {
  display: flex;
  justify-content: center;
}

.app {
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
}

.shadowy {
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

.app {
  margin: 0 auto;
}

.app,
.page {
  width: 100%;
}

a span,
a span:hover,
a span:visited,
a span:focus,
a span:active
a,
a:hover,
a:visited,
a:focus,
a:active {
  color: #fff;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

li.selected a {
  color: #f71c08 ;
}

@media (min-width: 768px) {
  .app {
    margin: 0 10px;
    width: 720px;
  }
}

@media (min-width: 992px) {
  .app {
    width: 720px;
  }
}

@media (min-width: 1200px) {
  .app {
    width: 1080px;
  }
}


@media (min-width: 1400px) {}
</style>