const axios = require('./rateLimitedAxios.js')
const fs = require('fs')
const gm = require('gm').subClass({ imageMagick: true })
const { createWorker, OEM, PSM, setLogging } = require('tesseract.js')

setLogging(false)

const { getCannabinoidObjCannalyze, getCannabinoidObj, getCannabinoidObj2, getTerpeneObj } = require('./strings.js')

function getImageInfo(url) {
  
  return {fileSize, lastModified, width, height }

}

async function recognize (url) {

  try {
 
    const buffer = await getImageBuffer(url);

    const possiblySaveImage = possiblySaveImage(name, buffer)

    // const assay = await getAssay(buffer)

    const worker = await getWorker(4);
    
    const result = await worker.recognize(buffer, configFirstLook);

    console.log(`RECOGNIZE RETURN: ${JSON.stringify(result.data.text, null, 2)} url: ${url}\n\n `);

    fs.appendFileSync('./temp/text.txt', `${JSON.stringify(result.data.text, null, 2)}\n${url} \n\n`)  

    if (['certificate','analysis','consolidated'].some(word => result.data.text.toLowerCase().includes(word))) {
      console.log('----- Is Assay -----')

      if (url.toLowerCase().includes('canna')) {

        console.log('----- Assuming cannabinoids -----')

        const result = await worker.recognize(buffer, configCannalyzeCannabinoids)

        const textArray = result.data.text.split('\n')

        for (const text of textArray) {
          if (text.split && text.split(' ').length === 4) {
            const line = getCannabinoidObjCannalyze(text, url)

            if (line && line.name === 'Unknown') {
              fs.appendFileSync('unknownCannabinoidSpellings.txt', `URl: ${url}\n${JSON.stringify(text, null, 2)}\n${url}\nnconfigCannalyzeCannabinoids\n\n`)
            }
            else {
              cannabinoids.push(line)
            }
          }
        }

        if (cannabinoids.length) {
          cannabinoids.sort((a, b) => b.pct - a.pct)

          return { cannabinoids }
        }
      }
    }

    if (['terps', 'terpene'].some(word => result.data.text.toLowerCase().includes(word))) {

      console.log('----- Is Assay -----')

      if (url.toLowerCase().includes('canna')) {

        console.log('----- Assuming cannabinoids -----')

        const result = await worker.recognize(buffer, configCannalyzeCannabinoids)

        const textArray = result.data.text.split('\n')

        for (const text of textArray) {
          if (text.split && text.split(' ').length === 4) {
            const line = getCannabinoidObj(text, url)

            if (line && line.name === 'Unknown') {
              fs.appendFileSync('unknownCannabinoidSpellings.txt', `URl: ${url}\n${JSON.stringify(text, null, 2)}\n${url}\nnconfigCannalyzeCannabinoids\n\n`)
            }
            else {
              cannabinoids.push(line)
            }
          }
        }

        if (cannabinoids.length) {
          cannabinoids.sort((a, b) => b.pct - a.pct)

          return { cannabinoids }
        }
      }
    }
  }

  catch (error) {

    console.error(`Error in recognize: ${error}: ${url}`)

    fs.appendFileSync('./temp/errors.txt', `\nReached end with no assay\n${JSON.stringify(error, null, 2)}\n\n`)
    
  }
}

const getWorker = async (PSM = 6) => {

  try {

    const worker = await createWorker("eng", 1, {
      user_patterns_file: './tessdata/eng.user-patterns',
      "tessdata-dir": './tessdata',
      userPatterns: './tessdata/eng.user-patterns',
      errorHandler: (err) => { console.error('Error:', err) },
    })

    await worker.loadLanguage('eng');

    await worker.initialize('eng');

    await worker.setParameters({
      tessedit_pageseg_mode: PSM,
    });

    return worker

  } catch (error) {

    console.error('Error in getWorker:', error)

    fs.appendFileSync('./temp/errors.txt', `\nError in getWorker\n${JSON.stringify(error, null, 2)}\n\n`)

    return null
  }

}

/*
async function lookForAnything(url) {

  try {

    const worker = await getWorker(6)

    const jpgBuffer = await getImageBuffer(url)

    if (!jpgBuffer) {
      console.log('skipping empty', url)
      fs.appendFileSync('./temp/errors.txt', `\ngetImageBuffer\nNo image buffer\n${url}\n\n`)
      return null
    }

    const terpenes = []

    const cannabinoids = []
  } catch (error) {
    console.log('Error in lookForAnything:', error)
    fs.appendFileSync('./temp/errors.txt', `\nError in lookForAnything\n${JSON.stringify(error, null, 2)}\n\n`)
    return null
  }
}
*/
/*
async function lookForTerpenes(url) {


    let title

    try {

    if (url.toLowerCase().includes('ertificate')) {

      if (url.toLowerCase().includes('cannabinoids')) {

        console.log('----- cannabinoids -----')

        title = await worker.recognize(jpgBuffer, configCannalyzeCannabinoidsTitle)

        console.log('----- Cannazyze cannabinoids -----')

        const result = await worker.recognize(jpgBuffer, configCannalyzeCannabinoids)

        const textArray = result.data.text.split('\n')

        for (const text of textArray) {
          if (text.split && text.split(' ').length === 4) {
            const line = getCannabinoidObjCannalyze(text, url)

            if (line && line.name === 'Unknown') {
              fs.appendFileSync('unknownCannabinoidSpellings.txt', `URl: ${url}\n${JSON.stringify(text, null, 2)}\n${url}\nnconfigCannalyzeCannabinoids\n\n`)
            }
            else {
              cannabinoids.push(line)
            }
            
          }
        }

        await worker.terminate()

        cannabinoids.sort((a, b) => b.pct - a.pct)

        return { cannabinoids }
      } else {
        
        console.log('----- Cannazyze terpenes -----')

        const result = await worker.recognize(jpgBuffer, configCannalyzeCannabinoids)

        const textArray = result.data.text.split('\n')

        for (const text of textArray) {
          if (text.split && text.split(' ').length === 4) {
            const line = getTerpeneObj(text, url)

            if (line && line.name === 'Unknown') {
              fs.appendFileSync('./temp/unknownCannabinoidSpellings.txt', `URl: ${url}\n${JSON.stringify(text, null, 2)}\n${url}\nnconfigCannalyzeCannabinoids\n\n`)
            }
            else {
              terpenes.push(line)
            }
            

            
          }
        }

        await worker.terminate()

        terpenes.sort((a, b) => b.pct - a.pct)

        return { cannabinoids }
      }
    }

    title = await worker.recognize(jpgBuffer, configWNCCannabinoidsTitle)

    if (title.data.text.toLowerCase().includes('cannabinoids')) {
      console.log('----- cannabinoids -----')

      const result = await worker.recognize(jpgBuffer, configWNCCannabinoids)

      const textArray = result.data.text.split('\n')

      for (const text of textArray) {
        const line = getCannabinoidObj(text, url)

        if (line && line.name === 'Unknown') {
          fs.appendFileSync('./temp/unknownCannabinoidSpellings.txt', `URl: ${url}\n${JSON.stringify(text, null, 2)}\n${url}\configWNCCannabinoids\n\n`)
        }
        else {
          cannabinoids.push(line)
        }

      }

      await worker.terminate()

      cannabinoids.sort((a, b) => b.pct - a.pct)

      return { cannabinoids }
    }

    title = await worker.recognize(jpgBuffer, configWNCCannabinoidsTitle2)

    if (title.data.text.toLowerCase().includes('cannabinoids')) {
      console.log('----- cannabinoids 2 -----')

      const result = await worker.recognize(jpgBuffer, configWNCCannabinoids2)

      const textArray = result.data.text.split('\n')

      for (const text of textArray) {

        const line = getCannabinoidObj2(text, url)

        if (line && line.name === 'Unknown') {
          fs.appendFileSync('./temp/unknownCannabinoidSpellings.txt', `URl: ${url}\n${JSON.stringify(text, null, 2)}\n${url}\configWNCCannabinoids2\n\n`)
        }
        else {
          cannabinoids.push(line)
        }
        
      }

      await worker.terminate()

      cannabinoids.sort((a, b) => b.pct - a.pct)

      return { cannabinoids }
    }

    title = await worker.recognize(jpgBuffer, configWNCTerpenesTitle)

    if (title.data.text.toLowerCase().includes('terpenes')) {
      console.log('made it to terpenes:', url)
      console.log('----- terpenes -----')

      const result = await worker.recognize(jpgBuffer, configWNCTerpenes)

      const textArray = result.data.text.split('\n')

      for (const text of textArray) {
        const line = getTerpeneObj(text, url)

        if (line && line.name === 'Unknown') {
          fs.appendFileSync('unknownTerpinoidSpellings.txt', `URl: ${url}\n${JSON.stringify(text, null, 2)}\n${url}\nconfigWNCTerpenesTitle\n\n`)
        }
        else {
          terpenes.push(line)
        }
      }

      terpenes.sort((a, b) => b.pct - a.pct)

      return { terpenes }
    }

    await worker.terminate()

    fs.appendFileSync('./temp/errors.txt', `\nUrl: ${url}\nNo assay found\n\n`)
   
   } catch (error) {

    console.error(`Error in recognize: ${error}: ${url}`)

    fs.appendFileSync('./temp/errors.txt', `\nUrl: ${url}\n${JSON.stringify(error, null, 2)}\n\n`)

    return null
  }
}

*/

function makeImageName(url) {
  const name = jpgNameFromUrl(url)

  const domain = url.split('/')[2] ? url.split('/')[2] : 'unknown'
  return `${domain}_${name}`
}

const configFirstLook = {
  rectangle: { top: 222, left: 1217, width: 1648, height: 777 }
}

const configCannalyzeCannabinoidsTitle = {
  rectangle: { top: 170, left: 1923, width: 1852, height: 460 }
}

const configCannalyzeCannabinoids = {
  rectangle: { top: 1410, left: 322, width: 3411, height: 2362 }
}

const configWNCTerpenesTitle = {
  rectangle: { top: 1265, left: 252, width: 420, height: 420 }
}

const configWNCTerpenes = {
  rectangle: { top: 1722, left: 320, width: 1939, height: 1361 }
}

const configWNCCannabinoidsTitle = {
  rectangle: { top: 2042, left: 109, width: 731, height: 253 }
}

const configWNCCannabinoids = {
  rectangle: { top: 2471, left: 202, width: 3094, height: 1744 }
}

const configWNCCannabinoidsTitle2 = {
  rectangle: { top: 1522, left: 86, width: 621, height: 313 }
}

const configWNCCannabinoids2 = {
  rectangle: { top: 1756, left: 108, width: 3181, height: 1556 }
}

const jpgNameFromUrl = (url) => {
  const split = url.split('/')
  const last = split[split.length - 1]
  const split2 = last.split('?')
  return split2[0]
}

async function getImageBuffer(url) {
  try {
    let response;
    let buffer;

    if (url.startsWith('http')) {
        response = await axios.get(url, { responseType: 'arraybuffer' });
        buffer = Buffer.from(response.data, 'binary');
    }
    else {
      buffer = fs.readFileSync(url);
    }

    // check if buffer is empty
    if (!buffer || buffer.length === 0) {
      console.log('skipping empty', url)
      fs.appendFileSync('./temp/no-buffer.txt', `\ngetImageBuffer\nNo image buffer\n${url}\n\n`)
      process.exit()
    }



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
            console.log(`Resized image buffer`);
            resolve(resizedBuffer);
          }
        });
    });
  } catch (error) {
    console.error(`Error getting or processing JPG: ${error}`);
    fs.appendFileSync('./temp/errors.txt', `\nUrl: ${url}\n${JSON.stringify(error, null, 2)}\n\n`)
    process.exit(0)
  }
}

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

module.exports = {
  recognize
}
