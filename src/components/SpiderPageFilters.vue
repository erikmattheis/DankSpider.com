<template>
  <div class="spider-page">
    <div class="expanding-nav" :class="{ 'expanded': isExpanded }">
      <div class="expanding-nav-header" @click="isExpanded = !isExpanded">
        <span class="label">Filters</span>
        <font-awesome-icon :icon="['fas', 'chevron-down']" v-if="!isExpanded" />
        <font-awesome-icon :icon="['fas', 'chevron-up']" v-else />
      </div>
      <div class="expanding-nav-content">
        <form>
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
      isExpanded: true,
    };
  },
  created() {
    this.store = useSpiderStore();
    this.store.sortProducts('title');
    this.store.normalizeVariants(this.store.variants);
  },
  computed: {
    normalizedVariants() {
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
  list-style-type: none;
  padding-left: 0;
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


.label {
  font-variant: small-caps;
  margin-right: 0.5rem;
}

.expanding-nav {
  position: relative;
  overflow: hidden;
  transition: max-height 0.3s ease-in-out;
  max-height: 35px;
  /* set the initial height of the drawer */
}

.expanding-nav.expanded {
  max-height: 1000px;
  /* set the expanded height of the drawer */
}

.expanding-nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #eee;
  cursor: pointer;
  justify-content: flex-end;
}

.expanding-nav-header i {
  transition: transform 0.3s ease-in-out;
}

.expanding-nav-content {
  padding: 10px;
}
</style>