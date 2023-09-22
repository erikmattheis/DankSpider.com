<template>
  <div class="nav">
    <Menu />
    <MailList />
  </div>
</template>

<script>
import Menu from './Menu.vue';
import MailList from './MailList.vue';

export default {
  name: 'Navigation',
  components: {
    MailList,
  },
};

</script>

<style scoped>
.nav {
  display: flex;
  justify-content: space-between;
}
</style>