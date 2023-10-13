<!-- strainCard.vue -->
<template>
  <div class="terpene-page page">
    <div v-if="terpene">
      <h2>{{ terpene.name }}</h2>
      <p>{{ terpene.aticle }}</p>
    </div>
  </div>
</template>

<script>
import jsonData from '../assets/data/terpenes.json';
export default {
  data() {
    return {
      terpenes: [],
      terpene: {},
    }
  },
  props: {
    terpeneName: {
      type: String,
      required: true,
      default: 'Menthol',
    },
  },
  created() {
    this.terpenes = jsonData;
    this.terpene = this.terpenes.find((terpene) => { return terpene.name === this.terpeneName; });
  },
  methods: {
  },
};
</script>

<style scoped></style>
