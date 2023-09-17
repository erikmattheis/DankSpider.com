<template>
  <div v-if="!ageGate">
    <div class="age-gate-overlay"></div>
    <div class="age-gate-container">
      <img src="/apple-touch-icon.png" alt="DankSpider.com" />
      <p>Are you 21 or older?</p>
      <div class="age-gate-buttons">
        <button @click="setAgeGate(true)" class="enter yes" role="button"><span class="text">YES</span><span>Let Me
            In</span></button>
        <button @click="exitApp()" class="enter no" role="button"><span class="text">NO</span><span>Get Me
            Out</span></button>
      </div>
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
  z-index: 9999;
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

/* CSS */
.enter {
  position: relative;
  overflow: hidden;
  display: inline-block;
  padding: 5px;
  text-decoration: none;
  cursor: pointer;
  background: #fff;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  width: 10em;
  height: 3em;
}

.yes {
  border: 1px solid #66b046;
  color: #66b046;
}

.enter.yes::after {
  background-color: #66b046;
}

.no {
  border: 1px solid #ac3a3a;
  color: #ac3a3a;
}

.enter.no::after {
  background-color: #ac3a3a;
}

.enter span:first-child {
  position: relative;
  transition: color 600ms cubic-bezier(0.48, 0, 0.12, 1);
  z-index: 10;
}

.enter span:last-child {
  color: white;
  display: block;
  position: absolute;
  bottom: 0;
  transition: all 500ms cubic-bezier(0.48, 0, 0.12, 1);
  z-index: 100;
  opacity: 0;
  top: 50%;
  left: 50%;
  transform: translateY(225%) translateX(-50%);
  height: 14px;
  line-height: 13px;
}

.enter:after {
  content: "";
  position: absolute;
  bottom: -50%;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: black;
  transform-origin: bottom center;
  transition: transform 600ms cubic-bezier(0.48, 0, 0.12, 1);
  transform: skewY(9.3deg) scaleY(0);
  z-index: 50;
}

.enter:hover:after {
  transform-origin: bottom center;
  transform: skewY(9.3deg) scaleY(2);
}

.enter:hover span:last-child {
  transform: translateX(-50%) translateY(-100%);
  opacity: 1;
  transition: all 900ms cubic-bezier(0.48, 0, 0.12, 1);
}</style>