<!-- strainCard.vue -->
<template>
  <div class="strain-page page">
    <div class="info">
      <h2>Strains</h2>
      <p>Here are some of the most popular strains of hemp flower. Click on a strain to learn more about it.</p>

      <ul>
        <li><router-link to="/strains/blueberry">Blueberry</router-link></li>
        <li><router-link to="/strains/durban-poison">Durban Poison</router-link></li>
        <li><router-link to="/strains/northern-lights">Northern Lights</router-link></li>
        <li><router-link to="/strains/grapefruit">Grapefruit</router-link></li>
      </ul>
    </div>

  </div>
</template>



<script>
export default {
  data() {
    return {
      strains: [],
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
