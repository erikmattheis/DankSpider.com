<template>
  <div class="product-card page" :style="cardStyle" v-if="product.image">
    <img src="https://placehold.co/80" class="corner" width="80" height="80" />
    <a :href="product.url" :style="linkStyle" class="backdrop">
      <div>
        <img :src="product.image" :alt="product.title" />
      </div>
    </a>
    <div class="info">
      <h3>{{ product.title }}</h3>
      <p><i>{{ product.vendor }}</i></p>
      <ul>
        <li v-for="(variant, i) in product.variants" v-bind:key="i" :title="variant">
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
  },
  methods: {

  },
};
</script>

<style scoped>
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
  top: 0;
  right: 0;
  width: 80px;
  height: 80px;
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
</style>