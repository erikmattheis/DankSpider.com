<template>
  <div>
    <a href="#" @click="toggleExpanded()">
      <font-awesome-icon :icon="['fas', 'bars']" />
    </a>
  </div>
</template>

<script>

export default {
  name: 'Menu',
  data() {
    return {
      disabled: false,
      isEpanded: false
    };
  },
  methods: {
    toggleExpanded() {
      this.expanded = !this.expanded;
    },
  },
  mounted() {

  },
};
</script>

<style scoped>
a {
  font-size: 2rem;
  color: #eee;
  text-decoration: none;
  margin-left: 40px;
}
</style>