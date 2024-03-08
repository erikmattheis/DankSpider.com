<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" sm="12" md="6" lg="4" v-for="(item, index) in items" :key="item.title">
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
            <v-list-item-group>
              <v-list-item v-for="(cannabinoid, index) in item.cannabinoids" :key="index">
                <v-list-item-content>
                  <div>{{ cannabinoid.pct }}</div>
                  <v-progress-linear :model-value="cannabinoid.pct * 10" color="green" height="25"><span class="text-body-2 smaller">{{ cannabinoid.name }}</span></v-progress-linear>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
            <v-list-item-group>
              <v-list-item v-for="(terpene, index) in item.terpenes" :key="index">
                <v-list-item-content>
                  <div>{{ terpene.pct }}</div>
                  <v-progress-linear :model-value="terpene.pct * 10" color="pink" height="25"><span class="text-body-2 smaller">{{ terpene.name }}</span></v-progress-linear>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
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
  data: () => ({
    items: products,
  }),
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