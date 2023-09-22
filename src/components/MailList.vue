<template>
  <div class="expanding-nav" :class="{ 'expanded': expanded }">
    <div class="expanding-nav-header account">
      <a href="#" @click="toggleExpanded()">
        <font-awesome-icon :icon="['fas', 'user']" />
      </a>
    </div>
    <form>
      <input type="email" v-model="email" :disabled="disabled" />
      <button @click="addEmail"></button>
    </form>
  </div>
</template>

<script>
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue } from 'firebase/database';

const firebaseConfig = {
  authDomain: "dankspider-75eb9.firebaseapp.com",
  databaseURL: "https://dankspider-75eb9-default-rtdb.firebaseio.com",
  projectId: "dankspider-75eb9",
  storageBucket: "dankspider-75eb9.appspot.com",
  messagingSenderId: "698229481619",
  appId: "1:698229481619:web:565da194556510cc696d66",
  measurementId: "G-1R8ZDWL3XJ"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default {
  name: 'MailList',
  data() {
    return {
      email: '',
      emails: [],
      disabled: false,
      expanded: false,
      isEpanded: false
    };
  },
  methods: {
    addEmail() {
      const emailRef = ref(db, 'emails');
      const email = this.email;
      push(emailRef, email);
      this.disabled = true;
    },
    toggleExpanded() {
      this.expanded = !this.expanded;
    },
  },
  mounted() {

  },
};
</script>

<style scoped>
.label {
  font-variant: small-caps;
  margin-right: 0.5rem;
}

.expanding-nav {
  position: relative;
  overflow: hidden;
  transition: max-height 3s linear;
  height: 35px;
  transform: translateZ(0)
    /* set the initial height of the drawer */
}

.expanding-nav.expanded {
  height: min-content;
  /* set the expanded height of the drawer */
}

.expanding-nav-header {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #eee;
  cursor: pointer;
}

.expanding-nav-content {
  padding: 10px;
}

form {
  /* This bit sets up the horizontal layout */
  display: flex;
  flex-direction: row;

  /* This bit draws the box around it */
  border: 1px solid grey;

  /* I've used padding so you can see the edges of the elements. */
  padding: 10px;
}

input {
  /* Tell the input to use all the available space */
  flex-grow: 2;
  /* And hide the input's outline, so the form looks like the outline */
  border: none;
}

:focus:not(:focus-visible) {
  outline: none !important
}

button {
  /* Just a little styling to make it pretty */
  border: 1px solid blue;
  background: blue;
  color: white;
}
</style>