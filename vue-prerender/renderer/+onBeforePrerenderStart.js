// +onBeforePrerenderStart.js
import logger from '../services/logger';

export async function onBeforePrerenderStart() {
    console.log('onBeforePrerenderStart');  

  // Return an array containing the root URL
  return ['/'];
}