<template>
  <div class="product-card shadowy page" :style="cardStyle" v-if="product.image">
    <img src="/corner.jpg" class="corner" width="80" height="80" />
    <div class="corner-text">{{ product.vendor }}</div>
    <a :href="product.url" :style="linkStyle" class="backdrop">
      <div class="beauty-wrapper">
        <img class="beauty" :src="product.image" :alt="product.title" :class="{ 'pendulum': true }" />
      </div>
    </a>
    <div class="info">
      <h3>{{ product.title }}</h3>
      <p><i>{{ product.vendor }}</i></p>
      <ul>
        <li v-for="(variant, i) in product.variants" v-bind:key="i" :title="variant" class="variant-name">
          <span>{{ variant }}</span>
        </li>
      </ul>
    </div>
  </div>
  <div class="product-card" v-else>

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
      backdropFilterValue: 'blur(5px)',
      linkStyle: {},
      cardStyle: {},
      store: {},
    };
  },
  mounted() {
    this.store = useSpiderStore();
    this.setAnimationDuration();
  },
  computed: {
    randomRotation() {
      return Math.floor(Math.random() * 11) - 5;
    },
  },
  methods: {
    setAnimationDuration() {
      const beauty = this.$el.querySelector('.beauty');
      const duration = Math.floor(Math.random() * 2000) + 1000;
      beauty.style.setProperty('--duration', `${duration}ms`);
    },
  },
};
</script>

<style scoped>
.beauty-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
}

.beauty {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: center;
}

.pendulum {
  animation: pendulum var(--duration) ease-in-out infinite;
}

.card-container {
  position: relative;

}

.product-card {
  width: 330px;
  height: 310px;
  display: inline-block;
  margin: 20px;
  padding: 0;
  text-align: center;
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

.corner-text {
  position: absolute;
  z-index: 100;
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
  display: block;
  height: 120px;
  background-color: #fff;
  overflow: hidden;
}

.backdrop div {
  width: 100%;
  height: 100%;
}

img {
  transform: rotate(45deg);
  height: 120px;
}

.info {
  background-color: #ddd;
  padding: 5px 0 30px;
  width: 100%;
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
  margin-bottom: 10px;
  margin-right: 5px;
  padding: 5px 10px;
  border-radius: 20px;
  background-color: #cfcfcf;
  color: #dfdfdf;
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
  margin-bottom: 0px;
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