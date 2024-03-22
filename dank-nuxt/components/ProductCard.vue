<template>
    <v-card-text>
        <v-list v-for="attribute in product.attributes">
            <v-list-item v-for="entry in attribute.value">
                <v-list-item-title>{{ entry.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ entry.pct }}</v-list-item-subtitle>
            </v-list-item>
        </v-list>
    </v-card-text>
</template>

<script setup>
import { ref } from 'vue';

const product = defineProps({
    prop: Object
});

</script>
