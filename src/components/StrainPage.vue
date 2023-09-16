<!-- strainCard.vue -->
<template>
  <div class="strain-page page">
    <div v-if="strain">
      <h2>{{ strain.title }}</h2>
      <p v-for="(p, i) in strain.paragraphs" :key="i">
        {{ p }}
      </p>
    </div>
  </div>
</template>

<script>
import jsonData from '../assets/data/strains.json';
export default {
  data() {
    return {
      strains: [],
      strain: {},
    }
  },
  props: {
    strainName: {
      type: String,
      required: true,
      default: 'Northern Lights',
    },
  },
  created() {
    this.strains = jsonData;
    this.strain = this.strains.find((strain) => { return strain.title === this.strainName; });
  },
  methods: {
  },
};
</script>

<style scoped></style>
