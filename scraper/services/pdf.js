const fs = require('fs');
const axios = require('axios');
// todo: use something else?
const pdf = require('pdf-parse');
const { transcribeAssay } = require('./cortex.js')

async function readPDF(url) {

  const buffer = await returnPDFBuffer(url);
  const text = readPDF(buffer);
  const fixedText = insertSpaces(text);
  const assays = transcribeAssay(fixedText);

}

function insertSpaces(input) {

  // Find numbers with three decimal places or sequences of numbers and periods
  const regex = /(\d+\.\d{3})|(\d+)/g;

  // Extract all numbers and periods from the input string
  let matches = input.match(regex);

  // If there are no matches, return the input as is
  if (!matches) {
    return input;
  }

  // Filter and process matches to ensure correct decimal places
  matches = matches.map(match => {
    // Reformat numbers to ensure three decimal places if they are floating numbers
    if (match.includes('.')) {
      const parts = match.split('.');
      if (parts[1].length > 3) {
        return parseFloat(match).toFixed(3);
      }
    }
    return match;
  });

  // Reconstruct the string with proper spacing around numbers
  let result = input.split(regex).reduce((acc, current, i) => {
    // Alternate between text and numbers, adding numbers from the matches array
    if (i % 2 === 0) {
      return acc + current;
    } else {
      // Ensure spacing around numbers
      return acc + (acc && acc.slice(-1) !== ' ' ? ' ' : '') + matches.shift() + ' ';
    }
  }, '');

  // Trim the result to remove any leading or trailing spaces
  result = result.trim();

  // Log the transformation for verification
  console.log("Transformed:", result);

  return result;
}


function returnPDFBuffer(url) {
  console.log('url', url)
  return new Promise((resolve, reject) => {
    axios.get(url, { responseType: 'arraybuffer' })
      .then(response => {
        pdf(response.data)
          .then(data => resolve(data.text))
          .catch(error => reject(error));  // Handle errors from pdf()
      })
      .catch(error => reject(error));  // Handle errors from axios.get()
  })
}

async function addPDFtext(urls) {
  const results = [];

  try {
    for (const url of urls) {
      console.log('url', url)
      const result = await returnPDFBuffer(url.url);
      const fixedResult = insertSpaces(result);
      const assay = transcribeAssay(fixedResult);
      console.log('assay', assay)
      results.push(...url, assay);
    }
  }
  catch (error) {
    console.log('error', error)
  }

  return results;
}

async function addAssays(pdfObjs) {
  const withAssays = [];
  for (const pdf of pdfObjs) {

    withAssays.push({
      ...pdf,
      assay: assay,
      dateCrawled: new Date()
    })
  }
  return withAssays;
}

module.exports = {
  readPDF,
  addAssays
}