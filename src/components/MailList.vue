<template>
  <div>
    <a href="#" @click="toggleExpanded()">
      <font-awesome-icon :icon="['fas', 'user']" />
    </a>
    <div class="modal" v-if="expanded">
      <div class="modal-backdrop" @click="toggleExpanded()" />
      <div class="modal-content">
        <form @submit.prevent="addEmail">
          <p>Tell me when we add new features.</p>
          <input @keydown.enter.prevent type="email" v-model="email" :disabled="disabled" />
          <button @click="addEmail">Sign Up for Updates</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
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
    async addEmail() {
      const response = await fetch('/.netlify/functions/build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: this.email }),
      });
      const data = await response.json();
      console.log('response', data);
    },
    toggleExpanded() {
      this.expanded = !this.expanded;
    },
  },
};
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9997;
}

.modal-content {
  background-color: #fff;
  color: var(--dark-green);
  padding: 20px;
  z-index: 9998;
}

a {
  font-size: 2rem;
  color: #eee;
  text-decoration: none;
  margin-right: 40px;
}

input,
button {
  border-radius: 0;
  border: 1px solid #ccc;
  padding: 5px;
}

input {
  border-right: 0;
}

:focus:not(:focus-visible) {
  outline: none !important
}
</style>