<template>
    <v-form ref="form">
        <template v-for="attribute in productModel.attributes"
          :key="attribute.name">
            <!-- Handle string and number types -->
            <v-text-field v-if="!Array.isArray(attribute.value)"
              v-model="attribute.value"
              :label="`Enter ${attribute.name}`">
            </v-text-field>

            <!-- Handle array types (e.g., select or checkboxes for multiple options) -->
            <v-select v-else
              :items="attribute.value"
              v-model="attribute.selected"
              multiple
              :label="`Select ${attribute.name}`">
            </v-select>
        </template>
    </v-form>
</template>

<script setup>
import { ref, reactive } from 'vue'

// Simulate receiving and transforming backend product data
const backendProductData = reactive({
    name: "Example Product",
    attributes: [
        {
            name: "Terpenes",
            value: ['a', 'b', 'c']
        }
        // Add other attributes as needed
    ]
});

// Transform the backend data to include a 'selected' field for array types
const productModel = backendProductData.attributes.map(attribute => {
    if (Array.isArray(attribute.value)) {
        return {
            ...attribute,
            selected: [] // Initialize with empty array for multiple selections
        };
    }
    return attribute;
});

</script>