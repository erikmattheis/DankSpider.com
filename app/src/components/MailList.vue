<template>
  <div>
    <a href="#" @click.prevent="toggleExpanded()">
      <font-awesome-icon :icon="['fas', 'user']" />
    </a>
    <div class="modal" v-if="expanded">
      <div class="modal-backdrop" @click.prevent="toggleExpanded()" />
      <div class="modal-content">
        <form @submit.prevent v-if="!successMessage">
          <p>Tell me when new features are added.</p>
          <div class="container">
            <input @keydown.enter.prevent type="email" v-model="email" :disabled="disabled" />
            <button @click.prevent="addEmail">Email me</button>
          </div>
        </form>
        <div v-else class="container-column">
          <p>Thanks for signing up!</p>

          <button @click.prevent="toggleExpanded()">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'MailList',
  data() {
    return {
      email: '',
      emails: [],
      disabled: false,
      successMessage: false,
    };
  },
  props: {
    expanded: Boolean,
  },
  methods: {
    async addEmail() {
      const response = await axios.post('/.netlify/functions/email-signup', {
        email: this.email
      });

      this.successMessage = await response.data.response;
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


a:link {
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

.container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.container-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

input {
  flex: 1;
  border-right: 0;
}

button {
  white-space: nowrap;
}

:focus:not(:focus-visible) {
  outline: none !important
}
</style>