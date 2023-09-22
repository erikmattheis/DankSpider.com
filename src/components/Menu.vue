<template>
  <div><font-awesome-icon :icon="['fas', 'chevron-down']" />
    <div class="expanding-nav" :class="{ 'expanded': isExpanded }">
      <div class="expanding-nav-header">
        <a href="#" @click="toggleExpanded()">
          <font-awesome-icon :icon="['fas', 'fa-bars']" />
        </a>
      </div>
      <form>
        <input type="email" v-model="email" :disabled="disabled" />
        <button @click="addEmail"></button>
      </form>
    </div>
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

<style></style>