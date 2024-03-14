// +Page.server.js

export async function onBeforePrerender({ pageProps, pageContext }) {

  console.log('onBeforeRender', { pageProps, pageContext })

  let products;

  try {
    const response = await axios.get('/data/products.json');
    products = response.data?.products || [];

    console.log('Fetched products:', products.length);

  return {
      pageContext: {
        products,
      },
    };
  } catch (error) {
    return {
      pageProps: { // Make sure to return an error state or handle accordingly
        error: 'Failed to fetch data',
      },
    };
  }
}