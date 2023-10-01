<template>
  <div v-if="!ageGate">
    <div class="age-gate-overlay"></div>
    <div class="age-gate-container">
      <img src="/apple-touch-icon.png" alt="DankSpider.com" />
      <p>Are you 21 or older?</p>
      <ul>
        <li @click="setAgeGate(true)" class="enter shadowy-button yes" role="button"><span
            class="text">YES</span><span>Let Me In</span>
        </li>
        <li @click="exitApp()" class="enter shadowy-button no" role="button"><span class="text">NO</span><span>Get
            Me Out</span></li>
      </ul>
    </div>
  </div>
  <div v-else>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'AgeGate',
  data() {
    return {
      ageGate: false
    }
  },
  mounted() {
    this.checkAgeGate();
  },
  methods: {
    checkAgeGate() {
      const ageGate = localStorage.getItem('ageGate');
      if (ageGate === 'true') {
        this.ageGate = true;
        this.enableScroll();
      } else {
        this.ageGate = false;
        this.disableScroll();
      }
    },
    setAgeGate(value) {
      localStorage.setItem('ageGate', value);
      this.ageGate = true;
      this.enableScroll();
    },
    exitApp() {
      window.location.href = 'https://www.google.com';
    },
    disableScroll() {
      document.body.style.overflow = 'hidden';
    },
    enableScroll() {
      document.body.style.overflow = 'auto';
    }
  }
}
</script>

<style scoped>
.age-gate-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9998;
}

.age-gate-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  padding: 20px;
  text-align: center;
  z-index: 10000;
}

.age-gate-buttons {
  margin-top: 20px;
}

ul {
  display: flex;
  flex-wrap: wrap;
  margin: 0;
  list-style-type: none;
  padding-left: 0;
}

ul li {
  display: inline-block;
  font-weight: 300;
  margin-bottom: 10px;
  margin-left: 10px;
  margin-right: 0px;
  padding: 5px 10px;
  border-radius: 20px;
  background-color: #aaa;
  color: #eee;
  cursor: pointer;
}

ul li.shadowy-button {
  font-weight: 400;
}

ul li.shadowy-button.selected,
ul li.selected {
  color: #242424;
  font-weight: 600;
  background-color: #fff;
  margin-left: 0px;
  margin-right: 10px;
}

li span {
  white-space: nowrap;
}

ul li::after {
  display: block;
  content: attr(title);
  font-weight: 700;
  height: 1px;
  color: transparent;
  overflow: hidden;
  visibility: hidden;
}

.yes {
  background-color: #66b046;
  color: #fff;
}

.no {
  background-color: #ac3a3a;
  color: #fff;
}
</style>