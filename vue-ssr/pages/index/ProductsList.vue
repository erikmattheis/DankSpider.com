<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" sm="12" md="6" lg="4" v-for="(item, index) in items" :key="index">
        <v-card>

          <a :href="item.url">
            <v-img height="200" :src="item.image" alt="Placeholder" />
            <v-card-title> {{ item.title }} </v-card-title>
            <v-card-subtitle> {{ item.vendor }} </v-card-subtitle>
          </a>

          <v-list dense>
            <v-item-group>
              <v-list-item role="listitem" v-for="(cannabinoid, index) in item.cannabinoids" :key="index">
                  <div>{{ cannabinoid.pct }}</div>
                  <v-progress-linear role="progressbar" :aria-valuenow="cannabinoid.pct * 10" :model-value="cannabinoid.pct * 10" color="green" height="25"><span class="text-body-2 smaller">{{ cannabinoid.name }}</span></v-progress-linear>
              </v-list-item>
            </v-item-group>
            <v-item-group>
              <v-list-item role="listitem" v-for="(terpene, index) in item.terpenes" :key="index">
                  <div>{{ terpene.pct }}</div>
                  <v-progress-linear role="progressbar" :aria-valuenow="terpene.pct * 10" :model-value="terpene.pct * 10" color="pink" height="25"><span class="text-body-2 smaller">{{ terpene.name }}</span></v-progress-linear>
              </v-list-item>
            </v-item-group>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

export default {
  name: 'ProductsList',
  data() {
    return {
      items: this.pageContext.items,
    };
  },
  pageContext: {
      type: Object,
      required: true,
    },
  props: {
    cannabinoidOrder: {
      type: Array,
      default: () => [],
    },
    terpeneOrder: {
      type: Array,
      default: () => [],
    }
  },
  watch: {
    cannabinoidOrder: function (newVal, oldVal) {
      this.items = this.items.sort((a, b) => {
      const aCannabinoid = a.cannabinoids?.find(c => c.name === newVal[0]);
      const bCannabinoid = b.cannabinoids?.find(c => c.name === newVal[0]);
      return Number(aCannabinoid ? aCannabinoid.pct : 0) - Number(bCannabinoid ? bCannabinoid.pct : 0);
      });
    },
    terpeneOrder: function (newVal, oldVal) {
      this.items = this.items.sort((a, b) => {
      const aTerpene = a.terpenes?.find(c => c.name === newVal[0]);
      const bTerpene = b.terpenes?.find(c => c.name === newVal[0]);
      return Number(aTerpene ? aTerpene.pct : 0) - Number(bTerpene ? bTerpene.pct : 0);
      });
    },
  },
  methods: {
    // get the selected cannabinoid
    // get the selected terpene
  }
} 
</script>

<style scoped>

.smaller {
  font-size: 0.7rem;
}

a {
  text-decoration: none;
  color: initial
}


</style>