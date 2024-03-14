<template>
    <!-- two dropdowns cannabinoids and terpenes-->
    <v-row>
        <v-col cols="12" sm="6">
            <v-select
                v-model="selectedCannabinoid"
                :items="cannabinoids"
                label="Cannabinoids"
                hint="Sort by cannabinoid"
            ></v-select>
        </v-col>
        <v-col cols="12" sm="6">
            <v-select
                v-model="selectedTerpene"
                :items="terpenes"
                label="Terpenes"
                hint="Sort by terpenes"
            ></v-select>
        </v-col>
    </v-row>
</template>

<script>

export default {
    name: 'ProductFilter',
    data: () => ({
        selectedCannabinoid: ['THC'],
        selectedTerpene: ['Limonene'],
        cannabinoids: [
            'THC',
            'CBD',
            'CBN',
            'CBC',
            'THCV',
            'CBDV',
            'CBG',
            'CBGA',
            'CBDA',
            'THCA'],
        terpenes: [
            'Myrcene',
            'Limonene',
            'Caryophyllene',
            'Pinene',
            'Linalool',
            'Humulene',
            'Ocimene',
            'Terpinolene',
            'Bisabolol',]
    }),
    watch: {
        selectedCannabinoid: function (newVal, oldVal) {
            console.log(newVal)
            this.$emit('set-cannabinoid-order', [newVal])
        },
        selectedTerpene: function (newVal, oldVal) {
            this.$emit('set-terpene-order', [newVal])
        }
    },
    methods: {

        // emit the selected cannabinoid
        // emit the selected terpene
    },

}

    

</script>