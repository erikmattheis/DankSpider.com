<!-- strainCard.vue -->
<template>
  <div class="terpene-page page">
    <div v-if="terpene">
      <h2>{{ terpene.name }}</h2>
      <div v-html="terpene.article"></div>
    </div>
  </div>
</template>

<script>
import terpenes from '../assets/data/terpenes.json';
export default {
  data() {
    return {
      terpene: {},
      terpenes: terpenes,
    }
  },
  created() {
    this.terpene = this.terpenes.find((terpene) => { return terpene.name === this.terpeneName; });
  },
  computed: {
    terpeneName() {
      return this.$route.params.terpeneName;
    }
  },
  methods: {
  },
};
</script>

<style scoped></style>
