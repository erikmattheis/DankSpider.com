<template>
    <v-container fluid>
        <!-- Vue component that displays tabular data and is sortable descending triggered by a click to one of the header rows. data is {"chemicals":[{"name":"Oxygen","Type","Atomic Weight":80, "Atomic Number":22},{"name":"Oxygen","Type","Atomic Weight":80, "Atomic Number":22}]} -->

        <v-simple-table>
            <template v-slot:default>
                <thead>
                    <tr>
                        <th class="text-left">
         
                            Image
                        </th>
                        <th class="text-left">
                            <a href="#" @click.prevent="sort('results.cannabinoids.length')">
                            Cannabinoids</a>
                        </th>
                        <th class="text-left">
                            <a href="#" @click.prevent="sort('results.terpenes.length')">
                            Terpenes</a>
                        </th>
                        <th class="text-left">
                            <a href="#" @click.prevent="sort('config.tesseract.tessedit_pageseg_mode')">
                            Tessedit Pageseg Mode</a>   
                        </th>
                        <th class="text-left">
                            <a href="#" @click.prevent="sort('config.gm.sharpen')">
                            Sharpen</a>
                        </th>
                        <th class="text-left">
                            <a href="#" @click.prevent="sort('config.gm.resize')">
                            Resize</a>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in items" :key="item.name">
                        <td>{{ item.image }}</td>
                        <td>{{ item.result?.cannabinoids?.length }}</td>
                        <td>{{ item.result?.terpenes?.length }}</td>
                        <td>{{ item.config?.tesseract.tessedit_pageseg_mode }}</td>
                        <td>{{ item.config?.tesseract.tessedit_pageseg_mode }}</td>
                        <td>{{ item.config?.gm?.sharpen }}</td>
                        <td>{{ item.config?.gm?.resize }}</td>
                    </tr>
                </tbody>
            </template>
        </v-simple-table>
    </v-container>
</template>

<script>
import {results} from './test-results.json'

export default {
    name: 'SortedResultsTable',
    data() {
        return {
            items: results,
        }
    },
    mounted() {
        this.items.sort((a, b) => {
            if (a.image < b.image) {
                return -1;
            }
            if (a.image > b.image) {
                return 1;
            }
            return 0;
        });
    },
    methods: {
        sort(col) {
            this.items.sort((a, b) => {
                console.log('col', col)
                const keys = col.split('.');
                const aVal = keys.reduce((obj, key) => obj[key], a);
                const bVal = keys.reduce((obj, key) => obj[key], b);
                return aVal - bVal;
            })
        }
    }
}
</script>