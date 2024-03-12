import axios from 'axios';

export async function addPageContext(pageContext) {
  const response = await axios.get('/assets/data');
  const items = response.data;

  return {
    // Pass the items to the pageContext
    pageContext: {
      ...pageContext,
      items,
    },
  };
}