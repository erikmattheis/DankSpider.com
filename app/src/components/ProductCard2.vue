<template>
  <div class="product-card shadowy page" ref="image">
    <img src="/corner.jpg" class="corner" width="80" height="80" alt="" />
    <div class="corner-text">{{ product.vendor }}</div>

    <a :href="product.url + queryString" class="backdrop" target="_blank">

      <img @load="onImageLoad" v-if="loadImage" v-show="imageLoaded" ref="beauty"
        class="beauty pendulum"
        :src="product.image"
        :alt="product.title" />

      <svg v-if="!imageLoaded" data-v-c74e63d3="" xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        version="1.1" x="0" y="0" viewBox="2.8489999771118164 1.590000033378601 94.3010025024414 96.82013702392578"
        enable-background="new 0 0 100 100" xml:space="preserve" height="70" width="69"
        class="icon-icon-0" data-fill-palette-color="quaternary" id="icon-0">
        <path data-v-c74e63d3=""
          d="M86.547 97.711c0 0-11.271 1.141-18.314-0.102-7.045-1.238-18.269-6.416-18.269-6.416s12.312-1.348 19.447-0.09C76.549 92.363 86.547 97.711 86.547 97.711z"
          fill="green" data-fill-palette-color="quaternary"></path>
        <path data-v-c74e63d3=""
          d="M97.15 70.277c0 0-12.092 10.074-21.166 14.115-9.076 4.041-26.018 6.799-26.018 6.799s13.127-11.113 22.323-15.207C81.484 71.889 97.15 70.277 97.15 70.277z"
          fill="green" data-fill-palette-color="quaternary"></path>
        <path data-v-c74e63d3=""
          d="M89.117 31.125c0 0-6.469 20.878-13.982 32.451C67.621 75.146 49.97 91.178 49.97 91.178s6.885-22.877 14.5-34.602C72.086 44.852 89.117 31.125 89.117 31.125z"
          fill="green" data-fill-palette-color="quaternary"></path>
        <path data-v-c74e63d3=""
          d="M50.117 1.59c0 0 7.436 26.292 7.436 43.537 0 17.246-7.588 46.066-7.588 46.066s-8.356-28.668-8.356-46.144S50.117 1.59 50.117 1.59z"
          fill="green" data-fill-palette-color="quaternary"></path>
        <path data-v-c74e63d3=""
          d="M11.026 31.002c0 0 16.444 14.4 23.958 25.971 7.514 11.572 14.979 34.215 14.979 34.215s-18.096-15.594-25.71-27.32C16.639 52.143 11.026 31.002 11.026 31.002z"
          fill="green" data-fill-palette-color="quaternary"></path>
        <path data-v-c74e63d3=""
          d="M2.849 70.123c0 0 15.577 2.25 24.652 6.289 9.075 4.041 22.463 14.787 22.463 14.787s-17.043-2.32-26.238-6.416C14.529 80.689 2.849 70.123 2.849 70.123z"
          fill="green" data-fill-palette-color="quaternary"></path>
        <path data-v-c74e63d3=""
          d="M13.365 97.582c0 0 10.202-4.93 17.246-6.172 7.044-1.242 19.361-0.217 19.361-0.217s-11.107 5.475-18.244 6.734C24.59 99.188 13.365 97.582 13.365 97.582z"
          fill="green" data-fill-palette-color="quaternary"></path>
      </svg>
    </a>
    <div class="info">
      <h3>{{ product.title }}</h3>
      <ul>
        <li v-for="(variant, i) in product.variants" v-bind:key="i" :title="variant"
          class="variant-name"
          :class="store.variantClasses[variant]">
          <span>{{ variant }}</span>
        </li>
      </ul>
      <h3>Cannabinoids</h3>
      <ul v-for="cannabinoid in product.cannabinoids">
        <li class="chemical cannabinoid">{{ cannabinoid.name }} ({{ cannabinoid.pct }}%)</li>
      </ul>
      <h3>Terpenes</h3>
      <ul v-for="terpene in product.terpenes">
        <li class="chemical terpene">{{ terpene.name }} ({{ terpene.pct }}%)</li>
      </ul>
    </div>
  </div>
  <div class="product-card" v-if="!product.image">

    <div class="info">
      <h2 class="empty">EMPTY</h2>
    </div>

  </div>
</template>

<script>
import { useSpiderStore } from '../store';

export default {
  props: {
    product: Object,
  },
  data() {
    return {
      store: null,
      observer: null,
      loadImage: false,
      imageLoaded: false,
      position: 0,
    };
  },
  created() {
    this.store = useSpiderStore();
  },
  mounted() {
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        this.loadImage = entry.isIntersecting;

        if (this.loadImage) {
          this.observer.unobserve(this.$refs.image);
        }
      }), {
        rootMargin: '500px',
      }
    });

    this.observer.observe(this.$refs.image)
    this.setAnimationValues();

    window.addEventListener('scroll', this.onScroll);
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.onScroll);
  },
  computed: {
    queryString() {
      return this.store.queryString;
    },
  },
  methods: {
    onImageLoad() {
      this.imageLoaded = true;
    },
    setAnimationValues() {
      const beauty = this.$refs.beauty;
      const duration = Math.floor(Math.random() * 5000) + 10000;
      beauty?.style.setProperty('--duration', `${duration}ms`);
      const rotation = 45 + Math.floor(Math.random() * 31) - 13;
      beauty?.style.setProperty('--rotation', `${rotation}deg`);
    },
  },

};
</script>

<style scoped>
.pendulum {
  animation: pendulum var(--duration) ease-in-out infinite;
}

.card-container {
  position: relative;
}

.product-card {

  min-height: 305px;
  display: inline-block;
  text-align: center;
  padding: 0;
  position: relative;
  overflow: hidden;
}

.product-card .corner {
  position: absolute;
  top: -60px;
  right: -60px;
  width: 120px;
  height: 120px;
}

@media (min-width: 900px) {
  .product-card {
    margin: 20px;
    width: 340px;
  }
}

@media (min-width: 1200px) {
  .product-card {
    width: 333px;
  }
}

.corner-text {
  position: absolute;
  top: -25px;
  right: -25px;
  width: 120px;
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  transform: rotate(45deg);
}

.backdrop {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 120px;
  background-color: #fff;
  overflow: hidden;
}

.corner {
  transform: rotate(45deg);
  height: 100px;
}

.beauty {
  transform: rotate(45deg);
  height: 170px;
}

.info {
  background-color: #ddd;
  padding: 5px 0 30px;
  width: 100%;

  min-height: 149px;
}

ul {
  display: flex;
  flex-wrap: wrap;
  margin: 0;
  list-style-type: none;
  padding-left: 10px;
}

ul li {
  display: inline-block;
  margin-bottom: 5px;
  margin-right: 5px;
  padding: 5px 10px;
  border-radius: 0;
}

.cannabinoid {
  background-color: #f71c08;
  color: #fff;
}

.terpene {
  background-color: #9c07b6;
  color: #fff;
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

ul li.selected {
  font-weight: 700;
  background-color: #eee;
  color: #333;
}

li span {
  white-space: nowrap;
}

.empty {
  color: #666;
}

h3,
i {
  color: #333;
}

h3 {
  margin-bottom: 12px;
}

p {
  margin-top: 5px;
}

@keyframes pendulum {
  0% {
    transform: rotate(45deg);
  }

  50% {
    transform: rotate(var(--rotation));
  }

  100% {
    transform: rotate(45deg);
  }
}
</style>