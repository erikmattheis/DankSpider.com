<template>
  <div class="app" :class="theme">
    <div class="nav" v-if="showNav">
      <div class="nav-item" v-for="link in links" :key="link.id">
        <a :href="link.url">{{ link.text }}</a>
      </div>
    </div>
    <div class="footer">
      <label for="theme-select">Theme:</label>
      <select id="theme-select" v-model="themeName">
        <option v-for="theme in themes" :value="theme.name">{{ theme.name }}</option>
      </select>
      <button @click="copyCSS">Copy CSS</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      links: [
        { id: 1, url: '#', text: 'Link 1' },
        { id: 2, url: '#', text: 'Link 2' },
        { id: 3, url: '#', text: 'Link 3' },
        { id: 4, url: '#', text: 'Link 4' },
        { id: 5, url: '#', text: 'Link 5' }
      ],
      themes: [
        {
          name: 'Theme 1',
          class: 'theme-1',
          css: `
            .theme-1 {
              background-color: #222;
              color: #fff;
            }
            .theme-1 .nav-item a {
              color: #fff;
            }
          `
        },
        {
          name: 'Theme 2',
          class: 'theme-2',
          css: `
            .theme-2 {
              background-color: #333;
              color: #fff;
            }
            .theme-2 .nav-item a {
              color: #fff;
            }
          `
        },
        {
          name: 'Theme 3',
          class: 'theme-3',
          css: `
            .theme-3 {
              background-color: #444;
              color: #fff;
            }
            .theme-3 .nav-item a {
              color: #fff;
            }
          `
        },
        {
          name: 'Theme 4',
          class: 'theme-4',
          css: `
            .theme-4 {
              background-color: #555;
              color: #fff;
            }
            .theme-4 .nav-item a {
              color: #fff;
            }
          `
        },
        {
          name: 'Theme 5',
          class: 'theme-5',
          css: `
            .theme-5 {
              background-color: #666;
              color: #fff;
            }
            .theme-5 .nav-item a {
              color: #fff;
            }
          `
        }
      ],
      themeName: 'Theme 1',
      showNav: true
    };
  },
  computed: {
    theme() {
      return this.themes.find(theme => theme.name === this.themeName).class;
    }
  },
  methods: {
    copyCSS() {
      const theme = this.themes.find(theme => theme.name === this.themeName);
      navigator.clipboard.writeText(theme.css);
    }
  }
};
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: sans-serif;
}

.nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 1rem;
}

.nav-item {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50%;
  height: 3rem;
  margin: 0.5rem;
  border-radius: 0.5rem;
  background-color: #fff;
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.2);
}

.nav-item a {
  text-decoration: none;
  font-weight: bold;
}

.footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

label {
  margin-right: 0.5rem;
}

select {
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: #fff;
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

button {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background-color: #fff;
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.2);
  cursor: pointer;
}
</style>