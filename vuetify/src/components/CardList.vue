<template>
  <v-container class="fill-height">
    <v-responsive class="align-center text-center fill-height">
      <v-infinite-scroll :height="300"
                         :items="items"
                         :onLoad="load">

        <v-row>
          <v-col cols="12" sm="6" md="4" lg="3" v-for="(item, index) in items" :key="item.title">
            <v-card variant="tonal">
              <v-card-subtitle> {{ item.vendor }} </v-card-subtitle>
              <v-card-title> {{ item.title }}</v-card-title>
              <img :src="item.image" alt="Placeholder" />
              <v-card-text>
                Cannabinoids: {{ item.cannabinoids?.length }} Terpenes: {{ item.terpenes?.length }}
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

      </v-infinite-scroll>
    </v-responsive>
  </v-container>
</template>

<script>

export default {
  name: 'CardList',
  data: () => ({
    items: [
      { title: 'Item 1', vendor: 'Vendor 1', },
      { title: 'Item 2', vendor: 'Vendor 2', },
      { title: 'Item 3', vendor: 'Vendor 3', },
      { title: 'Item 4', vendor: 'Vendor 4', },
      { title: 'Item 5', vendor: 'Vendor 5', },
      { title: 'Item 6', vendor: 'Vendor 6', },
      { title: 'Item 7', vendor: 'Vendor 7', },
      { title: 'Item 8', vendor: 'Vendor 8', },
      { title: 'Item 9', vendor: 'Vendor 9', },
      { title: 'Item 10', vendor: 'Vendor 10', },
    ],
  }),
  mounted() {
    this.items = [{ title: 'Item 1', vendor: 'Vendor 1'}, { title: 'Item 2', vendor: 'Vendor 2', }, { title: 'Item 3', vendor: 'Vendor 3', }, { title: 'Item 4', vendor: 'Vendor 4', }, { title: 'Item 5', vendor: 'Vendor 5', }, { title: 'Item 6', vendor: 'Vendor 6', }, { title: 'Item 7', vendor: 'Vendor 7', }, { title: 'Item 8', vendor: 'Vendor 8', }, { title: 'Item 9', vendor: 'Vendor 9', }, { title: 'Item 10', vendor: 'Vendor 10', },]

  },
  computed: {
    groupedAndSortedResults() {
      const groupedResults = this.groupResultsByImage(this.results);
      for (let image in groupedResults) {
        groupedResults[image].sort(this.compareConfigs);
      }
      return groupedResults;
    }
  },
  methods: {
    groupResultsByImage(results) {
      return results.reduce((grouped, result) => {
        if (!grouped[result.image]) {
          grouped[result.image] = [];
        }
        grouped[result.image].push(result);
        return grouped;
      }, {});
    },
    compareConfigs(a, b) {
      // Comparison logic goes here
      // You can access a.config and b.config
      return a.config.gm.sharpen - b.config.gm.sharpen; // example
    }
  }
}
</script>
