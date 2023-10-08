const spellchecker = require('spellchecker');

const chemicalNames = [
  'Tetrahydrocannabinol',
  'Tetrahydrocannabinolic Acid',
  'Tetrahydrocannabivarin',
  'Cannabidiol',
  'Cannabigerol',
  'Cannabichromene',
  // Add more chemical names to the list as needed
];

function isChemicalName(text) {
  // Check if the text matches any chemical name in the list
  return chemicalNames.some((name) => text.includes(name));
}

function isNumber(text) {
  // Check if the text is a number
  return /^\d+(\.\d+)?$/.test(text);
}

function isPercentage(text) {
  // Check if the text is a percentage under 10%
  const value = parseFloat(text);
  return !isNaN(value) && value >= 0 && value < 10;
}

function correctMisspellings(text) {
  // Split the text into words
  const words = text.split(/\s+/);

  // Check each word for misspellings and correct them if possible
  const correctedWords = words.map((word) => {
    if (isChemicalName(word)) {
      // Check if the word is a chemical name
      return word;
    } else if (isNumber(word)) {
      // Check if the word is a number
      return word;
    } else if (isPercentage(word)) {
      // Check if the word is a percentage
      return word;
    } else if (spellchecker.isMisspelled(word)) {
      // Check if the word is misspelled
      const suggestions = spellchecker.getCorrectionsForMisspelling(word);
      if (suggestions.length > 0) {
        // Use the first suggestion as the corrected word
        return suggestions[0];
      }
    }
    // Return the original word if no corrections were made
    return word;
  });

  // Join the corrected words back into a string
  return correctedWords.join(' ');
}

function processOCRText(text) {
  // Correct misspellings in the text
  const correctedText = correctMisspellings(text);

  // Split the corrected text into lines
  const lines = correctedText.split('\n');

  // Filter out lines that do not contain a chemical name and a number
  const filteredLines = lines.filter((line) => {
    const words = line.split(' ');
    return words.some(isChemicalName) && words.some(isNumber);
  });

  // Filter out lines that have a percentage over 10%
  const finalLines = filteredLines.filter((line) => {
    const words = line.split(' ');
    const percentageIndex = words.findIndex(isPercentage);
    if (percentageIndex >= 0) {
      const percentage = parseFloat(words[percentageIndex]);
      return percentage < 10;
    }
    return true;
  });

  // Return the final lines as a string
  return finalLines.join('\n');
}

module.exports = {
  correctMisspellings
}