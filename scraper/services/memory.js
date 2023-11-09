const m = require("gm");

function jpgNameFromUrl(url) {
  const name = url.split('/').pop().split('#')[0].split('?')[0];
  return name.endsWith('.jpg') ? name : `${name}.jpg`;
}

async function getBuffer(url) {

  const name = makeImageName(url);

  const path = `./temp/${name}`;

  if (fs.existsSync(`./temp/${name}`)) {
    buffer = await getImageBuffer(path);
    console.log('Got image from file', name);
  }
  else {
    buffer = await getImageBuffer(url);
    fs.writeFileSync(path, buffer);
    console.log('Got image from url', url);
  }

}

function makeImageName(url) {
  const name = jpgNameFromUrl(url)

  const domain = url.split('/')[2] ? url.split('/')[2] : 'unknown'

  return `${domain}_${name}`
}

module.exports = {
  getBuffer
}