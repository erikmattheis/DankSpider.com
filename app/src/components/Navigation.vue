<template>
  <div class="nav">
    <Menu class="left" />
    <h3 class="center band"><span>Updated {{ updatedString }}</span></h3>
    <a @click.prevent="toggleExpanded" href class="center band">Be a Beta Tester</a>
    <MailList :expanded="expanded" class="right" />
  </div>
</template>

<script>
import { useSpiderStore } from '../store';
import Menu from './Menu.vue';
import MailList from './MailList.vue';

export default {
  name: 'Navigation',
  components: {
    MailList,
    Menu
  },
  data() {
    return {
      store: {},
      expanded: false,
    };
  },
  async created() {
    this.store = useSpiderStore();
  },
  computed: {
    updatedString() {
      return this.store.updatedString;
    },
  },
  methods: {
    toggleExpanded() {
      this.expanded = !this.expanded;
    },
  },
};

</script>

<style scoped>
.nav {
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  background-color: var(--dark-green);
  color: #eee;
  z-index: 100;
}

.band {
  display: flex;
  justify-content: flex-start;
  font-weight: 700;
  margin-top: 0;
  padding: 5px;
  width: 100vw;
}

h3 {
  margin-bottom: 0;
}
</style>