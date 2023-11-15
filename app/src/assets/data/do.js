const fs = require('fs');
const chemicals = JSON.parse(fs.readFileSync('./chemicals.json', 'utf8'));

chemicals.forEach(chemical => {
  const match = chemical.article.match(/<body>([\s\S]*?)<\/body>/i);
  if (match && match[1]) {
    chemical.article = match[1];
  }
});

fs.writeFileSync('./chemicals2.json', JSON.stringify(chemicals, null, 2));