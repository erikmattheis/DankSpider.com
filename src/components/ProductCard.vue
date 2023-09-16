<template>
  <div class="product-card page" :style="cardStyle" v-if="product.image">
    <a :href="product.url" :style="linkStyle" class="backdrop">
      <div>
        <img :src="product.image" alt="Product" />
      </div>
    </a>
    <div class="info">
      <h3>{{ product.title }}</h3>
      <p><i>{{ product.vendor }}</i></p>
      <ul>
        <li v-for="(variant, i) in product.variants" v-bind:key="i">
          {{ variant }}
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

    /*
window.addEventListener('scroll', this.animateBackgroundY);
this.linkStyle = {
  'background-image': `url(${this.product.image})`,
  'backdrop-filter': this.backdropFilterValue,
};

    this.cardStyle = {
      'background-image': `url(${this.product.image})`,
    };

  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.animateBackgroundY);
  },
  */
  },
  methods: {

    animateBackgroundY() {
      const backdrop = document.querySelector('.backdrop');

      if (!backdrop) return;

      const elementHeight = backdrop.height;

      const windowHeight = window.innerHeight;
      if (document.querySelector('.backdrop')) {
        const elementPosition = window.scrollY + backdrop.top;
      }

      if (elementPosition < windowHeight && elementPosition > 0) {
        const percentScrolled = (elementPosition / windowHeight) * 100;
        const percentScrolledReverse = 100 - percentScrolled;
        const backgroundPosition = (percentScrolledReverse * elementHeight) / 100;
        document.querySelector('.backdrop').style.backgroundPositionY = `${backgroundPosition}px`;

      }
    },

  },
};
</script>

<style scoped>
.product-card {
  width: 330px;
  height: 310px;
  display: inline-block;
  margin: 20px;
  padding: 0;
  text-align: center;
  background-color: #eee;
}

.backdrop {
  display: block;
  height: 120px;
  background-size: 300%;
  background-position: center center;
  background-blend-mode: multiply;
  overflow: hidden;
}

.backdrop div {
  width: 100%;
  height: 100%;
  backdrop-filter: blur(5px);
}

img {
  height: 120px;
}

.info {
  background-color: #eee;
  width: 100%;
}

ul {
  display: flex;
  flex-wrap: wrap;
  margin: 0;
}

ul li {
  display: block;
  margin-bottom: 10px;
  margin-right: 5px;
  padding: 5px 10px;
  border-radius: 20px;
  background-color: #333;
  color: #ccc;
  cursor: pointer;
}

ul li.selected {
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
</style>