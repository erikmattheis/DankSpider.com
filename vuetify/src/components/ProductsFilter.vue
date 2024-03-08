<template>
    <!-- two dropdowns cannabinoids and terpenes-->
    <v-row>
        <v-col cols="12" sm="6">
            <v-select
                v-model="selectedCannabinoid"
                :items="cannabinoids"
                label="Cannabinoids"
                multiple
                chips
                small-chips
                deletable-chips
                hint="Select one or more cannabinoids"
            ></v-select>
        </v-col>
        <v-col cols="12" sm="6">
            <v-select
                v-model="selectedTerpene"
                :items="terpenes"
                label="Terpenes"
                multiple
                chips
                small-chips
                deletable-chips
                hint="Select one or more terpenes"
            ></v-select>
        </v-col>
    </v-row>
</template>

<script>

export default {
    name: 'ProductFilter',
    data: () => ({
        selectedCannabinoid: [],
        selectedTerpene: [],
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
            this.$emit('cannabinoid-filter', newVal)
        },
        selectedTerpene: function (newVal, oldVal) {
            this.$emit('terpene-filter', newVal)
        }
    },
}

    

</script>