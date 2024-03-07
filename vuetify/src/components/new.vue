<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" sm="6" md="4" lg="3" v-for="(item, index) in items" :key="item.title">
        <v-card>
          <v-img :src="item.image" alt="Placeholder" />
          <v-card-title> {{ item.title }} </v-card-title>
          <v-card-subtitle> {{ item.vendor }} </v-card-subtitle>
          <v-card-text>
            Cannabinoids: {{ item.cannabinoids?.length }} Terpenes: {{ item.terpenes?.length }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'CardList',
  data: () => ({
    items: [
      { title: 'Item 1', vendor: 'Vendor 1', image: 'https://placekitten.com/200/300' },
      // ...
    ],
  }),
}
</script>