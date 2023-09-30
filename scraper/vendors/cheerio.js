const cheerio = require('cheerio');

const html = `
  <html>
    <body>
      <h1>Hello, World!</h1>
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
      </ul>
      <div>
      <ul>
        <li>Item xxx</li>
      </ul>
      </div>
    </body>
  </html>
`;

const $ = cheerio.load(html);

const title = $('h1').text();
const items = $('li').map((i, el) => $(el).text()).get();

console.log(title);
console.log(items);