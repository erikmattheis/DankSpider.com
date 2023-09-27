<template>
  <div>
    <h1>{{ message }} <font-awesome-icon :icon="['fas', 'bars']" /></h1>
  </div>
</template>

<script>
import { createPinia } from 'pinia';

const pinia = createPinia();

pinia.state.message = 'Hello, Pinia!';

export default {
  name: 'pinia-text',
  data() {
    return {
      message: pinia.state.message,
    };
  },
};
</script>