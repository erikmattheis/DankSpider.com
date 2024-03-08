<template>
  <v-container fluid>cannabinoidOrder: {{ cannabinoidOrder }} terpeneOrder: {{ terpeneOrder }}  
    <v-row>
      <v-col cols="12" sm="12" md="6" lg="4" v-for="(item, index) in items" :key="index">
        <v-card>
          <v-row>
            <v-col>
              <a :href="item.url">
                <v-img height="200" :src="item.image" alt="Placeholder" />
                <v-card-title> {{ item.title }} </v-card-title>
                <v-card-subtitle> {{ item.vendor }} </v-card-subtitle>
              </a>
            </v-col>
          </v-row>
          <v-list dense>
            <v-item-group>
              <v-list-item v-for="(cannabinoid, index) in item.cannabinoids" :key="index">
                  <div>{{ cannabinoid.pct }}</div>
                  <v-progress-linear :model-value="cannabinoid.pct * 10" color="green" height="25"><span class="text-body-2 smaller">{{ cannabinoid.name }}</span></v-progress-linear>
              </v-list-item>
            </v-item-group>
            <v-item-group>
              <v-list-item v-for="(terpene, index) in item.terpenes" :key="index">
                  <div>{{ terpene.pct }}</div>
                  <v-progress-linear :model-value="terpene.pct * 10" color="pink" height="25"><span class="text-body-2 smaller">{{ terpene.name }}</span></v-progress-linear>
              </v-list-item>
            </v-item-group>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { products } from '../assets/data/products.json'
export default {
  name: 'CardList',
  data() {
    return {
      items: products,
    };
  },
  props: {
    cannabinoidOrder: {
      type: Array,
      default: () => [],
    },
    terpeneOrder: {
      type: Array,
      default: () => [],
    },
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