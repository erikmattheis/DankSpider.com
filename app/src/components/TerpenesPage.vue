<!-- strainCard.vue -->
<template>
  <div class="terpene-page page">
    <div class="info">
      <h2>Terpenes</h2>
      <p>Here are some terpenes that commonly occur in cannabis.</p>

      <p>Terpenes are like the natural perfume makers of the plant world. They're the tiny, smelly molecules that plants
        use to show off their unique scents and flavors. It's like a plant's way of saying, 'Hey, check out my cool
        aroma!' So, terpenes are like the plant's fancy cologne, but for our noses, and they make everything smell and
        taste different, like a spice rack for nature.</p>

      <ul>
        <li v-for="terpene in terpenes"><router-link :to="{ name:'TerpenePage',  params: {terpeneName:terpene.name} }">{{ terpene.name }}</router-link></li>
      </ul>
    </div>

  </div>
</template>

<style>
a:link,
a:visited,
a:hover,
a:active {
  color: #000;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>



<script>
import terpenes from '../assets/data/terpenes.json';
export default {
  data() {
    return {
      terpenes:terpenes.filter((terpene) => { return terpene.name }),
    }
  },
  created() {

  },
  methods: {
  },
};
</script>

<style scoped>
.strain-page {
  width: 100%;
  display: block;
  margin: 20px;
  padding: 0;
}

.info {
  width: 100%;
}
</style>
