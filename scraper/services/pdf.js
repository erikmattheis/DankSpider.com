const fs = require('fs');
const axios = require('axios');
// todo: use something else?
const pdf = require('pdf-parse');
const { transcribeAssay } = require('./cortex.js');

async function readPDFs(pdfs) {

  const results = [];

  for (const pdf of pdfs) {
    console.log('reading', pdf)
    const result = await readPDF(pdf.url, pdf.name)

    results.push(result)
  }

  return results
}

async function readPDF(url, name) {

  const buffer = await returnPDFBuffer(url);
  console.log('buffer', buffer.length);
  const fixedText = insertSpaces(buffer);
  console.log('fixedText', fixedText.length)
  const assay = transcribeAssay(fixedText);
  console.log('assay final', assay.length);

  return {
    url,
    name,
    assay
  }

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
    if (match.includes('.')) {
      const parts = match.split('.');
      parts[1] = parts[1].padEnd(3, '0');
      return parts.join('.');
    } else {
      return match;
    }
  });

  // Replace each match in the input string with the corresponding processed match
  return input.replace(regex, () => {
    const nextMatch = matches.shift();
    return nextMatch ? ' ' + nextMatch + ' ' : '';
  }).trim();
}

async function returnPDFBuffer(url) {
  console.log('returnPDFBuffer', url);
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const data = await pdf(response.data);
    return data.text;
  } catch (error) {
    throw error;
  }
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
  readPDFs,
  readPDF,
  addAssays
}