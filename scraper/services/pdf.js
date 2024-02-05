const fs = require('fs');
const axios = require('axios');
// todo: use something else?
const pdf = require('pdf-parse');
const { transcribeAssay } = require('./cortex.js');
const { saveAssays } = require('./firebase.js');

async function readPDF(url) {

  const buffer = await returnPDFBuffer(url);
  console.log('buffer', buffer.length)
  const fixedText = insertSpaces(buffer);
  console.log('fixedText', fixedText.length)
  const assay = transcribeAssay(fixedText);
  console.log('assay', assay.length)

  await saveAssays('PPM', assay);

}

function insertSpaces(input) {

  // Find numbers with three decimal places or sequences of numbers and periods
  const regex = /(\d+\.\d{3})|(\d+)/g;
  if (!input?.match) {
    console.log('no match function!', input)
    return;
  }
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

async function addAssays(pdfObjs) {
  const withAssays = [];
  for (const pdf of pdfObjs) {

    const assay = transcribeAssay(pdf.text);

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