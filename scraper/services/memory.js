const gm = require("gm");
const fs = require("fs");

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

async function getImageBuffer(url) {

  try {


    let response;
    let buffer;


    if (url.startsWith('http')) {

      response = await axios.get(url, { responseType: 'arraybuffer' });
      buffer = Buffer.from(response.data, 'binary');

    } else {

      buffer = fs.readFileSync(url);

    }


    if (!buffer || buffer.length === 0) {

      console.log('skipping empty', url)

      fs.appendFileSync('./temp/no-buffer.txt', `\ngetImageBuffer\nNo image buffer\n${url}\n\n`)

    }

    console.log('resolved getImageBuffer')

    return new Promise((resolve, reject) => {

      gm(buffer)

        .quality(100)
        .resize(4000)
        .sharpen(5, 5)
        .toBuffer('JPEG', function (err, resizedBuffer) {

          if (err) {

            console.error(`Error resizing image: ${err}`);
            reject(err);

          } else {

            resolve(resizedBuffer);

          }

        });

    });

  } catch (error) {

    console.error(`Error around getImageBuffer: ${error}`);

    fs.appendFileSync('./temp/errors.txt', `\nUrl: ${url}\n${JSON.stringify(error, null, 2)}\n\n`)

  }

}


module.exports = {
  getBuffer
}