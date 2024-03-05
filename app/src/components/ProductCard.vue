<template>
  <div class="product-card shadowy page"
       ref="image">
    <img src="https://storage.googleapis.com/dank-images/corner.jpg"
         class="corner"
         width="80"
         height="80"
         alt="" />

    <div class="corner-text">{{ product.vendor }}

    </div>
    <a :href="product.url + queryString"
       class="backdrop"
       target="_blank"
       :aria-label="`Buy ${product.title} from ${product.vendor}`">
      <img @load="onImageLoad"
           v-if="loadImage"
           v-show="imageLoaded"
           ref="beauty"
           class="beauty pendulum"
           :src="product.image"
           :alt="product.title" />
      <loading-spinner v-if="!imageLoaded" />
    </a>

    <div class="info">

      <h3>{{ product.title }}</h3>

      <ul class="sizes">
        <li v-for="(variant, i) in product.variants"
            v-bind:key="i"
            :title="variant"
            class="variant-name"
            :class="store.variantClasses[variant]">
          <span>{{ variant }}</span>
        </li>
      </ul>
      <span v-if="product.price"
            class="price">{{ product.price }}</span>
      <span v-if="product.price && product.pricePerGram"
            class="price-per-gram">({{ product.pricePerGram }})</span>

      <div class="assays">

        <div class="assay">

          <h3>Terpenes</h3>

          <ul clss="right">
            <li v-for="terpene in product.terpenes"
                class="chemical terpene"
                :class="isChemicalSelected(terpene)"><router-link
                  :to="{ name: 'TerpenePage', params: { terpeneName: terpene.name } }">
                  <span>{{ terpene.name }} ({{ terpene.pct }}%)</span>
                </router-link>
              </li>
          </ul>

        </div>

        <div class="assay">

          <h3>Cannabinoids</h3>

          <ul clss="right">
            <li v-for="cannabinoid in product.cannabinoids"
                class="chemical cannabinoid"
              :class="isChemicalSelected(cannabinoid)">
              <span>{{ cannabinoid.name }} ({{ cannabinoid.pct }}%)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LoadingSpinner from '../assets/svg/loading-spinner.svg';
import { useSpiderStore } from '../store';

export default {
  name: 'ProductCard',
  props: {
    product: Object,
  },
  components: {
    LoadingSpinner,
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
      const duration = Math.floor(Math.random() * 500) + 1000;
      beauty?.style.setProperty('--duration', `${duration}ms`);
      const rotation = 50 + Math.floor(Math.random() * 31) - 13;
      beauty?.style.setProperty('--rotation', `${rotation}deg`);
    },
    isChemicalSelected(chemical) {
      return this.store.sortByChemical === chemical.name ? 'selected' : '';
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
  padding: 5px 10px 30px 10px;
  width: 100%;
  min-height: 149px;
}

ul {
  display: flex;
  flex-wrap: wrap;
  margin: 0;
  padding: 0;
  list-style-type: none;
}

ul li {
  display: inline-block;
  font-size: 0.8rem;
  margin-bottom: 5px;
  margin-right: 5px;
  padding: 0px 5px;
  border-radius: 0;
}

.right {
  margin-left: 3px;
}

.cannabinoid {
  background-color: #f71c0833;
  color: #000;
  font-weight: 700;
}


a span,
a span:hover,
a span:visited,
a span:focus,
a span:active
a,
li.terpene a:hover,
a span:active {

  color: #fff;
  text-decoration: none;
}

a span:hover {
  text-decoration: none;
}

li.terpene span {

  color: #000;
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
  color: #f71c08;
}

li span {
  white-space: nowrap;
}

.assays {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
}

.assay {
  width: 50%;
}

.assay span {
  text-align: left;
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
}</style>