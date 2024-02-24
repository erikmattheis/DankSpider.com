const fs = require('fs');
const axios = require('axios');
// todo: use something else?
const pdf = require('pdf-parse');
const { transcribeAssay, cannabinoidNameList, terpeneNameList } = require('./cortex.js');

async function readPDFs(pdfs) {

  const results = [];

  for await (const pdf of pdfs) {
    const result = await readPDF(pdf.url, pdf.name)

    results.push(result)
  }

  return results
}

function fixText(str) {
  let fixedText = insertSpaces(str);
  fixedText = fixedText.replace(" -", "-");
  return fixedText;
}

async function readPDF(url, name) {

  const buffer = await returnPDFBuffer(url);

  const fixedText = fixText(buffer);

  const assay = transcribeAssay(fixedText);

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

  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const data = await pdf(response.data);
    return data.text;
  } catch (error) {
    throw error;
  }
}

async function addAssays(pdfObjs, url, vendor) {
  const withAssays = [];
  for (const pdf of pdfObjs) {

    const result = await transcribeAssay(pdf.text, url, vendor); if (result.length) {

      if (cannabinoidNameList.includes(result[0].name)) {
        cannabinoids = result.filter(a => cannabinoidNameList.includes(a.name))
      }
      if (terpeneNameList.includes(result[0].name)) {
        terpenes = result.filter(a => terpeneNameList.includes(a.name))
      }
      if (terpenes.length && cannabinoids.length) {
        break;
      }

    }


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