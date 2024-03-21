
export { data } 

import fetch from 'node-fetch'
import logger from '../../services/logger'

async function data(pageContext) {
    try {
        const response = await fetch('http://localhost:3000/data/products.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const products = await response.json().products;
        return {
            products
        }

    } catch (error) {
        logger.error('Failed to fetch products', error)
        return {
            products: []
        }
    }
}