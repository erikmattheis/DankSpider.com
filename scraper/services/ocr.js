const axios = require('./rateLimitedAxios.js')
const fs = require('fs')
const gm = require('gm').subClass({ imageMagick: true })
const { createWorker, OEM, PSM, setLogging } = require('tesseract.js')

setLogging(false)

const { getCannabinoidObjCannalyze, getCannabinoidObj, getCannabinoidObj2, getTerpeneObj } = require('./strings.js')

async function recognize (url) {

  if (!url) {
    fs.appendFileSync('./temp/vendors/errors.txt', `\nNo Image at Url: ${url}\n\n`)
    return  null;
  }
  try {

    const worker = await createWorker("eng", 1, {
      user_patterns_file: './tessdata/eng.user-patterns',
      "tessdata-dir": './tessdata',
      userPatterns: './tessdata/eng.user-patterns',
      errorHandler: (err) => { console.error('Error:', err) },
    })

   // console.log('recognizing', Object.keys(worker))

    await worker.loadLanguage('eng');

    await worker.initialize('eng');

    await worker.setParameters({
      tessedit_pageseg_mode: 4,
    });

    const jpgBuffer = await getAndProcessJpg(url)

    if (!jpgBuffer) {
      console.log('skipping empty', url)
      await worker.terminate()

      fs.appendFileSync('./temp/vendors/errors.txt', `\ngetAndProcessJpg\nNo image buffer\n${url}\n\n`)

      return null
    }

    const name = jpgNameFromUrl(url)

    // get domain from url
    // const domain = url.split('/')[2] ? url.split('/')[2] : 'unknown'

    //fs.writeFileSync(`.temp/vendors/scan/${domain}-${name}`, jpgBuffer)

    const terpenes = []

    const cannabinoids = []

    let title

    if (url.toLowerCase().includes('ertificate')) {
      console.log('Cannazyze')

      if (url.toLowerCase().includes('cannabinoids')) {
        title = await worker.recognize(jpgBuffer, configCannalyzeCannabinoidsTitle)

        console.log('----- Cannazyze cannabinoids -----')

        const result = await worker.recognize(jpgBuffer, configCannalyzeCannabinoids)

        const textArray = result.data.text.split('\n')
        console.log('textArray', JSON.stringify(textArray, null,2))
console.log('texturlArray',url)
process.exit('halt')
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
              fs.appendFileSync('./temp/vendors/unknownCannabinoidSpellings.txt', `URl: ${url}\n${JSON.stringify(text, null, 2)}\n${url}\nnconfigCannalyzeCannabinoids\n\n`)
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
          fs.appendFileSync('./temp/vendors/unknownCannabinoidSpellings.txt', `URl: ${url}\n${JSON.stringify(text, null, 2)}\n${url}\configWNCCannabinoids\n\n`)
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
          fs.appendFileSync('./temp/vendors/unknownCannabinoidSpellings.txt', `URl: ${url}\n${JSON.stringify(text, null, 2)}\n${url}\configWNCCannabinoids2\n\n`)
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

    console.log('reached end!!!!!!!!!!!:', url)

    fs.appendFileSync('reached-end.txt', `URl: ${url}\n\n`)


  } catch (error) {

    console.error(`Error in recognize: ${error}: ${url}`)

    fs.appendFileSync('./temp/vendors/errors.txt', `\nUrl: ${url}\n${JSON.stringify(error, null, 2)}\n\n`)

    return null
  }
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
  rectangle: { top: 2471, left: 292, width: 2764, height: 1744 }
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

async function gmToBuffer (data) {
  try {
    const chunks = []
    const stream = data.stream()
    stream.on('data', (chunk) => { chunks.push(chunk) })

    return await new Promise((resolve, reject) => {
      stream.on('end', () => { resolve(Buffer.concat(chunks)) })
      stream.on('error', (err) => { reject(err) })
    })
  } catch (error) {
    console.error(`Failed to convert image to buffer: ${error}`)
    fs.appendFileSync('./temp/vendors/errors.txt', `\nUrl: ${url}\n${JSON.stringify(error, null, 2)}\n\n`)
    return null
  }
}

async function getAndProcessJpg(url) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');

    return new Promise((resolve, reject) => {
      gm(buffer)
        .resize(4000, 4000)
        .toBuffer('JPG', function (err, resizedBuffer) {
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
    fs.appendFileSync('./temp/vendors/errors.txt', `\nUrl: ${url}\n${JSON.stringify(error, null, 2)}\n\n`)
  }
}

  /*
const getAndProcessJpg = async (url) => {
  try {

    const response = await axios.get(url, { responseType: 'arraybuffer' })

    if (response.status !== 200) {
      console.log(`Failed to download image 1`);
      fs.appendFileSync('./temp/vendors/errors.txt', `\nNo image buffer\n${url}\n\n`)
      return null
    }

    const contentType = response.headers['content-type']

    if (contentType !== 'image/jpeg') {
      console.log(`Converting content type: ${contentType}`);
      try {
        const buffer = gm(response.data).toBuffer('JPEG')
          console.log(buffer)
          process.exit();
        return
      }
      catch {
        console.log(`Failed to convert content type: ${contentType}`);
        fs.appendFileSync('./temp/vendors/errors.txt', `\nNo image buffer\n${url}\n\n`)
        return null
      }
    }

    const jpgName = jpgNameFromUrl(url)

    const jpgBuffer = gm(response.data, jpgName)
    return new Promise((resolve, reject) => {
      gm(response.data)
        .quality(100)
        .resize(4000)
        .sharpen(5, 5)
        .setFormat('jpeg')
        .toBuffer('JPEG', (err, buffer) => {
          if (err) {
            reject(err);
          } else {
            resolve(buffer);
          }
        });
    });
    //const jpgBuffer = await gmToBuffer(gmResponse)
    
  }
  catch (error) {
    console.error('Failed to process image 2', error)

    

    return null
  */

module.exports = {
  recognize
}
