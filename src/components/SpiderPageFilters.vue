<template>
  <div class="spider-page">isExpanded:{{ isExpanded }}
    <div class="expanding-nav" :class="{ 'expanded': isExpanded }">
      <div class="expanding-nav-header" @click="isExpanded = !isExpanded">
        <span>Filters</span>
        <i class="fa fa-chevron-down"></i>
      </div>
      <div class="expanding-nav-content">
        <form>
          <!-- form elements go here -->

          <ul>
            <li v-for="(variant, i) in normalizedVariants" :key="i"
              @click="toggleSelected(variant)"
              class="shadowy-button"
              :class="{ selected: checkedVariants.includes(variant) }">
              {{ variant }}
            </li>
          </ul>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { useSpiderStore } from '../store';

export default {
  name: 'SpiderPageFilters',
  data() {
    return {
      variants: [],
      store: null,
      isExpanded: false,
    };
  },
  created() {
    this.store = useSpiderStore();
    this.store.sortProducts('title');
    this.store.normalizeVariants(this.store.variants);

  },
  computed: {
    normalizedVariants() {
      console.log('var', this.store.normalizedVariants);
      return this.store.normalizedVariants;
    },
    checkedVariants() {
      return this.store.checkedVariants;
    }
  },
  methods: {
    toggleSelected(variant) {
      this.store.toggleSelected(variant);
    },
  },
};
</script>

<style scoped>
.spider-page {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
}

ul {
  display: flex;
  flex-wrap: wrap;
  margin: 0;
}

ul li {
  display: block;
  font-weight: 500;
  margin-bottom: 10px;
  margin-right: 5px;
  padding: 5px 10px;
  border-radius: 20px;
  background-color: #aaa;
  color: #eee;
  cursor: pointer;
}

ul li.selected {
  color: #242424;
  background-color: #fff;
}

li span {
  white-space: nowrap;
}

.horizontal-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-left: -20px;
  margin-right: -20px;
}


.expanding-nav {
  position: relative;
  overflow: hidden;
  transition: height 0.3s ease-in-out;
  height: 50px;
  /* set the initial height of the drawer */
}

.expanding-nav.expanded {
  height: 200px;
  /* set the expanded height of the drawer */
}

.expanding-nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #eee;
  cursor: pointer;
}

.expanding-nav-header i {
  transition: transform 0.3s ease-in-out;
}

.expanding-nav.expanded .expanding-nav-header i {
  transform: rotate(180deg);
}

.expanding-nav-content {
  padding: 10px;
  background-color: #fff;
}
</style>