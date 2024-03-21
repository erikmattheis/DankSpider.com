<template>
    <div>
        <v-card>
            <v-card-title>
                <h1>Products</h1>
            </v-card-title>
            <v-card-text>
                <v-list>
                    <v-list-item v-for="product in products"
                      :key="product.id">
                        <v-list-item-title>{{ product.name }}</v-list-item-title>
                        <v-list-item-subtitle>{{ product.price }}</v-list-item-subtitle>
                    </v-list-item>
                </v-list>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
export default {
    data() {
        return {
            products: [
                { id: 1, name: 'Product 1', price: 100 },
                { id: 2, name: 'Product 2', price: 200 },
                { id: 3, name: 'Product 3', price: 300 },
            ]
        }
    }
}


</script>