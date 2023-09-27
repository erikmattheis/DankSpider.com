const cv = require('opencv4nodejs');
const request = require('request');

// Download image from URL
const imageUrl = 'https://cdn11.bigcommerce.com/s-mpabgyqav0/images/stencil/1280x1280/products/217/1434/MilkyHaze1_2__77482.1682825949.jpg?c=1';
const imageBuffer = await new Promise((resolve, reject) => {
  request.get({ url: imageUrl, encoding: null }, (error, response, body) => {
    if (error) {
      reject(error);
    } else {
      resolve(body);
    }
  });
});

// Load image into OpenCV
const image = cv.imdecode(imageBuffer);

// Extract data from image
const data = extractDataFromImage(image);

console.log(data);