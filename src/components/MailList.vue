<template>
  <div>
    <div class="account" v-if="!expanded">
      <div @click="toggleExpanded">
        <font-awesome-icon :icon="['fas', 'user']" />
      </div>
    </div>
    <div v-else>
      <input type="email" v-model="email" :disabled="disabled" />
      <button @click="addEmail">Join Beta</button>
      {{ emails }}
    </div>
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
    };
  },
  methods: {
    addEmail() {
      const emailRef = ref(db, 'emails');
      const email = this.email;
      push(emailRef, email);
      this.disabled = true;
    },
  },
  toggleExpanded() {
    this.expanded = !this.expanded;
  },
  mounted() {

  },
};
</script>

<style></style>