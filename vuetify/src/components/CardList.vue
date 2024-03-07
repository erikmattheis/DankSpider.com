<template>
  <v-container fluid>
    <v-row>
      <v-col cols="2" sm="6" md="4" lg="3" v-for="(item, index) in items" :key="item.title">
        <v-card>
          <v-img height="200" :src="item.image" alt="Placeholder" />
          <v-card-title> {{ item.title }} </v-card-title>
          <v-card-subtitle> {{ item.vendor }} </v-card-subtitle>
          <v-list dense>
            <v-list-item-group>
              <v-list-item v-for="(item, index) in item.cannabinoids" :key="index">
                <v-list-item-content>
                    {{ item.pct }}
                    <v-progress-linear :value="parseFloat(item.pct * 100)" height="20"></v-progress-linear>
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
  name: 'CardLi  st',
  data: () => ({
    items: products,
    ing: [
      { title: 'Item 1', vendor: 'Vendor 1', image: 'https://placekitten.com/200/300' },
      { title: 'Item 2', vendor: 'Vendor 2', image: 'https://placekitten.com/200/300' },
      { title: 'Item 3', vendor: 'Vendor 3', image: 'https://placekitten.com/200/300' },
      { title: 'Item 4', vendor: 'Vendor 4', image: 'https://placekitten.com/200/300' },
      { title: 'Item 5', vendor: 'Vendor 5', image: 'https://placekitten.com/200/300' },
      { title: 'Item 6', vendor: 'Vendor 6', image: 'https://placekitten.com/200/300' },
      { title: 'Item 7', vendor: 'Vendor 7', image: 'https://placekitten.com/200/300' },
      { title: 'Item 8', vendor: 'Vendor 8', image: 'https://placekitten.com/200/300' },
      { title: 'Item 9', vendor: 'Vendor 9', image: 'https://placekitten.com/200/300' },
      { title: 'Item 10', vendor: 'Vendor 10', image: 'https://placekitten.com/200/300' },
      { title: 'Item 11', vendor: 'Vendor 11', image: 'https://placekitten.com/200/300' },
      { title: 'Item 12', vendor: 'Vendor 12', image: 'https://placekitten.com/200/300' },
      { title: 'Item 13', vendor: 'Vendor 13', image: 'https://placekitten.com/200/300' },
      { title: 'Item 14', vendor: 'Vendor 14', image: 'https://placekitten.com/200/300' },
      //   ...
    ],
  }),
}
</script>